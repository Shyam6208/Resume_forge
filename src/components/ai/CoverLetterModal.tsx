"use client";

import { useState, useRef, useCallback } from "react";
import { useResumeStore } from "@/store/resume.store";
import type { CoverLetterResult } from "@/lib/ai/types";
import {
  generateClientCacheKey,
  getClientCached,
  setClientCached,
} from "@/lib/ai/ai-client-cache";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { FileText, Sparkles, Loader2, Copy, Download, Check } from "lucide-react";
import toast from "react-hot-toast";

interface CoverLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CoverLetterModal({ isOpen, onClose }: CoverLetterModalProps) {
  const currentResume = useResumeStore((s) => s.currentResume);

  const [jobTitle, setJobTitle] = useState(currentResume?.targetJob || currentResume?.title || "Software Engineer");
  const [companyName, setCompanyName] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  const [isGenerating, setIsGenerating] = useState(false);
  const [coverLetter, setCoverLetter] = useState<CoverLetterResult | null>(null);
  const [editableText, setEditableText] = useState("");

  // Duplicate request prevention
  const inFlightRef = useRef(false);

  const handleGenerate = useCallback(async () => {
    if (!currentResume) return;
    if (!jobTitle.trim() || !companyName.trim()) {
      toast.error("Please provide both Job Title and Company Name");
      return;
    }

    // Prevent duplicate concurrent requests
    if (inFlightRef.current) return;

    // Client-side cache check
    const cacheKey = generateClientCacheKey({
      resumeId: currentResume.id,
      operation: "cover-letter",
      content: currentResume.data,
      targetRole: jobTitle,
      jobDescription: companyName + "|" + jobDescription,
    });
    const cached = getClientCached<CoverLetterResult>(cacheKey);
    if (cached) {
      setCoverLetter(cached);
      setEditableText(cached.coverLetterText);
      toast.success("Cover Letter loaded from cache!", { duration: 2000 });
      return;
    }

    inFlightRef.current = true;
    setIsGenerating(true);
    const toastId = toast.loading("📄 Generating tailored Cover Letter...");

    try {
      const res = await fetch("/api/ai/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeData: currentResume.data,
          jobTitle,
          companyName,
          jobDescription,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to generate cover letter");
      }

      const result: CoverLetterResult = await res.json();
      setCoverLetter(result);
      setEditableText(result.coverLetterText);

      // Cache the result
      setClientCached(cacheKey, result);

      toast.dismiss(toastId);
      toast.success("Cover Letter generated!", { duration: 3000 });
    } catch (err: unknown) {
      console.error("Cover Letter error:", err);
      toast.dismiss(toastId);
      toast.error(err instanceof Error ? err.message : "Failed to generate cover letter", { duration: 4000 });
    } finally {
      setIsGenerating(false);
      inFlightRef.current = false;
    }
  }, [currentResume, jobTitle, companyName, jobDescription]);

  const handleCopy = () => {
    navigator.clipboard.writeText(editableText);
    toast.success("Cover letter copied to clipboard!");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95vw] max-w-3xl bg-slate-900 border-slate-800 text-slate-100 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            <span>AI Cover Letter Generator</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400">
            Create a professional, highly-tailored cover letter based on your resume and target role.
          </DialogDescription>
        </DialogHeader>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Target Job Title *</label>
            <Input
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g. Senior Frontend Developer"
              className="text-xs bg-slate-950 border-slate-800 text-white"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Company Name *</label>
            <Input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Acme Corp"
              className="text-xs bg-slate-950 border-slate-800 text-white"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-300">Job Description (Optional)</label>
          <Textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste job posting details to align keywords..."
            className="min-h-[70px] text-xs bg-slate-950 border-slate-800 text-white"
          />
        </div>

        <Button
          type="button"
          disabled={isGenerating || !jobTitle.trim() || !companyName.trim()}
          onClick={handleGenerate}
          className="w-full h-10 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generating Cover Letter...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Generate AI Cover Letter</span>
            </>
          )}
        </Button>

        {/* Generated Cover Letter Editor */}
        {coverLetter && (
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Generated Cover Letter (Editable)</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="h-8 text-xs bg-slate-950 border-slate-800 text-slate-200 hover:bg-slate-800 hover:text-white"
              >
                <Copy className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                <span>Copy Text</span>
              </Button>
            </div>

            <Textarea
              value={editableText}
              onChange={(e) => setEditableText(e.target.value)}
              className="min-h-[220px] text-xs bg-slate-950 border-slate-800 text-slate-100 font-mono leading-relaxed p-4 rounded-xl"
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
