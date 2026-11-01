"use client";

import { useState, useRef, useCallback } from "react";
import { useResumeStore } from "@/store/resume.store";
import { useUIStore } from "@/store/ui.store";
import type { CoverLetterResult } from "@/lib/ai/types";
import {
  generateClientCacheKey,
  getClientCached,
  setClientCached,
} from "@/lib/ai/ai-client-cache";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { FileText, Sparkles, Loader2, Copy, Download, Check } from "lucide-react";
import toast from "react-hot-toast";

interface CoverLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CoverLetterModal({ isOpen, onClose }: CoverLetterModalProps) {
  const currentResume = useResumeStore((s) => s.currentResume);
  const jobDescription = useUIStore((s) => s.jobDescription);

  const [jobTitle, setJobTitle] = useState(currentResume?.targetJob || currentResume?.title || "Software Engineer");
  const [companyName, setCompanyName] = useState("");

  const [isGenerating, setIsGenerating] = useState(false);
  const [coverLetter, setCoverLetter] = useState<CoverLetterResult | null>(null);
  const [editableText, setEditableText] = useState("");

  // Duplicate request prevention
  const inFlightRef = useRef(false);

  const handleGenerate = useCallback(async (forceRegenerate = false) => {
    if (!currentResume) {
      toast.error("No resume available");
      return;
    }
    
    // Check if effectively empty
    const data = currentResume.data;
    const hasContent =
      data.summary ||
      (data.experience && data.experience.length > 0) ||
      (data.projects && data.projects.length > 0) ||
      (data.skills && Object.keys(data.skills).length > 0);

    if (!hasContent) {
      toast.error("Add some resume content before generating a cover letter.");
      return;
    }
    
    if (!jobDescription || jobDescription.trim().length < 30) {
      toast.error("Please add a valid job description before generating a cover letter.");
      return;
    }

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
    
    if (!forceRegenerate) {
      const cached = getClientCached<CoverLetterResult>(cacheKey);
      if (cached) {
        setCoverLetter(cached);
        setEditableText(cached.coverLetterText);
        toast.success("Loaded from cache");
        return;
      }
    }

    setIsGenerating(true);
    inFlightRef.current = true;
    const toastId = toast.loading("Generating your AI Cover Letter...");

    try {
      const res = await fetch("/api/ai/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeData: currentResume.data,
          jobDescription,
          targetRole: jobTitle.trim(),
          companyName: companyName.trim(),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to generate cover letter");
      }

      const data = await res.json();
      setCoverLetter(data);
      setEditableText(data.coverLetterText);
      setClientCached(cacheKey, data);
      toast.dismiss(toastId);
      toast.success("Cover letter ready!");
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
      <DialogContent className="w-[95vw] max-w-3xl bg-[#0B0F17]/95 border-white/[0.08] backdrop-blur-2xl text-slate-100 p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-white flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <span>AI Cover Letter Generator</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400">
            Create a professional, highly-tailored cover letter based on your resume and target role.
          </DialogDescription>
        </DialogHeader>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Target Job Title *</label>
            <Input
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g. Senior Frontend Developer"
              className="text-xs bg-slate-900/80 border-white/[0.08] focus:border-cyan-500 text-white rounded-xl"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Company Name *</label>
            <Input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Acme Corp"
              className="text-xs bg-slate-900/80 border-white/[0.08] focus:border-cyan-500 text-white rounded-xl"
            />
          </div>
        </div>
        <Button
          type="button"
          disabled={isGenerating || !jobTitle.trim() || !companyName.trim()}
          onClick={() => handleGenerate(false)}
          className="w-full h-10 text-xs bg-gradient-to-r from-cyan-400 to-emerald-400 hover:opacity-90 text-slate-950 font-bold rounded-xl shadow-md shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
              <span>Generating Cover Letter...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>Generate AI Cover Letter</span>
            </>
          )}
        </Button>

        {/* Generated Cover Letter Editor */}
        {coverLetter && (
          <div className="space-y-3 pt-2 border-t border-white/[0.08]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Generated Cover Letter (Editable)</span>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isGenerating}
                  onClick={() => handleGenerate(true)}
                  className="h-8 text-xs bg-white/[0.05] border-white/[0.08] text-slate-200 hover:bg-white/[0.1] hover:text-white rounded-xl"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1 text-cyan-400" />
                  <span>Regenerate</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="h-8 text-xs bg-white/[0.05] border-white/[0.08] text-slate-200 hover:bg-white/[0.1] hover:text-white rounded-xl"
                >
                  <Copy className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                  <span>Copy Text</span>
                </Button>
              </div>
            </div>

            <Textarea
              value={editableText}
              onChange={(e) => setEditableText(e.target.value)}
              className="min-h-[220px] text-xs bg-slate-950/80 border-white/[0.08] text-slate-100 font-mono leading-relaxed p-4 rounded-xl focus:border-cyan-500 focus:ring-cyan-500/20"
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
