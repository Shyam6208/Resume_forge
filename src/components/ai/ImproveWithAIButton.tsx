"use client";

import { useState, useRef, useCallback } from "react";
import { useResumeStore } from "@/store/resume.store";
import { useAuthStore } from "@/store/auth.store";
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
import { Sparkles, Loader2, Check, ArrowRight, RefreshCw, Undo2 } from "lucide-react";
import toast from "react-hot-toast";

interface ImproveWithAIButtonProps {
  sectionKey: SectionKey;
  currentData: unknown;
  className?: string;
}

export function ImproveWithAIButton({
  sectionKey,
  currentData,
  className = "",
}: ImproveWithAIButtonProps) {
  const userType = useAuthStore((s) => s.userType);
  const updateSection = useResumeStore((s) => s.updateSection);
  const currentResume = useResumeStore((s) => s.currentResume);

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

    // Client-side cache check
    const cacheKey = generateClientCacheKey({
      resumeId: currentResume?.id,
      operation: "improve-section",
      sectionKey,
      content: currentData,
      targetRole: currentResume?.targetJob || currentResume?.title,
    });
    const cached = getClientCached<SectionImproveResult>(cacheKey);
    if (cached) {
      setImproveResult(cached);
      setShowDiffModal(true);
      toast.success("AI Improvement loaded from cache!", { duration: 2000 });
      return;
    }

    inFlightRef.current = true;
    setIsLoading(true);
    const toastId = toast.loading(`✨ Improving ${sectionKey} section with AI...`);

    try {
      const res = await fetch("/api/ai/improve-section", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionKey,
          currentSectionData: currentData,
          userType: userType || "developer",
          targetJob: currentResume?.targetJob || currentResume?.title,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to improve section");
      }

      const result: SectionImproveResult = await res.json();
      setImproveResult(result);
      setShowDiffModal(true);

      // Cache the result
      setClientCached(cacheKey, result);

      toast.dismiss(toastId);
      toast.success("AI Improvement Ready!", { duration: 3000 });
    } catch (err: unknown) {
      console.error("Improve section error:", err);
      const msg = err instanceof Error ? err.message : "Failed to improve section";
      toast.dismiss(toastId);
      toast.error(msg, { duration: 4000 });
    } finally {
      setIsLoading(false);
      inFlightRef.current = false;
    }
  }, [currentData, currentResume, sectionKey, userType]);

  const handleApplyChanges = () => {
    if (improveResult?.improvedData) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      updateSection(sectionKey, improveResult.improvedData as any);
      toast.success("AI Improvements applied!");
      setShowDiffModal(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={isLoading}
        onClick={handleImprove}
        className={`h-7 px-2.5 text-xs text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 font-semibold flex items-center gap-1.5 ${className}`}
        title={`Improve ${sectionKey} with AI`}
      >
        {isLoading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
        ) : (
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
        )}
        <span>✨ Improve with AI</span>
      </Button>

      {/* Diff & Review Modal */}
      <Dialog open={showDiffModal} onOpenChange={setShowDiffModal}>
        <DialogContent className="w-[95vw] max-w-2xl bg-slate-900 border-slate-800 text-slate-100 p-6 space-y-4">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Review AI Improvements — {sectionKey.toUpperCase()}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              {improveResult?.explanation || "Review proposed AI enhancements before applying."}
            </DialogDescription>
          </DialogHeader>

          {/* Key Changes Summary */}
          {improveResult?.keyChanges && improveResult.keyChanges.length > 0 && (
            <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs space-y-1">
              <span className="font-bold text-indigo-300">Key Enhancements:</span>
              <ul className="list-disc list-inside text-slate-300 space-y-0.5">
                {improveResult.keyChanges.map((change, i) => (
                  <li key={i}>{change}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Before vs After View */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto p-1">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-500 block">Original Version</span>
              <pre className="text-[11px] text-slate-400 whitespace-pre-wrap font-mono leading-relaxed">
                {JSON.stringify(currentData, null, 2)}
              </pre>
            </div>
            <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-1">
              <span className="text-[10px] font-bold uppercase text-emerald-400 block">AI Improved Version</span>
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
              className="h-9 text-xs bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
            >
              Cancel / Reject
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleApplyChanges}
              className="h-9 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 flex items-center gap-1.5"
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
