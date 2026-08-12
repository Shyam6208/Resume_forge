"use client";

import { useState, useRef, useEffect } from "react";
import { useResumeStore } from "@/store/resume.store";
import { useAuthStore } from "@/store/auth.store";
import type { AIChatMessage } from "@/lib/ai/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Bot, Send, User, Loader2, Sparkles, HelpCircle } from "lucide-react";
import toast from "react-hot-toast";

interface AIChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const QUICK_PROMPTS = [
  "How can I improve my professional summary?",
  "Suggest 3 strong bullet points for my experience",
  "What keywords am I missing for a Full Stack Developer?",
  "How do I highlight leadership in my projects?",
];

export function AIChatDrawer({ isOpen, onClose }: AIChatDrawerProps) {
  const currentResume = useResumeStore((s) => s.currentResume);
  const userType = useAuthStore((s) => s.userType);

  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! I am your **ResumeForge AI Coach**. Ask me anything about your resume, bullet points, skills, ATS score, or career advice!",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (customPrompt?: string) => {
    const promptToSend = customPrompt || input;
    if (!promptToSend.trim() || isSending || !currentResume) return;

    const userMsg: AIChatMessage = {
      id: String(Date.now()),
      role: "user",
      content: promptToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setInput("");
    setIsSending(true);

    try {
      // Trim history to last 6 messages before sending to reduce token usage
      const historyToSend = messages.slice(-6);

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeData: currentResume.data,
          history: historyToSend,
          userPrompt: promptToSend.trim(),
          userType: userType || "developer",
          targetJob: currentResume.targetJob || currentResume.title,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to get AI response");
      }

      const data = await res.json();
      const assistantMsg: AIChatMessage = {
        id: String(Date.now() + 1),
        role: "assistant",
        content: data.reply || "I analyzed your request.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: unknown) {
      console.error("AI Chat error:", err);
      toast.error(err instanceof Error ? err.message : "AI assistant failed to respond");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md bg-slate-950 border-slate-800 text-slate-100 flex flex-col h-full p-0">
        {/* Header */}
        <SheetHeader className="p-4 border-b border-slate-800 bg-slate-900/90 backdrop-blur">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <SheetTitle className="text-base text-white font-bold">ResumeForge AI Assistant</SheetTitle>
              <SheetDescription className="text-xs text-slate-400">
                Context-aware HR & Career Coach
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Quick Prompts Bar */}
        <div className="p-3 border-b border-slate-800/80 bg-slate-900/40 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Quick Suggestions:</span>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_PROMPTS.map((qp, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSendMessage(qp)}
                className="text-[11px] px-2 py-0.5 rounded-md bg-slate-900 hover:bg-indigo-600/20 border border-slate-800 hover:border-indigo-500/30 text-slate-300 transition-colors text-left"
              >
                💡 {qp}
              </button>
            ))}
          </div>
        </div>

        {/* Message Log */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${
                msg.role === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold ${
                  msg.role === "user"
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-900 border border-slate-800 text-indigo-400"
                }`}
              >
                {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed space-y-1 ${
                  msg.role === "user"
                    ? "bg-indigo-600 text-white rounded-tr-none"
                    : "bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none"
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
                <span className="text-[10px] opacity-60 block text-right">{msg.timestamp}</span>
              </div>
            </div>
          ))}
          {isSending && (
            <div className="flex items-center gap-2 text-xs text-indigo-400 bg-slate-900/60 p-3 rounded-xl border border-slate-800 w-fit">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>AI is thinking...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-800 bg-slate-950 flex items-center gap-2">
          <Input
            placeholder="Ask AI anything about your resume..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            className="text-xs bg-slate-900 border-slate-800 text-white h-10"
          />
          <Button
            type="button"
            disabled={isSending || !input.trim()}
            onClick={() => handleSendMessage()}
            className="h-10 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
