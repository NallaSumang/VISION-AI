import os
import time
import json
import base64
from pathlib import Path
from collections import defaultdict
from dotenv import load_dotenv
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator
from google import genai
from google.genai import types
from pinecone import Pinecone
import uvicorn

# --- 1. SETUP ---
backend_dir = Path(__file__).resolve().parent
env_path = backend_dir / ".env"
load_dotenv(dotenv_path=env_path)

API_KEY = os.getenv("GEMINI_API_KEY")
PINECONE_KEY = os.getenv("PINECONE_API_KEY")

try:
    client = genai.Client(api_key=API_KEY) if API_KEY else None
except Exception as e:
    print(f"⚠️ Warning: Gemini API initialization failed: {e}")
    client = None

try:
    pc = Pinecone(api_key=PINECONE_KEY) if PINECONE_KEY else None
    index = pc.Index("vision-memory") if pc else None
except Exception as e:
    print(f"⚠️ Warning: Pinecone initialization failed: {e}")
    pc = None
    index = None

MODEL_NAME = "gemini-3.6-flash"

app = FastAPI(title="Vision AI Backend")

# --- CORS: Allow all origins for production ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- RATE LIMITING: 10 requests per minute per IP ---
_rate_limit_store: dict[str, list[float]] = defaultdict(list)
RATE_LIMIT = 10
RATE_WINDOW = 60  # seconds

@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    client_ip = request.client.host if request.client else "unknown"
    now = time.time()
    # Clean old entries
    _rate_limit_store[client_ip] = [t for t in _rate_limit_store[client_ip] if now - t < RATE_WINDOW]
    if len(_rate_limit_store[client_ip]) >= RATE_LIMIT:
        raise HTTPException(status_code=429, detail="Too many requests. Please wait a minute.")
    _rate_limit_store[client_ip].append(now)
    return await call_next(request)


class ChatRequest(BaseModel):
    message: str
    image: str | None = None

    @field_validator("message")
    @classmethod
    def validate_message(cls, v: str) -> str:
        if len(v) > 5000:
            raise ValueError("Message too long. Maximum 5000 characters.")
        if not v.strip():
            raise ValueError("Message cannot be empty.")
        return v.strip()

