"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useResumeStore } from "@/store/resume.store";
import { useUIStore } from "@/store/ui.store";
import { useInterviewStore } from "@/store/interview.store";
import { buildInterviewContext } from "@/lib/ai/interview-context";
import { analyzeLocalRelevance } from "@/lib/role-matching";
import type { InterviewPrepResult, InterviewQuestion } from "@/lib/ai/types";
import {
  generateClientCacheKey,
  getClientCached,
  setClientCached,
} from "@/lib/ai/ai-client-cache";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { 
  HelpCircle, Sparkles, Loader2, CheckCircle2, MessageSquare, Target, Users, Code, Briefcase, FileText, AlertTriangle, Info, ShieldCheck, Zap
} from "lucide-react";
import toast from "react-hot-toast";

interface InterviewPrepModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const getCoverageLabel = (count: number) => {
  if (count >= 10) return { label: "Strong", color: "text-emerald-400" };
  if (count >= 5) return { label: "Good", color: "text-emerald-400" };
  if (count >= 1) return { label: "Partial", color: "text-amber-400" };
  return { label: "Needs Attention", color: "text-rose-400" };
};

const getAlignmentLabel = (isJDValid: boolean, jdMatchResult: any) => {
  if (!isJDValid) return { label: "Limited Data", color: "text-slate-400" };
  if (!jdMatchResult) return { label: "Needs Attention", color: "text-rose-400" };
  
  const total = (jdMatchResult.matchedSkills?.length || 0) + (jdMatchResult.missingSkills?.length || 0);
  if (total === 0) return { label: "Limited Data", color: "text-slate-400" };
  
  const ratio = (jdMatchResult.matchedSkills?.length || 0) / total;
  
  if (ratio >= 0.8) return { label: "Strong", color: "text-emerald-400" };
  if (ratio >= 0.5) return { label: "Good", color: "text-emerald-400" };
  if (ratio > 0) return { label: "Partial", color: "text-amber-400" };
  return { label: "Needs Attention", color: "text-rose-400" };
};

