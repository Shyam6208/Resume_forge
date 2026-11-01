"use client";

import { useState, useCallback } from "react";
import { useResumeStore } from "@/store/resume.store";
import type { OutreachResult } from "@/lib/ai/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  Mail,
  MessageSquare,
  Copy,
  Check,
  RefreshCw,
  Send,
  Sparkles,
  User,
  Building2,
} from "lucide-react";
import toast from "react-hot-toast";

function LinkedinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

interface OutreachModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type OutreachTab = "linkedin" | "cold-email" | "follow-up";

export function OutreachModal({ isOpen, onClose }: OutreachModalProps) {
  const currentResume = useResumeStore((s) => s.currentResume);

  const [targetRole, setTargetRole] = useState(currentResume?.targetJob || "");
  const [companyName, setCompanyName] = useState("");
  const [recruiterName, setRecruiterName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<OutreachResult | null>(null);
  const [activeTab, setActiveTab] = useState<OutreachTab>("linkedin");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!currentResume) return;
    if (!targetRole.trim() || !companyName.trim()) {
      toast.error("Please fill in the Target Role and Company Name.");
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading("✉️ Crafting personalized outreach messages...");

    try {
      const res = await fetch("/api/ai/outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeData: currentResume.data,
          targetRole: targetRole.trim(),
          companyName: companyName.trim(),
          recruiterName: recruiterName.trim(),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to generate outreach");
      }

      const data: OutreachResult = await res.json();
      setResult(data);
      toast.dismiss(toastId);
      toast.success("✨ 3 outreach messages ready!", { duration: 3000 });
    } catch (err: unknown) {
      toast.dismiss(toastId);
      const msg = err instanceof Error ? err.message : "Failed to generate outreach";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [currentResume, targetRole, companyName, recruiterName]);

  const copyText = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedField(null), 2000);
  };

  const tabs: { id: OutreachTab; label: string; icon: React.ReactNode; color: string }[] = [
    { id: "linkedin", label: "LinkedIn InMail", icon: <LinkedinIcon className="w-4 h-4" />, color: "text-blue-400" },
    { id: "cold-email", label: "Cold Email", icon: <Mail className="w-4 h-4" />, color: "text-emerald-400" },
    { id: "follow-up", label: "Follow-Up", icon: <MessageSquare className="w-4 h-4" />, color: "text-amber-400" },
  ];

  const getActiveMessage = () => {
    if (!result) return null;
    switch (activeTab) {
      case "linkedin":
        return result.linkedinInMail;
      case "cold-email":
        return result.coldEmail;
      case "follow-up":
        return result.followUpEmail;
    }
  };

  const message = getActiveMessage();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#0B0F17]/95 border-white/[0.08] backdrop-blur-2xl text-slate-100 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-white">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Send className="w-5 h-5" />
            </div>
            Recruiter Outreach Generator
          </DialogTitle>
          <DialogDescription className="text-slate-400 text-xs">
            AI-powered LinkedIn InMail, Cold Emails, and Follow-Up templates
          </DialogDescription>
        </DialogHeader>

        {/* Input Form */}
        {!result && (
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-cyan-400" /> Company Name *
                </label>
                <Input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Google, Stripe, Meta"
                  className="bg-slate-900/80 border-white/[0.08] focus:border-cyan-500 text-slate-100 text-xs rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Target Role *
                </label>
                <Input
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Senior Software Engineer"
                  className="bg-slate-900/80 border-white/[0.08] focus:border-cyan-500 text-slate-100 text-xs rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-cyan-400" /> Recruiter/HR Name (optional)
              </label>
              <Input
                value={recruiterName}
                onChange={(e) => setRecruiterName(e.target.value)}
                placeholder="e.g. Sarah Connor"
                className="bg-slate-900/80 border-white/[0.08] focus:border-cyan-500 text-slate-100 text-xs rounded-xl"
              />
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isLoading || !targetRole.trim() || !companyName.trim()}
              className="w-full h-10 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:opacity-90 text-slate-950 font-bold rounded-xl shadow-md shadow-cyan-500/20 transition-all active:scale-95 disabled:opacity-50"
            >
              {isLoading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin text-slate-950" /> Generating Messages...</>
              ) : (
                <><Sparkles className="w-4 h-4 mr-2 text-slate-950" /> Generate All 3 Messages</>
              )}
            </Button>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-4 mt-4">
            {/* Tab Navigation */}
            <div className="flex gap-1.5 bg-slate-900/80 rounded-xl p-1.5 border border-white/[0.08]">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-cyan-500 to-emerald-400 text-slate-950 font-bold shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  <span className={activeTab === tab.id ? "text-slate-950" : tab.color}>{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Message Content */}
            {message && (
              <div className="space-y-3">
                {/* Subject Line */}
                <div className="bg-slate-900/60 rounded-xl p-4 border border-white/[0.06]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Subject</span>
                    <button
                      onClick={() => copyText(message.subject, "subject")}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      {copiedField === "subject" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
                    </button>
                  </div>
                  <p className="text-sm text-white font-semibold">{message.subject}</p>
                </div>

                {/* Body */}
                <div className="bg-slate-900/60 rounded-xl p-4 border border-white/[0.06]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Message Body</span>
                    <button
                      onClick={() => copyText(message.body, "body")}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      {copiedField === "body" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
                      <span>{copiedField === "body" ? "Copied!" : "Copy"}</span>
                    </button>
                  </div>
                  <div className="text-xs sm:text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {message.body}
                  </div>
                </div>

                {/* Tone Badge */}
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>
                    Tone: <span className="text-white font-medium capitalize">{message.tone}</span>
                  </span>
                  <span>
                    For: <span className="text-cyan-300">{result.targetRole}</span> @ <span className="text-cyan-300">{result.companyName}</span>
                  </span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                onClick={() => {
                  copyText(
                    `Subject: ${message?.subject}\n\n${message?.body}`,
                    "full"
                  );
                }}
                className="flex-1 h-10 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:opacity-90 text-slate-950 font-bold rounded-xl shadow-md shadow-cyan-500/20"
              >
                {copiedField === "full" ? (
                  <><Check className="w-4 h-4 mr-1.5 text-slate-950" /> Copied Full Message</>
                ) : (
                  <><Copy className="w-4 h-4 mr-1.5 text-slate-950" /> Copy Full Message</>
                )}
              </Button>
              <Button
                onClick={() => {
                  setResult(null);
                  setIsLoading(false);
                }}
                variant="outline"
                className="bg-white/[0.05] border-white/[0.08] text-slate-300 hover:text-white rounded-xl"
              >
                <RefreshCw className="w-4 h-4 mr-1.5" /> New
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
