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

MODEL_NAME = "gemini-2.0-flash-lite-preview-02-05"

app = FastAPI(title="Vision AI Backend")

# --- CORS: Only allow your actual frontend domains ---
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:3005").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
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
            model="text-embedding-004", contents=query)
        query_vector = response.embeddings[0].values
        results = index.query(vector=query_vector,
                              top_k=3, include_metadata=True)

        memories = ""
        debug_log = ""

        if results.get('matches'):
            for match in results['matches']:
                # FORCE ACCEPT EVERYTHING for testing
                text = match['metadata']['text']
                score = match['score']
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

    # 2. Build Prompt
    final_prompt = f"""
    SYSTEM: You are a helpful assistant.
    Here is what you know about the user from their Long-Term Memory:
    {memory_text}
    
    USER: {request.message}
    """

    contents = [final_prompt]
    
    # Process image if provided
    if request.image:
        try:
            if "," in request.image:
                header, encoded = request.image.split(",", 1)
                mime_type = header.split(":")[1].split(";")[0]
            else:
                encoded = request.image
                mime_type = "image/jpeg"
                
            image_bytes = base64.b64decode(encoded)
            contents.append(types.Part.from_bytes(data=image_bytes, mime_type=mime_type))
        except Exception as e:
            print(f"⚠️ Error parsing image: {e}")
            full_reply = f"🧠 **MEMORY LOG:**\n⚠️ Image processing failed.\n\n🤖 **AI:**\nI could not read the uploaded image due to an encoding error."
            return {"reply": full_reply}

    # 3. Get AI Reply (WITH CRASH PROTECTION)
    if not client:
        ai_reply = "⚠️ **API ERROR:** Gemini API key is missing. System offline."
    else:
        try:
            response = client.models.generate_content(
                model=MODEL_NAME, contents=contents)
            ai_reply = response.text
        except Exception as e:
            print(f"⚠️ API ERROR: {e}")
            ai_reply = f"⚠️ **API ERROR:** {e}\n\nBUT... I successfully searched your memory! See the log above. ☝️"

    full_reply = f"🧠 **MEMORY LOG:**{debug_info}\n\n🤖 **AI:**\n{ai_reply}"

    # 4. Save to global history
    append_to_history(request.message, full_reply, bool(request.image))

    # 5. Return Visible Debug Info
    return {"reply": full_reply}


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
