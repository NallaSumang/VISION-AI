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
    <main className="flex min-h-screen flex-col items-center bg-[#050505] p-4 md:p-8 font-sans text-zinc-300 selection:bg-cyan-900/30 overflow-hidden relative">
      
      {/* LUXURY BACKGROUND EFFECTS */}
      <div className="fixed inset-0 z-0 bg-[#000305] pointer-events-none overflow-hidden">
        {/* Deep Cyan/Teal Aurora Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#0891b2] rounded-full blur-[120px] opacity-20 animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#0d9488] rounded-full blur-[150px] opacity-15 animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }} />
        <div className="absolute top-[30%] left-[20%] w-[40%] h-[40%] bg-[#082f49] rounded-full blur-[100px] opacity-40 animate-pulse" style={{ animationDuration: '10s', animationDelay: '4s' }} />
        
        {/* Cinematic Noise Overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />
      </div>

      <div className="w-full max-w-4xl flex items-center justify-between mb-8 mt-2 relative z-10">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-cyan-950 to-[#050505] border border-white/[0.05] p-3 rounded-2xl shadow-[0_0_30px_rgba(8,145,178,0.1)]">
            <Bot className="w-6 h-6 text-cyan-600" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-xl font-light tracking-[0.1em] text-zinc-100">VISION AI</h1>
            <div className="text-[9px] font-medium text-cyan-900/80 tracking-[0.4em] uppercase mt-1">Memory Engine</div>
          </div>
        </div>
      </div>
      
      <div className="flex-1 w-full max-w-4xl flex flex-col gap-6 overflow-y-auto mb-6 p-6 md:p-10 rounded-[2rem] bg-white/[0.01] border border-white/[0.02] shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-3xl relative z-10 custom-scrollbar">
        {messages.length === 0 && !isLoading && (
          <div className="h-full flex flex-col items-center justify-center text-zinc-500 gap-6 opacity-50">
            <Bot className="w-16 h-16 text-zinc-700" strokeWidth={1} />
            <p className="font-light tracking-widest uppercase text-[10px]">Neural link established. Awaiting input.</p>
          </div>
        )}
        
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`flex gap-4 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-1 border ${
                msg.role === "user" ? "bg-cyan-950/30 border-cyan-900/50 shadow-[0_0_15px_rgba(8,145,178,0.2)]" : "bg-black/50 border-white/[0.05]"
              }`}>
                {msg.role === "user" ? <User className="w-4 h-4 text-cyan-400" strokeWidth={1.5} /> : <Bot className="w-5 h-5 text-cyan-700" strokeWidth={1.5} />}
              </div>
              
              <div className={`rounded-3xl p-6 shadow-sm text-sm font-light leading-relaxed ${
                  msg.role === "user" 
                  ? "bg-white/[0.02] border border-white/[0.05] text-zinc-200 rounded-tr-sm" 
                  : "bg-transparent text-zinc-300"
                }`}>
                <ReactMarkdown 
                  components={{
                      img: ({node, ...props}) => props.src ? <img className="max-w-md w-full rounded-2xl mb-4 shadow-xl border border-white/[0.05]" {...props} /> : null,
                      code: ({node, ...props}) => <code className="bg-black/60 rounded px-2 py-1 font-mono text-[11px] text-cyan-300/80 border border-white/[0.02]" {...props} />,
                      pre: ({node, ...props}) => <pre className="bg-black/60 rounded-2xl p-5 overflow-x-auto my-4 border border-white/[0.02] shadow-inner" {...props} />,
                      strong: ({node, ...props}) => <strong className="font-medium text-cyan-200" {...props} />,
                      p: ({node, ...props}) => <p className="last:mb-0 mb-4 tracking-wide" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc list-outside ml-5 mb-4 space-y-2 marker:text-cyan-900" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal list-outside ml-5 mb-4 space-y-2 marker:text-cyan-900" {...props} />,
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
              <div className="flex gap-4 max-w-[85%]">
                <div className="w-10 h-10 rounded-full bg-black/50 border border-white/[0.05] flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-5 h-5 text-cyan-700" strokeWidth={1.5} />
                </div>
                <div className="bg-transparent p-6 rounded-3xl rounded-tl-sm text-cyan-700 text-xs tracking-widest uppercase flex items-center gap-4">
                  <div className="flex gap-1.5">
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

      <div className="w-full max-w-4xl flex flex-col gap-4 relative z-10">
        {selectedImage && (
            <div className="flex items-center justify-between bg-black/80 border border-cyan-900/30 p-3 rounded-2xl w-72 shadow-2xl backdrop-blur-md relative group">
                <div className="flex items-center gap-4 overflow-hidden">
                  <img src={selectedImage} alt="Preview" className="w-14 h-14 object-cover rounded-xl" />
                  <span className="text-[10px] uppercase tracking-widest text-zinc-400 truncate font-medium">Visual Matrix Loaded</span>
                </div>
                <button 
                  onClick={() => setSelectedImage(null)}
                  className="bg-white/[0.05] p-2 rounded-full hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-colors absolute right-3"
                >
                  <X className="w-3 h-3"/>
                </button>
            </div>
        )}

        <div className="flex gap-3 items-end relative">
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
                className="shrink-0 h-16 w-16 rounded-2xl bg-white/[0.02] border-white/[0.05] text-zinc-500 hover:text-cyan-400 hover:border-cyan-900/50 hover:bg-cyan-950/20 transition-all duration-500 shadow-xl"
                onClick={() => fileInputRef.current?.click()}
            >
                <Paperclip className="w-5 h-5" strokeWidth={1.5} />
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