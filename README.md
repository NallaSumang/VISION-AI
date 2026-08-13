<div align="center">
  <h1>👁️ VISION-AI</h1>
  <p>A multimodal AI engine with persistent vector memory and split cloud deployment.</p>
</div>

---

## 📖 Overview

**VISION-AI** is a multimodal generative AI application combining a Next.js frontend with a Python/FastAPI backend. The system captures text and image inputs, processes them through Google Gemini for inference, and persists conversational memory via Pinecone vector search for long-duration context retention.

## 🏗️ System Architecture

```
┌─────────────────────┐         ┌──────────────────────────┐
│   Next.js Frontend  │  HTTP   │   Python/FastAPI Backend  │
│   (Vercel)          │────────▶│   (Render: "my-ai-brain") │
│   Port 3005 (dev)   │         │                          │
└─────────────────────┘         │  ┌────────────────────┐  │
                                │  │ Google Gemini       │  │
                                │  │ (gemini-2.0-flash-  │  │
                                │  │  lite-preview)      │  │
                                │  └────────────────────┘  │
                                │  ┌────────────────────┐  │
                                │  │ Pinecone           │  │
                                │  │ (vision-memory idx) │  │
                                │  └────────────────────┘  │
                                │  ┌────────────────────┐  │
                                │  │ chat_history.json   │  │
                                │  │ (local file I/O)    │  │
                                │  └────────────────────┘  │
                                └──────────────────────────┘
```

- **Frontend Interface:** Next.js 16 application handling real-time multimodal user interactions (text + image upload). Deployed on **Vercel**.
- **Backend Engine:** Python FastAPI service (`backend/brain.py`) that processes LLM requests and image parsing. Deployed on **Render** as the `my-ai-brain` service.
- **AI Model:** Google Gemini (`gemini-2.0-flash-lite-preview-02-05`) via the `google-genai` SDK for text generation and image understanding.
- **Vector Memory:** Pinecone (`vision-memory` index) for persistent semantic memory across conversations — enabling long-duration context retention.
- **Local State:** Conversation history is also serialized to `chat_history.json` for local backup.

### ⚠️ Scalability Note

The `chat_history.json` file-based persistence works on Render's persistent disk but would fail on ephemeral serverless environments (AWS Lambda, Vercel Functions). The Pinecone vector store provides the durable memory layer for production.

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Next.js 16, React 19, TypeScript |
| **Backend** | Python 3.11, FastAPI, Uvicorn |
| **AI Model** | Google Gemini (`gemini-2.0-flash-lite-preview`) |
| **Vector DB** | Pinecone (`vision-memory` index) |
| **UI** | shadcn/ui (Radix), Tailwind CSS v4, Lucide icons |
| **Frontend Hosting** | Vercel |
| **Backend Hosting** | Render (`my-ai-brain`) |

## 🚀 Getting Started

### 1. Initialize the Python Backend
```bash
cd backend
pip install -r requirements.txt
python brain.py
```

### 2. Launch the Next.js Frontend
```bash
npm install
npm run dev
```

### 3. Environment Variables
Create `backend/.env`:
```env
GEMINI_API_KEY=<your-gemini-key>
PINECONE_API_KEY=<your-pinecone-key>
```

## 📜 License
Distributed under the MIT License.
