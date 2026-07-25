"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Paperclip, X, Send, Bot, User } from "lucide-react"; 
import ReactMarkdown from "react-markdown"; 

const BACKEND_URL = "http://127.0.0.1:8000";

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
    <main className="flex min-h-screen flex-col items-center bg-black p-4 font-sans text-zinc-100">
      <div className="w-full max-w-4xl flex items-center justify-between mb-8 mt-4">
        <div className="flex items-center gap-3">
          <div className="bg-purple-600/20 p-2 rounded-xl">
            <Bot className="w-6 h-6 text-purple-400" />
          </div>
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
            Memory AI
          </h1>
        </div>
      </div>
      
      <div className="flex-1 w-full max-w-4xl flex flex-col gap-6 overflow-y-auto mb-6 p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 shadow-2xl backdrop-blur-sm">
        {messages.length === 0 && !isLoading && (
          <div className="h-full flex flex-col items-center justify-center text-zinc-500 gap-4">
            <Bot className="w-12 h-12 text-zinc-700" />
            <p>No memories yet. Say hello!</p>
          </div>
        )}
        
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${
                msg.role === "user" ? "bg-purple-600" : "bg-zinc-800 border border-zinc-700"
              }`}>
                {msg.role === "user" ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-purple-400" />}
              </div>
              
              <div className={`rounded-2xl p-4 shadow-sm text-sm leading-relaxed ${
                  msg.role === "user" 
                  ? "bg-purple-600 text-white rounded-tr-sm" 
                  : "bg-zinc-800 text-zinc-200 border border-zinc-700 rounded-tl-sm"
                }`}>
                <ReactMarkdown 
                  components={{
                      img: ({node, ...props}) => props.src ? <img className="max-w-md w-full rounded-lg mb-3 shadow-md border border-zinc-700/50" {...props} /> : null,
                      code: ({node, ...props}) => <code className="bg-black/40 rounded px-1.5 py-0.5 font-mono text-purple-300" {...props} />,
                      pre: ({node, ...props}) => <pre className="bg-black/40 rounded-lg p-3 overflow-x-auto my-2 border border-zinc-700/50" {...props} />,
                      strong: ({node, ...props}) => <strong className="font-semibold text-purple-300" {...props} />,
                      p: ({node, ...props}) => <p className="last:mb-0 mb-3" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc list-outside ml-4 mb-3" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal list-outside ml-4 mb-3" {...props} />,
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
              <div className="flex gap-3 max-w-[85%]">
                <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-5 h-5 text-purple-400" />
                </div>
                <div className="bg-zinc-800 border border-zinc-700 p-4 rounded-2xl rounded-tl-sm text-zinc-400 text-sm flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce"></div>
                  <span className="ml-2 font-medium">Recalling memory...</span>
                </div>
              </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="w-full max-w-4xl flex flex-col gap-3">
        {selectedImage && (
            <div className="flex items-center justify-between bg-zinc-900 border border-purple-500/30 p-3 rounded-xl w-64 shadow-lg relative group">
                <div className="flex items-center gap-3 overflow-hidden">
                  <img src={selectedImage} alt="Preview" className="w-12 h-12 object-cover rounded-md" />
                  <span className="text-sm text-zinc-300 truncate font-medium">Image attached</span>
                </div>
                <button 
                  onClick={() => setSelectedImage(null)}
                  className="bg-black/50 p-1.5 rounded-full hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition-colors absolute right-2"
                >
                  <X className="w-4 h-4"/>
                </button>
            </div>
        )}

        <div className="flex gap-2 items-end relative">
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
                className="shrink-0 h-12 w-12 rounded-xl bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-purple-400 hover:border-purple-500 hover:bg-purple-500/10 transition-all"
                onClick={() => fileInputRef.current?.click()}
            >
                <Paperclip className="w-5 h-5" />
            </Button>

            <div className="relative flex-1">
              <Input 
                value={input}
                onChange={(e) => setInput(e.target.value)} 
                placeholder="Ask your memory anything..." 
                className="h-12 bg-zinc-900 text-white border-zinc-700 focus-visible:ring-1 focus-visible:ring-purple-500 focus-visible:border-purple-500 rounded-xl pr-14 text-base"
                onKeyDown={(e) => e.key === "Enter" && handleSend()} 
              />
              <Button 
                  onClick={handleSend} 
                  disabled={isLoading || (!input.trim() && !selectedImage)}
                  size="icon"
                  className="absolute right-1.5 top-1.5 h-9 w-9 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                  <Send className="w-4 h-4" />
              </Button>
            </div>
        </div>
      </div>
    </main>
  );
}