@app.get("/history")
def get_history():
    history_file = backend_dir / "chat_history.json"
    if history_file.exists():
        try:
            with open(history_file, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print(f"Error reading history: {e}")
    return []

# --- 2. THE MEMORY FUNCTION ---


def retrieve_memory(query: str):
    print(f"🔍 Searching memory for: {query}")
    if not index or not client:
        return "", "\n⚠️ Memory offline: API keys missing."
        
    try:
        response = client.models.embed_content(
            model="gemini-embedding-2", 
            contents=query,
            config=types.EmbedContentConfig(output_dimensionality=768)
        )
        query_vector = response.embeddings[0].values
        results = index.query(vector=query_vector,
                              top_k=3, include_metadata=True)

        memories = ""
        debug_log = ""

        if results.get('matches'):
            for match in results['matches']:
                score = match['score']
                # Filter out irrelevant memories (threshold 25%)
                if score < 0.25:
                    continue
                    
                text = match['metadata']['text']
                debug_log += f"\n- Found: '{text}' ({int(score*100)}%)"
                memories += f"- {text}\n"
        else:
            debug_log = "\n- No memories found."

        return memories, debug_log
    except Exception as e:
        return "", f"\n⚠️ Error: {e}"

# --- 3. CHAT ENDPOINT ---

def append_to_history(user_text: str, ai_text: str, has_image: bool):
    history_file = backend_dir / "chat_history.json"
    history = []
    if history_file.exists():
        try:
            with open(history_file, "r", encoding="utf-8") as f:
                history = json.load(f)
        except Exception:
            pass
            
    # Format according to what the frontend expects
    user_parts = [{"text": user_text}]
    if has_image:
        user_parts.append({"text": "[User uploaded an image]"})
        
    history.append({
        "role": "user",
        "parts": user_parts
    })
    
    history.append({
        "role": "model",
        "parts": [{"text": ai_text}]
    })
    
    # Keep only last 100 messages (50 turns) to prevent file bloating
    history = history[-100:]
    
    try:
        with open(history_file, "w", encoding="utf-8") as f:
            json.dump(history, f, indent=2)
    except Exception as e:
        print(f"Error saving history: {e}")


@app.post("/chat")
def chat_endpoint(request: ChatRequest):
    print(f"📨 Incoming: {request.message}")

    # 1. Get Memory
    memory_text, debug_info = retrieve_memory(request.message)

    # 2. Build adaptive system instruction (separate from conversation turns)
    memory_block = (
        f"Relevant context from memory (weave in naturally, never say 'I remember'):\n{memory_text}"
        if memory_text else ""
    )

    system_instruction = f"""You are VISION AI — a sharp, context-aware assistant with multimodal intelligence and persistent memory.
You have full knowledge of this conversation — always refer back to earlier messages naturally.

RESPONSE CALIBRATION RULES (apply every reply):
- Casual / greeting / simple factual → 1-3 sentences max, conversational tone, NO bullet points
- Conversational / follow-up ("tell me more", "explain that", "why?") → build on the previous answer directly
- Technical / how-to / explanation → concise structured response, code blocks or numbered steps only when genuinely helpful
- Image analysis → precise visual observations + actionable insight, 3-6 sentences
- Complex multi-part / research question → well-organized with headers, lean — no padding or filler
- Math / calculation → show working briefly, give clear answer

NEVER pad a simple answer. NEVER lose context of what was just discussed.
Match the user's tone exactly (casual→casual, technical→precise).
Use markdown only when it genuinely aids clarity — not as decoration.

{memory_block}"""

    # 3. Load recent conversation turns for multi-turn context
    history_file = backend_dir / "chat_history.json"
    raw_history: list = []
    if history_file.exists():
        try:
            with open(history_file, "r", encoding="utf-8") as f:
                raw_history = json.load(f)
        except Exception:
            pass

    # Keep last 20 messages (= 10 turns) — enough context without blowing token budget
    recent = raw_history[-20:]
    
    # Gemini requires the conversation history to ALWAYS start with a 'user' turn.
    while recent and recent[0].get("role") != "user":
        recent.pop(0)

    # Convert history to Gemini typed Content objects
    contents: list[types.Content] = []
    for msg in recent:
        gemini_role = "user" if msg.get("role") == "user" else "model"
        text = ""
        if msg.get("parts") and isinstance(msg["parts"], list):
            text = " ".join(p.get("text", "") for p in msg["parts"] if p.get("text"))
        elif msg.get("content"):
            text = msg["content"]
        if text.strip():
            contents.append(
                types.Content(role=gemini_role, parts=[types.Part.from_text(text=text)])
            )

    # Build current turn parts (text + optional image)
    current_parts: list[types.Part] = [
        types.Part.from_text(text=request.message or "Analyze this image")
    ]
    if request.image:
        try:
            if "," in request.image:
                header, encoded = request.image.split(",", 1)
                mime_type = header.split(":")[1].split(";")[0]
            else:
                encoded = request.image
                mime_type = "image/jpeg"
            image_bytes = base64.b64decode(encoded)
            current_parts.append(types.Part.from_bytes(data=image_bytes, mime_type=mime_type))
        except Exception as e:
            print(f"⚠️ Error parsing image: {e}")
            return {"reply": "⚠️ Image processing failed. Could not read the uploaded file."}

    contents.append(types.Content(role="user", parts=current_parts))

    # 4. Get AI Reply — multi-turn with system instruction
    if not client:
        ai_reply = "⚠️ **API ERROR:** Gemini API key is missing. System offline."
    else:
        try:
            response = client.models.generate_content(
                model=MODEL_NAME,
                contents=contents,
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    max_output_tokens=2048,
                )
            )
            ai_reply = response.text
        except Exception as e:
            print(f"⚠️ API ERROR: {e}")
            ai_reply = f"⚠️ **API ERROR:** {e}"

    # 5. Save new turn to history
    append_to_history(request.message, ai_reply, bool(request.image))

    return {"reply": ai_reply}


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
