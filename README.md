<div align="center">
  <h1>👁️ VISION AI</h1>
  <p>A real-time AI memory engine utilizing Vector Embeddings for continuous conversation retrieval and state persistence.</p>
</div>

---

## ⚙️ Core Architecture

This project strictly separates the user interface from the heavy vector mathematical operations for optimal performance.

- **Frontend:** Next.js 15, TailwindCSS, React.
- **Backend:** FastAPI (Python).
- **LLM Reasoning:** Google `gemini-2.5-flash` / LLaMA 3.3.
- **Memory (RAG):** Pinecone Vector Database. Converts text into high-dimensional vector embeddings to retrieve semantically similar past conversations.
- **Local State:** Uses a local `chat_history.json` to persist the immediate chat log for the frontend to restore upon browser reload.

## 🤖 The Memory Engine (AI Models)

This repository operates using 2 specialized AI models working in tandem to simulate infinite memory without exceeding standard token limits:

1. **The Embedding AI (`text-embedding-004`):** 
   When a user sends a message, this model converts the raw text into a 768-dimensional mathematical vector. This vector is sent securely to a Pinecone Vector Database, which calculates cosine similarity to instantly find past conversations with the same mathematical meaning.
   
2. **The Reasoning AI (LLaMA 3.3 / Gemini):** 
   Once the Pinecone database retrieves the relevant past memories, this reasoning model processes the historical context alongside the new user prompt. This allows the AI to generate answers while referencing previous interactions, bypassing the amnesia found in traditional stateless chatbots.

---

## 🚀 Deployment & Usage

### 1. Initialize the Backend
```bash
cd backend
pip install -r requirements.txt
python brain.py
```

### 2. Launch the Frontend
```bash
npm install
npm run dev
```
