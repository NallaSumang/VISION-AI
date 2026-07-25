# Vision AI — Memory-Powered Chatbot

An AI chatbot with **persistent vector memory** and **image analysis** capabilities. Unlike standard chatbots that forget everything on refresh, Vision AI remembers facts about you across sessions using Pinecone vector search.

## ⚡ Key Features

- **Long-Term Memory** — Remembers user preferences and facts across sessions via Pinecone vector embeddings
- **Image Analysis** — Upload images for AI-powered visual analysis using Gemini's multimodal capabilities
- **Markdown Rendering** — Rich AI responses with code blocks, lists, and formatting
- **Memory Debug Log** — Transparent display of what the AI remembers about you and confidence scores

## 🏗️ Architecture

```
User → Next.js Frontend (Vercel) → FastAPI Backend (Render)
                                        ├── Pinecone (Vector Memory Search)
                                        └── Gemini 2.0 Flash (AI Response)
```

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | Next.js, React, Tailwind CSS | Chat UI with markdown rendering |
| Backend | Python, FastAPI | API server, memory retrieval, AI orchestration |
| AI Model | Google Gemini 2.0 Flash | Text generation + image understanding |
| Memory | Pinecone Vector DB | Semantic search over conversation history |

## 🚀 Setup

### Backend
```bash
cd backend
pip install -r requirements.txt
# Create .env with: GEMINI_API_KEY, PINECONE_API_KEY
python -m uvicorn brain:app --reload --port 8000
```

### Frontend
```bash
npm install
npm run dev
```

Open [http://localhost:3005](http://localhost:3005) to start chatting.

## 🔒 Security

- CORS locked to allowed origins (configurable via `ALLOWED_ORIGINS` env var)
- Rate limiting: 10 requests/minute per IP
- Input validation: max 5000 characters per message
- API keys stored in `.env` (gitignored)
