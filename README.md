<div align="center">
  <h1>👁️ VISION-AI</h1>
  <p>A multimodal LLM engine with persistent local file-based memory.</p>
</div>

---

## 📖 Overview

**VISION-AI** is a robust computer vision and generative AI application combining a modern Next.js interface with a local Python processing engine. The system captures multimodal inputs, processes them via a local backend architecture, and serializes user interactions securely to disk.

## 🏗️ System Architecture

- **Frontend Interface:** Next.js application (`app/layout.tsx`, `app/page.tsx`) handling real-time multimodal user interactions.
- **Backend Engine:** A local Python daemon (`backend/main.py`, `backend/brain.py`) that processes LLM requests and image parsing.
- **Local State Persistence:** The application manages conversation state by writing directly to a local JSON file (`chat_history.json`).

*Note on Scalability:* This architecture is explicitly designed as a local-first application. Because state is managed via direct disk I/O (`chat_history.json`), deploying this to a serverless edge environment (e.g., AWS Lambda, Vercel) which utilizes ephemeral file systems will result in data loss upon container teardown. For horizontal scaling and edge deployment, this local JSON write must be swapped out for a persistent Redis cache or managed database.

## 🚀 Getting Started

### 1. Initialize the Python Backend
Ensure you have Python 3.11+ installed.
```bash
cd backend
pip install -r requirements.txt
python main.py
```

### 2. Launch the Next.js Frontend
In a new terminal window:
```bash
npm install
npm run dev
```

## 📜 License
Distributed under the MIT License.