export function InterviewPrepModal({ isOpen, onClose }: InterviewPrepModalProps) {
  const currentResume = useResumeStore((s) => s.currentResume);
  const targetJob = currentResume?.targetJob || "";
  const { jobDescription, jdMatchResult } = useUIStore();
  
  const {
    phase,
    setPhase,
    prepResult,
    setPrepResult,
    isGenerating,
    setIsGenerating,
    selectedCategories,
    setSelectedCategories,
  } = useInterviewStore();

  const [activeCategory, setActiveCategory] = useState<string>("All");

  const isJDValid = jobDescription.trim().length >= 30;

  // Local Intelligence
  const localRelevance = useMemo(() => {
    if (!currentResume) return null;
    return analyzeLocalRelevance(currentResume.data, targetJob, "developer");
  }, [currentResume, targetJob]);

  // Duplicate request prevention
  const inFlightRef = useRef(false);

  // Sync phase based on prepResult
  useEffect(() => {
    if (!isOpen) return;
    if (prepResult && phase === "setup") {
      setPhase("reviewing_prep");
    }
  }, [isOpen, prepResult, phase, setPhase]);

  const handleGenerate = useCallback(async (isRegenerate = false) => {
    if (!currentResume) return;
    if (!isJDValid) {
      return;
    }

    // Prevent duplicate concurrent requests
    if (inFlightRef.current) return;

    // Build the deterministic interview context
    const interviewContext = buildInterviewContext(targetJob, jdMatchResult);

    // Client-side cache check
    const cacheKey = generateClientCacheKey({
      resumeId: currentResume.id,
      operation: "interview-prep",
      content: currentResume.data,
      jobDescription: jobDescription,
      targetRole: interviewContext.targetRole,
    });
    
    if (!isRegenerate) {
      const cached = getClientCached<InterviewPrepResult>(cacheKey);
      if (cached) {
        setPrepResult(cached);
        setPhase("reviewing_prep");
        toast.success("Interview Prep loaded from cache!", { duration: 2000 });
        return;
      }
    }

    inFlightRef.current = true;
    setIsGenerating(true);
    setPhase("generating_prep");
    const toastId = toast.loading("🎯 Generating role-specific Interview Questions...");

    try {
      const res = await fetch("/api/ai/interview-prep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeData: currentResume.data,
          jobDescription,
          jdMatchContext: interviewContext.jdMatchContext,
          targetRole: interviewContext.targetRole,
          roleContext: interviewContext.roleContext,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to generate interview prep");
      }

      const result: InterviewPrepResult = await res.json();
      setPrepResult(result);
      setPhase("reviewing_prep");

      // Cache the result
      setClientCached(cacheKey, result);

      toast.dismiss(toastId);
      toast.success("Interview Prep generated!", { duration: 3000 });
    } catch (err: unknown) {
      console.error("Interview Prep error:", err);
      toast.dismiss(toastId);
      toast.error(err instanceof Error ? err.message : "Failed to generate interview prep", { duration: 4000 });
      setPhase("setup");
    } finally {
      setIsGenerating(false);
      inFlightRef.current = false;
    }
  }, [currentResume, jobDescription, targetJob, jdMatchResult, setPhase, setPrepResult, setIsGenerating, isJDValid]);

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
          <div className="space-y-6">
            {/* Context Header */}
            <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/20">
              <h3 className="text-sm font-bold text-indigo-300">Target Role: {targetJob || "Not specified"}</h3>
              <p className="text-xs text-indigo-200/70 mt-1">Your preparation plan is based on your resume, target role, and job description.</p>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-500">Role Fit</span>
                <div className={`text-sm font-bold ${localRelevance ? getCoverageLabel(localRelevance.matchedSkills.length).color : "text-slate-400"}`}>
                  {localRelevance ? getCoverageLabel(localRelevance.matchedSkills.length).label : "Limited Data"}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-500">Resume Coverage</span>
                <div className={`text-sm font-bold ${localRelevance ? getCoverageLabel(localRelevance.matchedSkills.length).color : "text-slate-400"}`}>
                  {localRelevance ? getCoverageLabel(localRelevance.matchedSkills.length).label : "Limited Data"}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-500">JD Alignment</span>
                <div className={`text-sm font-bold ${getAlignmentLabel(isJDValid, jdMatchResult).color}`}>
                  {getAlignmentLabel(isJDValid, jdMatchResult).label}
                </div>
              </div>
            </div>

            {/* Missing JD State Banner */}
            {!isJDValid && (
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-700 flex items-start gap-3">
                <Info className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-slate-200">Job Description not added</h4>
                  <p className="text-xs text-slate-400 mt-1">You can still prepare using your resume and target role. Add a job description to unlock job-specific preparation.</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Strengths */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 mb-2">
                  <ShieldCheck className="w-4 h-4" />
                  <h4 className="text-sm font-bold">Your Strengths</h4>
                </div>
                {localRelevance && localRelevance.matchedSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {Array.from(new Set([...localRelevance.matchedSkills, ...(jdMatchResult?.matchedSkills || [])])).slice(0, 10).map((skill, i) => (
                      <Badge key={i} variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-300 border-emerald-500/20">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">No matching skills detected yet.</p>
                )}
              </div>

              {/* Prepare More */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-amber-400 mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  <h4 className="text-sm font-bold">Prepare More</h4>
                </div>
                {localRelevance && localRelevance.missingRecommendedSkills.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-[10px] text-slate-500 mb-2">Not detected in your current resume.</p>
                    <div className="flex flex-wrap gap-1.5">
                      {Array.from(new Set([...localRelevance.missingRecommendedSkills, ...(jdMatchResult?.missingSkills || [])])).slice(0, 10).map((skill, i) => (
                        <Badge key={i} variant="outline" className="text-[10px] bg-amber-500/10 text-amber-300 border-amber-500/20">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">You have great coverage of recommended skills.</p>
                )}
              </div>
            </div>

            {/* Role Focus */}
            {localRelevance && (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="text-sm font-bold text-white">Role Focus</h4>
                <p className="text-xs text-slate-400">Optimized for: <span className="text-slate-200 font-semibold">{localRelevance.resolvedProfile.title}</span></p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {localRelevance.resolvedProfile.coreSkills.slice(0, 5).map((skill, i) => (
                    <Badge key={i} variant="secondary" className="text-[10px] bg-slate-800 text-slate-300">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Categories */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white">Interview Categories</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { id: "Technical", icon: Code, desc: "Technologies and concepts relevant to your target role" },
                  { id: "Resume Based", icon: FileText, desc: "Your actual experience, skills, and projects" },
                  { id: "Job Description", icon: Briefcase, desc: "Requirements detected in this job description", reqJD: true },
                  { id: "HR & Behavioral", icon: Users, desc: "Communication, teamwork, and situations" },
                  { id: "Project Deep Dive", icon: Target, desc: "Explore your actual projects and technical decisions" }
                ].map((cat) => {
                  const Icon = cat.icon;
                  const isDisabled = cat.reqJD && !isJDValid;
                  const isSelected = selectedCategories.includes(cat.id);

                  return (
                    <div 
                      key={cat.id} 
                      onClick={() => {
                        if (isDisabled) return;
                        if (isSelected && selectedCategories.length > 1) {
                          setSelectedCategories(selectedCategories.filter(c => c !== cat.id));
                        } else if (!isSelected) {
                          setSelectedCategories([...selectedCategories, cat.id]);
                        }
                      }}
                      className={`p-3 rounded-xl border flex items-start gap-3 transition-colors cursor-pointer select-none ${
                        isDisabled 
                          ? "opacity-50 cursor-not-allowed bg-slate-950 border-slate-800" 
                          : isSelected 
                            ? "bg-indigo-600/20 border-indigo-500/50" 
                            : "bg-slate-950 border-slate-800 hover:border-slate-600"
                      }`}
                    >
                      <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${isSelected ? "text-indigo-400" : "text-slate-500"}`} />
                      <div>
                        <h5 className={`text-xs font-bold ${isSelected ? "text-indigo-200" : "text-slate-300"}`}>{cat.id}</h5>
                        <p className="text-[10px] text-slate-500 mt-1">{cat.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <Button
              type="button"
              disabled={isGenerating || (!isJDValid && selectedCategories.includes("Job Description"))}
              onClick={() => handleGenerate(false)}
              className="w-full h-12 text-sm bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Generating Preparation Plan...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-amber-300" />
                  <span>Start Interview Preparation</span>
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
                disabled={isGenerating || !isJDValid}
                onClick={() => handleGenerate(true)}
                className="h-8 text-xs bg-slate-950 border-slate-800 text-slate-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
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
