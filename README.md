# VISION AI

A real-time AI memory engine utilizing Vector Embeddings for conversation retrieval. Built from the ground up by Sumang.

## Architecture

This project separates the user interface from the heavy vector mathematical operations for optimal performance.

- **Frontend:** Next.js 15, TailwindCSS, React.
- **Backend:** FastAPI (Python).
- **LLM Reasoning:** Google `gemini-2.5-flash` / LLaMA 3.3.
- **Memory (RAG):** Pinecone Vector Database. Converts text into vector embeddings to retrieve semantically similar past conversations.
- **Local State:** Uses a local `chat_history.json` to persist the immediate chat log for the frontend to restore upon reload.

## How to Run

**1. Backend**
```bash
cd backend
pip install -r requirements.txt
python brain.py
```

**2. Frontend**
```bash
npm install
npm run dev
```
