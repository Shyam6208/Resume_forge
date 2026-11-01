"use client";

import { useState, useCallback } from "react";
import { useResumeStore } from "@/store/resume.store";
import { useUIStore } from "@/store/ui.store";
import type { AutoTailorResult } from "@/lib/ai/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Sparkles,
  Loader2,
  CheckCircle2,
  ArrowRight,
  Zap,
  Target,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
} from "lucide-react";
import toast from "react-hot-toast";

interface AutoTailorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AutoTailorModal({ isOpen, onClose }: AutoTailorModalProps) {
  const currentResume = useResumeStore((s) => s.currentResume);
  const updateSection = useResumeStore((s) => s.updateSection);
  const { jobDescription: savedJD } = useUIStore();

  const [jd, setJd] = useState(savedJD || "");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AutoTailorResult | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [appliedSections, setAppliedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleGenerate = useCallback(async () => {
    if (!currentResume || !jd.trim() || jd.trim().length < 30) {
      toast.error("Please paste a job description (at least 30 characters).");
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading("🎯 Auto-tailoring your resume to match the JD...");

    try {
      const res = await fetch("/api/ai/auto-tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeData: currentResume.data,
          jobDescription: jd,
          targetRole: currentResume.targetJob || "",
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to auto-tailor");
      }

      const data: AutoTailorResult = await res.json();
      setResult(data);
      toast.dismiss(toastId);
      toast.success(`🚀 ATS Score: ${data.atsScoreBefore}% → ${data.atsScoreAfter}%!`, { duration: 4000 });
    } catch (err: unknown) {
      toast.dismiss(toastId);
      const msg = err instanceof Error ? err.message : "Failed to auto-tailor";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [currentResume, jd]);

  const applySummary = () => {
    if (!result?.tailoredSummary || !currentResume) return;
    updateSection("summary", result.tailoredSummary);
    setAppliedSections((prev) => ({ ...prev, summary: true }));
    toast.success("✅ Summary updated!");
  };

  const applyExperience = () => {
    if (!result?.tailoredExperience?.length || !currentResume?.data?.experience) return;
    const updated = currentResume.data.experience.map((exp) => {
      const match = result.tailoredExperience.find(
        (te) => te.company === exp.company && te.position === exp.position
      );
      if (match) {
        return { ...exp, responsibilities: match.tailoredBullets };
      }
      return exp;
    });
    updateSection("experience", updated);
    setAppliedSections((prev) => ({ ...prev, experience: true }));
    toast.success("✅ Experience bullets updated!");
  };

  const applyProjects = () => {
    if (!result?.tailoredProjects?.length || !currentResume?.data?.projects) return;
    const updated = currentResume.data.projects.map((proj) => {
      const match = result.tailoredProjects.find((tp) => tp.name === proj.name);
      if (match) {
        return {
          ...proj,
          description: match.tailoredDescription,
          highlights: match.tailoredHighlights,
        };
      }
      return proj;
    });
    updateSection("projects", updated);
    setAppliedSections((prev) => ({ ...prev, projects: true }));
    toast.success("✅ Projects updated!");
  };

  const applyAll = () => {
    if (!result) return;
    if (result.tailoredSummary) applySummary();
    if (result.tailoredExperience?.length) applyExperience();
    if (result.tailoredProjects?.length) applyProjects();
    toast.success("🎉 All tailored changes applied!", { duration: 3000 });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-[#0B0F17]/95 border-white/[0.08] backdrop-blur-2xl text-slate-100 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-white">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Zap className="w-5 h-5" />
            </div>
            1-Click ATS Auto-Tailor
          </DialogTitle>
          <DialogDescription className="text-slate-400 text-xs">
            Paste a Job Description and let AI optimize your resume with missing ATS keywords
          </DialogDescription>
        </DialogHeader>

        {/* JD Input */}
        {!result && (
          <div className="space-y-4 mt-4">
            <Textarea
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              placeholder="Paste the full Job Description here..."
              className="min-h-[200px] bg-slate-900/80 border-white/[0.08] focus:border-cyan-500 focus:ring-cyan-500/20 text-slate-100 placeholder:text-slate-500 text-xs rounded-xl"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">
                {jd.length} characters {jd.length < 30 ? "(min 30)" : "✓"}
              </span>
              <Button
                onClick={handleGenerate}
                disabled={isLoading || jd.trim().length < 30}
                className="bg-gradient-to-r from-cyan-400 to-emerald-400 hover:opacity-90 text-slate-950 font-bold px-6 rounded-xl shadow-md shadow-cyan-500/20 transition-all active:scale-95 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin text-slate-950" /> Tailoring...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 text-slate-950" /> Auto-Tailor Resume
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-5 mt-4">
            {/* ATS Score Comparison */}
            <div className="bg-slate-900/60 rounded-2xl p-5 border border-white/[0.08] shadow-inner">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">ATS Score Impact</h3>
                <div className="flex items-center gap-2.5">
                  <span className="text-xl font-bold text-rose-400">{result.atsScoreBefore}%</span>
                  <ArrowRight className="w-4 h-4 text-slate-500" />
                  <span className="text-2xl font-black text-emerald-400">{result.atsScoreAfter}%</span>
                </div>
              </div>
              <div className="relative h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-rose-500 to-amber-500 rounded-full transition-all duration-1000"
                  style={{ width: `${result.atsScoreBefore}%` }}
                />
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full transition-all duration-1000 delay-500"
                  style={{ width: `${result.atsScoreAfter}%`, opacity: 0.9 }}
                />
              </div>
              <p className="text-xs text-cyan-300 mt-2 font-medium">
                +{result.atsScoreAfter - result.atsScoreBefore} point increase with {result.keywordInjections?.length || 0} keyword optimizations
              </p>
            </div>

            {/* Keywords Injected */}
            {result.keywordInjections && result.keywordInjections.length > 0 && (
              <div className="bg-slate-900/40 rounded-2xl p-4 border border-white/[0.06]">
                <h3 className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-emerald-400" /> Keywords Injected
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {result.keywordInjections.map((kw, i) => (
                    <span key={i} className="px-2.5 py-0.5 text-[11px] bg-emerald-500/10 text-emerald-300 rounded-full border border-emerald-500/20 font-medium">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Summary Diff */}
            {result.tailoredSummary && result.tailoredSummary !== result.originalSummary && (
              <DiffSection
                title="Professional Summary"
                original={result.originalSummary}
                tailored={result.tailoredSummary}
                isExpanded={expandedSections["summary"] !== false}
                onToggle={() => toggleSection("summary")}
                onApply={applySummary}
                applied={appliedSections["summary"]}
              />
            )}

            {/* Experience Diffs */}
            {result.tailoredExperience?.map((te, i) => (
              <DiffSection
                key={`exp-${i}`}
                title={`${te.position} @ ${te.company}`}
                original={te.originalBullets?.join("\n• ") || ""}
                tailored={te.tailoredBullets?.join("\n• ") || ""}
                keywords={te.injectedKeywords}
                isExpanded={expandedSections[`exp-${i}`] !== false}
                onToggle={() => toggleSection(`exp-${i}`)}
                onApply={i === 0 ? applyExperience : undefined}
                applied={appliedSections["experience"]}
                applyLabel={i === 0 ? "Apply All Experience" : undefined}
              />
            ))}

            {/* Project Diffs */}
            {result.tailoredProjects?.map((tp, i) => (
              <DiffSection
                key={`proj-${i}`}
                title={`Project: ${tp.name}`}
                original={tp.originalDescription || ""}
                tailored={tp.tailoredDescription || ""}
                keywords={tp.injectedKeywords}
                isExpanded={expandedSections[`proj-${i}`] !== false}
                onToggle={() => toggleSection(`proj-${i}`)}
                onApply={i === 0 ? applyProjects : undefined}
                applied={appliedSections["projects"]}
                applyLabel={i === 0 ? "Apply All Projects" : undefined}
              />
            ))}

            {/* Changes Summary */}
            {result.changesSummary && result.changesSummary.length > 0 && (
              <div className="bg-slate-900/40 rounded-2xl p-4 border border-white/[0.06]">
                <h3 className="text-xs font-bold text-slate-300 mb-2">Changes Summary</h3>
                <ul className="space-y-1">
                  {result.changesSummary.map((change, i) => (
                    <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      {change}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Apply All Button */}
            <div className="flex gap-3 pt-2">
              <Button
                onClick={applyAll}
                className="flex-1 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:opacity-90 text-slate-950 font-bold rounded-xl shadow-md shadow-cyan-500/20 transition-all"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" /> Apply All Changes
              </Button>
              <Button
                onClick={() => {
                  setResult(null);
                  setAppliedSections({});
                }}
                variant="outline"
                className="bg-white/[0.05] border-white/[0.08] text-slate-300 hover:text-white rounded-xl"
              >
                Reset
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// --- Diff Section Component ---
function DiffSection({
  title,
  original,
  tailored,
  keywords,
  isExpanded,
  onToggle,
  onApply,
  applied,
  applyLabel,
}: {
  title: string;
  original: string;
  tailored: string;
  keywords?: string[];
  isExpanded: boolean;
  onToggle: () => void;
  onApply?: () => void;
  applied?: boolean;
  applyLabel?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(tailored);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900/60 rounded-2xl border border-white/[0.08] overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-white/[0.04] transition-colors"
      >
        <span className="text-sm font-semibold text-white">{title}</span>
        <div className="flex items-center gap-2">
          {keywords && keywords.length > 0 && (
            <span className="text-[10px] text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full font-medium">
              +{keywords.length} keywords
            </span>
          )}
          {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">Before</span>
              <div className="mt-1 p-3 bg-rose-500/5 border border-rose-500/15 rounded-xl text-xs text-slate-400 whitespace-pre-wrap max-h-40 overflow-y-auto">
                {original || "—"}
              </div>
            </div>
            <div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">After</span>
              <div className="mt-1 p-3 bg-emerald-500/5 border border-emerald-500/15 rounded-xl text-xs text-slate-200 whitespace-pre-wrap max-h-40 overflow-y-auto">
                {tailored || "—"}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied!" : "Copy tailored text"}
            </button>
            {onApply && (
              <Button
                onClick={onApply}
                size="sm"
                disabled={applied}
                className={`ml-auto text-xs font-semibold rounded-xl ${applied ? "bg-emerald-950/60 text-emerald-300 border border-emerald-500/30" : "bg-emerald-600 hover:bg-emerald-500 text-white"}`}
              >
                {applied ? (
                  <><CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-400" /> Applied</>
                ) : (
                  <>{applyLabel || "Apply"}</>
                )}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
