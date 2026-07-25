# 👁️ VISION AI: The Memory Engine
### Sumang's Signature Edition

Welcome to **VISION AI** — a Neural Memory Engine capable of remembering past conversations mathematically, wrapped in a breathtaking Cyberpunk Matrix aesthetic.

---

## ⚡ Core Architecture
This project is separated into two highly specialized tiers:
- **Frontend:** Next.js 15 + TailwindCSS. Features a beautifully animated Matrix data-falling background with a dynamic Markdown chat parser.
- **Backend Engine:** FastAPI (Python) running on Port 8000.
- **LLM Reasoning:** Google's `gemini-2.5-flash` / LLaMA 3.3 for lightning-fast inference.
- **Infinite Memory (RAG):** Pinecone Vector Database. Converts your text into mathematical vectors to instantly search for and inject past memories into the current conversation context.
- **State Restoration:** A local `chat_history.json` acts as a persistence layer to perfectly restore the UI chat bubbles when you refresh the page.

---

## 📚 Masterpiece Documentation
I have written an incredibly deep, file-by-file breakdown of exactly how this architecture works, why Python is essential for Pinecone Vector matching, and the CSS mathematics behind the Neural HUD.

You can find this complete technical guide locally in your repository at:
**`docs/VISION_AI_Masterpiece_Guide.md`**

*(Note: The Masterpiece Guide is configured in `.gitignore` and kept strictly local to your machine for your personal understanding.)*

---

## 🚀 How to Run

**1. Boot the Backend (Python)**
```bash
cd backend
pip install -r requirements.txt
python brain.py
```

**2. Boot the Frontend (Next.js)**
```bash
npm install
npm run dev
```

---
*Skillfully Designed and Architected by Sumang.*
