"use client";

import { useState, useRef, useCallback } from "react";
import { useResumeStore } from "@/store/resume.store";
import { useUIStore } from "@/store/ui.store";
import type { InterviewPrepResult, InterviewQuestion } from "@/lib/ai/types";
import {
  generateClientCacheKey,
  getClientCached,
  setClientCached,
} from "@/lib/ai/ai-client-cache";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { HelpCircle, Sparkles, Loader2, CheckCircle2, Lightbulb, MessageSquare } from "lucide-react";
import toast from "react-hot-toast";

interface InterviewPrepModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InterviewPrepModal({ isOpen, onClose }: InterviewPrepModalProps) {
  const currentResume = useResumeStore((s) => s.currentResume);
  const { jobDescription, jdMatchResult } = useUIStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [prepResult, setPrepResult] = useState<InterviewPrepResult | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("All");

  // Duplicate request prevention
  const inFlightRef = useRef(false);

  const handleGenerate = useCallback(async (isRegenerate = false) => {
    if (!currentResume) return;
    if (jobDescription.trim().length < 30) {
      toast.error("Add a valid job description to prepare for your interview.");
      return;
    }

    // Prevent duplicate concurrent requests
    if (inFlightRef.current) return;

    // JD Match Context (compacted to just useful fields)
    const jdMatchContext = jdMatchResult ? {
      matchedSkills: jdMatchResult.matchedSkills,
      missingSkills: jdMatchResult.missingSkills,
      missingKeywords: jdMatchResult.missingKeywords,
      priorityActions: jdMatchResult.priorityActions
    } : null;

    // Client-side cache check
    const cacheKey = generateClientCacheKey({
      resumeId: currentResume.id,
      operation: "interview-prep",
      content: currentResume.data,
      jobDescription: jobDescription,
    });
    
    if (!isRegenerate) {
      const cached = getClientCached<InterviewPrepResult>(cacheKey);
      if (cached) {
        setPrepResult(cached);
        toast.success("Interview Prep loaded from cache!", { duration: 2000 });
        return;
      }
    }

    inFlightRef.current = true;
    setIsGenerating(true);
    const toastId = toast.loading("🎯 Generating role-specific Interview Questions...");

    try {
      const res = await fetch("/api/ai/interview-prep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeData: currentResume.data,
          jobDescription,
          jdMatchContext,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to generate interview prep");
      }

      const result: InterviewPrepResult = await res.json();
      setPrepResult(result);

      // Cache the result
      setClientCached(cacheKey, result);

      toast.dismiss(toastId);
      toast.success("Interview Prep generated!", { duration: 3000 });
    } catch (err: unknown) {
      console.error("Interview Prep error:", err);
      toast.dismiss(toastId);
      toast.error(err instanceof Error ? err.message : "Failed to generate interview prep", { duration: 4000 });
    } finally {
      setIsGenerating(false);
      inFlightRef.current = false;
    }
  }, [currentResume, jobDescription, jdMatchResult]);

  const filteredQuestions = prepResult?.questions
    ? activeCategory === "All"
      ? prepResult.questions
      : prepResult.questions.filter((q) => q.category === activeCategory)
    : [];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95vw] max-w-3xl bg-slate-900 border-slate-800 text-slate-100 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-400" />
            <span>AI Interview Prep Assistant</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400">
            Tailored Technical, HR, Behavioral, and Project questions with sample answers.
          </DialogDescription>
        </DialogHeader>

        {!prepResult && (
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">Generate Interview Questions for Your Resume</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Get role-specific technical questions, behavioral STAR prompts, and recruiter expectations based on your projects.
              </p>
            </div>
            <Button
              type="button"
              disabled={isGenerating}
              onClick={() => handleGenerate(false)}
              className="h-10 px-6 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md flex items-center gap-2 mx-auto"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating Questions...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Generate Interview Questions</span>
                </>
              )}
            </Button>
          </div>
        )}

        {prepResult && (
          <div className="space-y-4">
            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {["All", "Resume", "Technical", "Behavioral", "Job-Specific"].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      activeCategory === cat
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "bg-slate-950 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isGenerating}
                onClick={() => handleGenerate(true)}
                className="h-8 text-xs bg-slate-950 border-slate-800 text-slate-300 hover:text-white"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1 text-indigo-400" />
                <span>Regenerate</span>
              </Button>
            </div>

            {/* Question Cards */}
            <div className="space-y-3">
              {filteredQuestions.map((q, i) => (
                <div key={i} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="outline" className="text-[10px] px-2 py-0.2 bg-indigo-500/20 text-indigo-300 border-indigo-500/30 font-semibold">
                      {q.category}
                    </Badge>
                    <span className="text-[10px] text-slate-500 font-mono">Q{i + 1}</span>
                  </div>

                  <h4 className="text-xs font-bold text-white">{q.question}</h4>

                  <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80 space-y-1">
                    <span className="text-[10px] font-bold text-amber-400 uppercase block">Why Recruiter Asks:</span>
                    <p className="text-[11px] text-slate-300">{q.whyAsked}</p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-indigo-950/30 border border-indigo-500/20 space-y-1">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase block">Suggested Answer Framework:</span>
                    <ul className="text-[11px] text-slate-200 leading-relaxed list-disc list-inside space-y-1">
                      {q.answerGuide?.map((guide, idx) => (
                        <li key={idx}>{guide}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
