<div align="center">
  <img src="https://img.shields.io/badge/VISION-AI-0891B2?style=for-the-badge&logo=openai&logoColor=white" alt="VISION AI" />
  <h1>VISION AI: The Memory Engine</h1>
  <p><strong>Sumang's Signature Edition</strong></p>
</div>

<br />

## 🌟 Overview
VISION AI is not a standard chatbot. It is a **Neural Memory Engine** built for extreme speed and context awareness. Utilizing Google's cutting-edge **LLaMA 3.3** reasoning engine and a massive **Pinecone Vector Database**, this AI remembers everything you've ever discussed and retrieves it instantaneously to provide contextually flawless answers.

## ✨ Features
- 🧠 **Infinite Memory (Vector RAG):** Automatically parses, embeds, and stores every interaction inside a Pinecone vector database.
- ⚡ **Lightning Fast Generation:** Built entirely on top of the ultrafast LLaMA 3.3 architecture.
- 🎨 **Neural HUD Design:** Stripped down, futuristic cyberpunk interface with dual-tone typography and raw CSS micro-animations.
- 📱 **Mobile Optimized:** Full-stack responsive layout that ensures the experience is flawless whether you're on a 4K monitor or an iPhone.

## 🏗️ Architecture

### 1. The Backend (Python / FastAPI)
The core logic resides in `backend/brain.py`.
- **Why Python?** Native integration with Vector Databases, Embedding libraries, and LLaMA APIs.
- **How it works:** When a prompt is received, the backend converts it into a vector embedding, queries Pinecone for highly-relevant past context, injects that context into the LLaMA 3.3 prompt, and streams the answer back.

### 2. The Frontend (Next.js 15 / Tailwind)
- Designed to look like a high-end, proprietary AI tool.
- Zero-clutter interface focusing entirely on the AI interaction.
- Custom Markdown parsing (via `react-markdown`) to render code blocks, lists, and tables beautifully.

## 🚀 Getting Started

### Prerequisites
- Node.js & npm
- Python 3.10+

### Setup
1. **Clone the repository.**
2. **Install Frontend Dependencies:**
   ```bash
   npm install
   ```
3. **Install Backend Dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```
4. **Environment Variables:**
   Create a `.env` file in the `backend/` directory:
   ```env
   GEMINI_API_KEY=your_key_here
   PINECONE_API_KEY=your_pinecone_key_here
   ```

### Run the Engine
Run the Next.js development server:
```bash
npm run dev
```
In a separate terminal, run the AI backend:
```bash
cd backend
uvicorn brain:app --reload --port 8000
```

---
*Built with passion by Sumang.*
