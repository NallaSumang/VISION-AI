<div align="center">
  <h1>👁️ VISION-AI</h1>
  <p>A multimodal AI engine with persistent vector memory and split cloud deployment.</p>
</div>

---

## 📖 Overview

**VISION-AI** is a multi-modal generative AI application combining a Next.js frontend with a Python/FastAPI backend. The system captures text, images, and documents (PDF/CSV/JSON), processes them through Google's absolute latest Gemini models for high-speed inference, and persists conversational memory via a Pinecone vector database.

## 🏗️ System Architecture

```
┌─────────────────────┐         ┌──────────────────────────┐
│   Next.js Frontend  │  HTTP   │   Python/FastAPI Backend  │
│   (Vercel)          │────────▶│   (Render: "my-ai-brain") │
│   Port 3005 (dev)   │         │                          │
└─────────────────────┘         │  ┌────────────────────┐  │
                                │  │ Google Gemini       │  │
                                │  │ (gemini-3.6-flash,  │  │
                                │  │  gemini-embedding-2)│  │
                                │  └────────────────────┘  │
                                │  ┌────────────────────┐  │
                                │  │ Pinecone           │  │
                                │  │ (vision-memory idx) │  │
                                │  └────────────────────┘  │
                                │  │ Ephemeral Memory    │  │
                                │  │ (chat_history.json) │  │
                                │  └────────────────────┘  │
                                └──────────────────────────┘
```

- **Frontend Interface:** Next.js 16 application handling real-time multi-modal user interactions (text + image + document upload). Deployed on **Vercel**.
- **Backend Engine:** Python FastAPI service (`backend/brain.py`) with strict dependency pinning for deterministic deploys. Deployed on **Render** as the `my-ai-brain` service.
- **AI Model:** Google Gemini (`gemini-3.6-flash`) via the modern `google-genai` SDK for ultra-fast text, document, and image understanding.
- **Vector Memory:** Pinecone (`vision-memory` index) for persistent semantic memory. Embeddings use `gemini-embedding-2` scaled down elastically to 768-dimensions for legacy index compatibility.
- **Local State:** Ephemeral conversation history is serialized to `chat_history.json` (wiped cleanly between server reboots).

### ⚠️ Scalability Note

The `chat_history.json` file is explicitly removed from git tracking to prevent ghost data propagation. It acts purely as a temporary runtime state in Render's ephemeral environment, while Pinecone provides the permanent durable memory layer for production.

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Next.js 16, React 19, TypeScript |
| **Backend** | Python 3.11, FastAPI (Hard-pinned) |
| **AI Model** | Google Gemini (`gemini-3.6-flash`) |
| **Vector DB** | Pinecone (`gemini-embedding-2` @ 768d) |
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
