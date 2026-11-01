"use client";

import { useState, useRef, useCallback } from "react";
import { useResumeStore } from "@/store/resume.store";
import { useAuthStore } from "@/store/auth.store";
import { useUIStore } from "@/store/ui.store";
import type { SectionKey } from "@/types/resume.types";
import type { SectionImproveResult } from "@/lib/ai/types";
import {
  generateClientCacheKey,
  getClientCached,
  setClientCached,
} from "@/lib/ai/ai-client-cache";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Sparkles, Loader2, Check, ArrowRight, RefreshCw, Undo2, Target } from "lucide-react";
import toast from "react-hot-toast";

interface ImproveWithAIButtonProps {
  sectionKey: SectionKey;
  currentData: unknown;
  className?: string;
  mode?: "improve" | "optimize";
  onApply?: (improvedData: any) => void;
}

export function ImproveWithAIButton({
  sectionKey,
  currentData,
  className = "",
  mode = "improve",
  onApply,
}: ImproveWithAIButtonProps) {
  const userType = useAuthStore((s) => s.userType);
  const updateSection = useResumeStore((s) => s.updateSection);
  const currentResume = useResumeStore((s) => s.currentResume);
  const { jobDescription, jdMatchResult } = useUIStore();

  const [isLoading, setIsLoading] = useState(false);
  const [showDiffModal, setShowDiffModal] = useState(false);
  const [improveResult, setImproveResult] = useState<SectionImproveResult | null>(null);

  // Duplicate request prevention
  const inFlightRef = useRef(false);

  const handleImprove = useCallback(async () => {
    // Prevent duplicate concurrent requests
    if (inFlightRef.current) return;

    // Input validation — reject empty/trivial section data
    const dataStr = JSON.stringify(currentData);
    if (
      !currentData ||
      dataStr === "null" ||
      dataStr === "{}" ||
      dataStr === "[]" ||
      dataStr === '""' ||
      dataStr.length < 10
    ) {
      toast.error("Please add content to this section before improving with AI.");
      return;
    }

    if (mode === "optimize" && (!jobDescription || jobDescription.trim().length < 30)) {
      toast.error("Please enter a valid job description before optimizing.");
      return;
    }

    // Client-side cache check
    const cacheKey = generateClientCacheKey({
      resumeId: currentResume?.id,
      operation: mode === "optimize" ? "jd-optimize" : "improve-section",
      sectionKey,
      content: currentData,
      jobDescription: mode === "optimize" ? jobDescription : undefined,
    });
    const cached = getClientCached<SectionImproveResult>(cacheKey);
    if (cached) {
      setImproveResult(cached);
      setShowDiffModal(true);
      toast.success("Loaded improvement from cache");
      return;
    }

    setIsLoading(true);
    inFlightRef.current = true;
    const toastId = toast.loading(
      mode === "optimize" ? "🎯 Optimizing for target job..." : "✨ AI is polishing this section..."
    );

    try {
      const res = await fetch("/api/ai/improve-section", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionKey,
          sectionData: currentData,
          userType: userType || "developer",
          targetJob: currentResume?.targetJob || currentResume?.title,
          jobDescription: mode === "optimize" ? jobDescription : undefined,
          missingKeywords: mode === "optimize" ? jdMatchResult?.missingKeywords : undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to improve section");
      }

      const data: SectionImproveResult = await res.json();
      setImproveResult(data);
      setClientCached(cacheKey, data);
      setShowDiffModal(true);
      toast.dismiss(toastId);
      toast.success("Section improvements ready for review!");
    } catch (err: unknown) {
      console.error("Improve section error:", err);
      toast.dismiss(toastId);
      toast.error(err instanceof Error ? err.message : "AI improvement failed", { duration: 4000 });
    } finally {
      setIsLoading(false);
      inFlightRef.current = false;
    }
  }, [currentData, currentResume, jobDescription, jdMatchResult, mode, sectionKey, userType]);

  const handleApplyChanges = () => {
    if (!improveResult) return;

    if (onApply) {
      onApply(improveResult.improvedData);
    } else {
      updateSection(sectionKey, improveResult.improvedData as never);
    }

    setShowDiffModal(false);
    toast.success(`Updated ${sectionKey} with AI improvements!`);
  };

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={isLoading}
        onClick={handleImprove}
        className={`h-7 px-2.5 text-xs text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 font-semibold flex items-center gap-1.5 rounded-lg transition-colors ${className}`}
        title={`Improve ${sectionKey} with AI`}
      >
        {isLoading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
        ) : mode === "optimize" ? (
          <Target className="w-3.5 h-3.5 text-rose-400" />
        ) : (
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
        )}
        <span>
          {isLoading 
            ? "Improving..." 
            : mode === "optimize"
              ? "🎯 Optimize for this Job"
              : "✨ Improve with AI"}
        </span>
      </Button>

      {/* Diff & Review Modal */}
      <Dialog open={showDiffModal} onOpenChange={setShowDiffModal}>
        <DialogContent className="w-[95vw] max-w-2xl bg-[#0B0F17]/95 border-white/[0.08] backdrop-blur-2xl text-slate-100 p-6 space-y-4 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Review AI Improvements — {sectionKey.toUpperCase()}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              {improveResult?.explanation || "Review proposed AI enhancements before applying."}
            </DialogDescription>
          </DialogHeader>

          {/* Key Changes Summary */}
          {improveResult?.keyChanges && improveResult.keyChanges.length > 0 && (
            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs space-y-1">
              <span className="font-bold text-cyan-300">Key Enhancements:</span>
              <ul className="list-disc list-inside text-slate-300 space-y-0.5">
                {improveResult.keyChanges.map((change, i) => (
                  <li key={i}>{change}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Before vs After View */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto p-1">
            <div className="p-3 rounded-xl bg-slate-950/80 border border-white/[0.06] space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">Original Version</span>
              <pre className="text-[11px] text-slate-400 whitespace-pre-wrap font-mono leading-relaxed">
                {JSON.stringify(currentData, null, 2)}
              </pre>
            </div>
            <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-1">
              <span className="text-[10px] font-bold uppercase text-emerald-400 block tracking-wider">AI Improved Version</span>
              <pre className="text-[11px] text-emerald-200 whitespace-pre-wrap font-mono leading-relaxed">
                {JSON.stringify(improveResult?.improvedData, null, 2)}
              </pre>
            </div>
          </div>

          <DialogFooter className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowDiffModal(false)}
              className="h-9 text-xs bg-white/[0.05] border-white/[0.08] text-slate-300 hover:text-white rounded-xl"
            >
              Cancel / Reject
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleApplyChanges}
              className="h-9 text-xs bg-gradient-to-r from-cyan-400 to-emerald-400 hover:opacity-90 text-slate-950 font-bold px-4 flex items-center gap-1.5 rounded-xl shadow-md shadow-cyan-500/20 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Apply AI Improvements</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
