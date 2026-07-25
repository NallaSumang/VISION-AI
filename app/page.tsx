"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Paperclip, X, Send, Bot, User } from "lucide-react"; 
import ReactMarkdown from "react-markdown"; 

const BACKEND_URL = "https://my-ai-brain-nyj6.onrender.com";

export default function Home() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null); 
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/history`);
        if (!res.ok) return;
        const data = await res.json();
        const formatted = data.map((msg: any) => {
          let content = "";
          if (msg.parts && Array.isArray(msg.parts)) {
            content = msg.parts.map((p: any) => p.text).join('\n\n');
          } else if (msg.content) {
            content = msg.content;
          }
          return {
            role: msg.role === "model" || msg.role === "ai" ? "ai" : "user",
            content: content
          };
        });
        setMessages(formatted);
      } catch (err) {
        console.error("Failed to load history:", err);
      }
    };
    fetchHistory();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async () => {
    if (!input.trim() && !selectedImage) return;

    const displayContent = selectedImage 
      ? `![Uploaded Image](${selectedImage})\n\n${input}` 
      : input;
      
    const userMessage = { role: "user", content: displayContent };
    setMessages((prev) => [...prev, userMessage]);
    
    const currentInput = input;
    const currentImage = selectedImage;
    
    setInput("");
    setSelectedImage(null);
    setIsLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            message: currentInput || "Analyze this image",
            image: currentImage 
        }),
      });

      if (!response.ok) throw new Error("Network error");
      const data = await response.json();

      const aiMessage = { role: "ai", content: data.reply };
      setMessages((prev) => [...prev, aiMessage]);

    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: "⚠️ Error: Could not connect to brain. Make sure the backend is running on port 8000!" }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex h-[100dvh] flex-col items-center bg-[#050505] p-2 md:p-8 font-sans text-zinc-300 selection:bg-cyan-900/30 overflow-hidden relative">
      
      {/* NEURAL VISION HUD & DATA STREAMS (ANIME VIBE) */}
      <div className="fixed inset-0 z-0 bg-[#000508] overflow-hidden pointer-events-none">
        <style>{`
          @keyframes data-fall {
            0% { transform: translateY(-100vh); opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { transform: translateY(100vh); opacity: 0; }
          }
          @keyframes pulse-ring {
            0% { transform: scale(0.8); opacity: 0.8; }
            100% { transform: scale(1.5); opacity: 0; }
          }
        `}</style>

        {/* Deep gradient base */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#001a22_0%,#000000_100%)]" />

        {/* Neural Network Rings (Anime HUD) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[100vw] md:w-[600px] md:h-[600px] border border-cyan-500/10 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] h-[150vw] md:w-[800px] md:h-[800px] border border-cyan-500/5 rounded-full border-dashed animate-[spin_60s_linear_infinite]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vw] md:w-[400px] md:h-[400px] border border-teal-500/20 rounded-full animate-[pulse-ring_4s_cubic-bezier(0.215,0.61,0.355,1)_infinite]" />

        {/* Data Streams (Matrix/Anime style) */}
        <div className="absolute left-[10%] w-[1px] h-32 bg-gradient-to-b from-transparent via-cyan-400 to-transparent animate-[data-fall_3s_linear_infinite]" />
        <div className="absolute left-[30%] w-[2px] h-48 bg-gradient-to-b from-transparent via-teal-400 to-transparent animate-[data-fall_5s_linear_infinite_1s]" />
        <div className="absolute left-[60%] w-[1px] h-24 bg-gradient-to-b from-transparent via-cyan-300 to-transparent animate-[data-fall_4s_linear_infinite_2s]" />
        <div className="absolute left-[85%] w-[2px] h-64 bg-gradient-to-b from-transparent via-blue-400 to-transparent animate-[data-fall_6s_linear_infinite_0.5s]" />

        {/* Glowing Nexus Points */}
        <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-cyan-400 rounded-full shadow-[0_0_20px_5px_rgba(0,255,255,0.8)] animate-[pulse_3s_ease-in-out_infinite]" />
        <div className="absolute bottom-1/3 right-1/4 w-2 h-2 bg-teal-400 rounded-full shadow-[0_0_15px_4px_rgba(0,255,150,0.8)] animate-[pulse_4s_ease-in-out_infinite_1s]" />
        
        {/* Vignette */}
        <div className="absolute inset-0 shadow-[inset_0_0_200px_rgba(0,0,0,1)] pointer-events-none" />
      </div>

      <div className="w-full max-w-4xl flex items-center justify-between mb-4 md:mb-8 mt-2 relative z-10 px-2 md:px-0">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-cyan-950 to-[#050505] border border-white/[0.05] p-3 rounded-2xl shadow-[0_0_30px_rgba(8,145,178,0.1)]">
            <Bot className="w-6 h-6 text-cyan-600" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-light tracking-[0.1em] text-zinc-100">
              VISION <span className="font-bold text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]">AI</span>
            </h1>
            <div className="text-[8px] md:text-[9px] font-medium text-cyan-400/90 tracking-[0.4em] uppercase mt-1">Sumang's Signature Edition</div>
          </div>
        </div>
      </div>
      
      <div className="flex-1 w-full max-w-4xl flex flex-col gap-4 overflow-y-auto mb-4 p-3 md:p-10 rounded-[2rem] bg-white/[0.01] border border-white/[0.02] shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-3xl relative z-10 custom-scrollbar">
        {messages.length === 0 && !isLoading && (
          <div className="h-full flex flex-col items-center justify-center text-zinc-500 gap-6 opacity-50">
            <Bot className="w-12 h-12 md:w-16 md:h-16 text-zinc-700" strokeWidth={1} />
            <p className="font-light tracking-widest uppercase text-[9px] md:text-[10px] text-center px-4">Neural link established. Awaiting input.</p>
          </div>
        )}
        
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`flex gap-3 md:gap-4 max-w-[95%] md:max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
              <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shrink-0 mt-1 border ${
                msg.role === "user" ? "bg-cyan-950/30 border-cyan-900/50 shadow-[0_0_15px_rgba(8,145,178,0.2)]" : "bg-black/50 border-white/[0.05]"
              }`}>
                {msg.role === "user" ? <User className="w-3 h-3 md:w-4 md:h-4 text-cyan-400" strokeWidth={1.5} /> : <Bot className="w-4 h-4 md:w-5 md:h-5 text-cyan-700" strokeWidth={1.5} />}
              </div>
              
              <div className={`rounded-2xl md:rounded-3xl p-4 md:p-5 shadow-sm text-sm font-light leading-relaxed break-words overflow-hidden ${
                  msg.role === "user" 
                  ? "bg-white/[0.02] border border-white/[0.05] text-zinc-200 rounded-tr-sm" 
                  : "bg-cyan-950/10 border border-cyan-900/20 text-zinc-300 rounded-tl-sm"
                }`}>
                <ReactMarkdown 
                  components={{
                      img: ({node, ...props}) => props.src ? <img className="max-w-full md:max-w-md rounded-xl md:rounded-2xl mb-4 shadow-xl border border-cyan-900/20" {...props} /> : null,
                      code: ({node, ...props}) => <code className="bg-black/60 rounded px-2 py-1 font-mono text-[10px] md:text-[11px] text-cyan-300/80 border border-white/[0.02]" {...props} />,
                      pre: ({node, ...props}) => <pre className="bg-black/60 rounded-xl md:rounded-2xl p-4 md:p-5 overflow-x-auto my-4 border border-white/[0.02] shadow-inner max-w-[80vw]" {...props} />,
                      strong: ({node, ...props}) => <strong className="font-medium text-cyan-200" {...props} />,
                      p: ({node, ...props}) => <p className="last:mb-0 mb-4 tracking-wide" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc list-outside ml-5 mb-4 space-y-2 marker:text-cyan-600" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal list-outside ml-5 mb-4 space-y-2 marker:text-cyan-600" {...props} />,
                      li: ({node, ...props}) => <li className="mb-1" {...props} />
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-3 md:gap-4 max-w-[95%] md:max-w-[85%]">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-black/50 border border-white/[0.05] flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-4 h-4 md:w-5 md:h-5 text-cyan-700" strokeWidth={1.5} />
                </div>
                <div className="bg-transparent p-4 md:p-6 rounded-3xl rounded-tl-sm text-cyan-700 text-[10px] md:text-xs tracking-widest uppercase flex items-center gap-3 md:gap-4">
                  <div className="flex gap-1 md:gap-1.5">
                    <div className="w-1 h-1 bg-cyan-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-1 h-1 bg-cyan-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1 h-1 bg-cyan-600 rounded-full animate-bounce"></div>
                  </div>
                  <span className="font-medium">Accessing Memory...</span>
                </div>
              </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="w-full max-w-4xl flex flex-col gap-3 relative z-10 px-2 md:px-0">
        {selectedImage && (
            <div className="flex items-center justify-between bg-black/80 border border-cyan-900/30 p-2 md:p-3 rounded-2xl w-full md:w-72 shadow-2xl backdrop-blur-md relative group">
                <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                  <img src={selectedImage} alt="Preview" className="w-10 h-10 md:w-14 md:h-14 object-cover rounded-xl" />
                  <span className="text-[9px] md:text-[10px] uppercase tracking-widest text-zinc-400 truncate font-medium">Visual Matrix Loaded</span>
                </div>
                <button 
                  onClick={() => setSelectedImage(null)}
                  className="bg-white/[0.05] p-2 rounded-full hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-colors"
                >
                  <X className="w-3 h-3"/>
                </button>
            </div>
        )}

        <div className="flex gap-2 md:gap-3 items-end relative">
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                accept="image/*" 
                className="hidden" 
            />
            
            <Button 
                variant="outline" 
                size="icon"
                className="shrink-0 h-14 w-14 md:h-16 md:w-16 rounded-xl md:rounded-2xl bg-white/[0.02] border-white/[0.05] text-zinc-500 hover:text-cyan-400 hover:border-cyan-900/50 hover:bg-cyan-950/20 transition-all duration-500 shadow-xl"
                onClick={() => fileInputRef.current?.click()}
            >
                <Paperclip className="w-4 h-4 md:w-5 md:h-5" strokeWidth={1.5} />
            </Button>

            <div className="relative flex-1">
              <Input 
                value={input}
                onChange={(e) => setInput(e.target.value)} 
                placeholder="Query the neural network..." 
                className="h-16 bg-white/[0.02] text-zinc-200 border-white/[0.05] focus-visible:ring-1 focus-visible:ring-cyan-900 focus-visible:border-cyan-800 rounded-2xl pr-16 pl-6 text-base font-light tracking-wide backdrop-blur-3xl shadow-xl placeholder:text-zinc-700"
                onKeyDown={(e) => e.key === "Enter" && handleSend()} 
              />
              <Button 
                  onClick={handleSend} 
                  disabled={isLoading || (!input.trim() && !selectedImage)}
                  size="icon"
                  className="absolute right-2 top-2 bottom-2 h-12 w-12 bg-white/[0.05] border border-white/[0.05] hover:bg-cyan-950/40 hover:border-cyan-900/50 text-cyan-500 rounded-xl transition-all duration-500 disabled:opacity-30 disabled:hover:bg-transparent"
              >
                  <Send className="w-4 h-4 ml-0.5" strokeWidth={1.5} />
              </Button>
            </div>
        </div>
      </div>
    </main>
  );
}