# VISION AI

A real-time AI memory engine utilizing Vector Embeddings for continuous conversation retrieval. Built from the ground up by Sumang.

## Architecture

This project separates the user interface from the heavy vector mathematical operations for optimal performance.
- **Frontend:** Next.js 15, TailwindCSS, React.
- **Backend:** FastAPI (Python).
- **Local State:** Uses a local `chat_history.json` to persist the immediate chat log for the frontend to restore upon reload.

## The Memory Engine (AI Models)

This repository operates using 2 specialized AI models working in tandem to simulate infinite memory:

1. **The Embedding AI (`text-embedding-004`):** 
   When a user sends a message, this model converts the raw text into a 768-dimensional mathematical vector. This vector is sent to a Pinecone Vector Database, which calculates cosine similarity to instantly find past conversations with the same mathematical meaning.
   
2. **The Reasoning AI (LLaMA 3.3 / Gemini):** 
   Once the Pinecone database retrieves the relevant past memories, this reasoning model processes the historical context alongside the new user prompt. This allows the AI to answer while referencing previous interactions, bypassing the standard token limit amnesia found in normal chatbots.

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
