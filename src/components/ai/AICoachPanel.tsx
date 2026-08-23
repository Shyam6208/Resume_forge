"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import { useResumeStore } from "@/store/resume.store";
import { useUIStore } from "@/store/ui.store";
import { useAuthStore } from "@/store/auth.store";
import type { AIAnalysisResult, JDMatchResult } from "@/lib/ai/types";
import {
  generateClientCacheKey,
  getClientCached,
  setClientCached,
} from "@/lib/ai/ai-client-cache";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Sparkles,
  Bot,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileCheck2,
  BrainCircuit,
  Loader2,
  Award,
  Zap,
  Target,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  FileText,
  LineChart,
  HelpCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { CoverLetterModal } from "./CoverLetterModal";
import { InterviewPrepModal } from "./InterviewPrepModal";

export function AICoachPanel() {
  const currentResume = useResumeStore((s) => s.currentResume);
  const userType = useAuthStore((s) => s.userType);

  const [activeTab, setActiveTab] = useState<"analysis" | "jd-match" | "skill-gap">("analysis");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);

  const {
    jobDescription,
    setJobDescription,
    jdMatchResult: jdMatch,
    setJdMatchResult: setJdMatch,
  } = useUIStore();

  const [isMatching, setIsMatching] = useState(false);
  const [isCoverLetterModalOpen, setIsCoverLetterModalOpen] = useState(false);
  const [isInterviewPrepModalOpen, setIsInterviewPrepModalOpen] = useState(false);

  // Duplicate request prevention
  const analyzeInFlight = useRef(false);
  const matchInFlight = useRef(false);
  const lastAnalyzedJdRef = useRef(jobDescription);
  const lastAnalyzedResumeIdRef = useRef(currentResume?.id || "");

  // Skill Gap derivation
  const skillGapData = useMemo(() => {
    if (!jdMatch) return null;
    if (jobDescription !== lastAnalyzedJdRef.current) return null;
    if (currentResume?.id !== lastAnalyzedResumeIdRef.current) return null;

    const strongMatch = new Set<string>();
    const notFound = new Set<string>();
    const review = new Set<string>();

    jdMatch.matchedSkills?.forEach((s) => {
      const val = s.trim();
      if (val) strongMatch.add(val);
    });

    const checkMissing = (arr?: string[]) => {
      arr?.forEach((s) => {
        const val = s.trim();
        if (val && !strongMatch.has(val)) notFound.add(val);
      });
    };
    checkMissing(jdMatch.missingSkills);
    checkMissing(jdMatch.missingKeywords);

    jdMatch.keywordHeatmap?.forEach((k) => {
      if (k.status === "partial") {
        const val = k.keyword.trim();
        if (val && !strongMatch.has(val) && !notFound.has(val)) {
          review.add(val);
        }
      }
    });

    return {
      strongMatch: Array.from(strongMatch),
      notFoundInResume: Array.from(notFound),
      needsReview: Array.from(review),
    };
  }, [jdMatch, jobDescription, currentResume?.id]);

  // Accordion toggles
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    keywords: true,
    strengths: false,
    suggestions: true,
  });

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleRunAnalysis = useCallback(async () => {
    if (!currentResume) {
      toast.error("No resume available to analyze");
      return;
    }

    // Prevent duplicate concurrent requests
    if (analyzeInFlight.current) return;

    // Input validation — check resume has content
    const data = currentResume.data;
    const hasContent =
      data.summary ||
      (data.experience && data.experience.length > 0) ||
      (data.projects && data.projects.length > 0) ||
      (data.skills && Object.keys(data.skills).length > 0);

    if (!hasContent) {
      toast.error("Please add some content to your resume before analyzing.");
      return;
    }

    // Client-side cache check
    const cacheKey = generateClientCacheKey({
      resumeId: currentResume.id,
      operation: "analyze",
      content: currentResume.data,
      targetRole: currentResume.targetJob || currentResume.title,
    });
    const cached = getClientCached<AIAnalysisResult>(cacheKey);
    if (cached) {
      setAnalysis(cached);
      toast.success("AI Analysis loaded from cache!", { duration: 2000 });
      return;
    }

    analyzeInFlight.current = true;
    setIsAnalyzing(true);
    const toastId = toast.loading("🤖 AI Coach analyzing your resume...");

    try {
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeData: currentResume.data,
          userType: userType || "developer",
          targetJob: currentResume.targetJob || currentResume.title,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to analyze resume");
      }

      const result: AIAnalysisResult = await res.json();
      setAnalysis(result);

      // Cache the result
      setClientCached(cacheKey, result);

      toast.dismiss(toastId);
      toast.success("AI Analysis Complete!", { duration: 3000 });
    } catch (err: unknown) {
      console.error("AI Analysis error:", err);
      const msg = err instanceof Error ? err.message : "Failed to analyze resume";
      toast.dismiss(toastId);
      toast.error(msg, { duration: 4000 });
    } finally {
      setIsAnalyzing(false);
      analyzeInFlight.current = false;
    }
  }, [currentResume, userType]);

  const handleRunJDMatch = useCallback(async () => {
    if (!currentResume) {
      toast.error("No resume available");
      return;
    }
    if (!jobDescription.trim() || jobDescription.trim().length < 30) {
      toast.error("Please paste at least 30 characters of a Job Description");
      return;
    }

    // Prevent duplicate concurrent requests
    if (matchInFlight.current) return;

    // Client-side cache check
    const cacheKey = generateClientCacheKey({
      resumeId: currentResume.id,
      operation: "jd-match",
      content: currentResume.data,
      jobDescription: jobDescription,
    });
    const cached = getClientCached<JDMatchResult>(cacheKey);
    if (cached) {
      setJdMatch(cached);
      lastAnalyzedJdRef.current = jobDescription;
      lastAnalyzedResumeIdRef.current = currentResume.id;
      toast.success("JD Match loaded from cache!", { duration: 2000 });
      return;
    }

    matchInFlight.current = true;
    setIsMatching(true);
    const toastId = toast.loading("🎯 Matching resume against Job Description...");

    try {
      const res = await fetch("/api/ai/jd-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeData: currentResume.data,
          jobDescription,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to match JD");
      }

      const result: JDMatchResult = await res.json();
      setJdMatch(result);
      lastAnalyzedJdRef.current = jobDescription;
      lastAnalyzedResumeIdRef.current = currentResume.id;

      // Cache the result
      setClientCached(cacheKey, result);

      toast.dismiss(toastId);
      toast.success("JD Match Analysis Complete!", { duration: 3000 });
    } catch (err: unknown) {
      console.error("JD Match error:", err);
      const msg = err instanceof Error ? err.message : "Failed to match JD";
      toast.dismiss(toastId);
      toast.error(msg, { duration: 4000 });
    } finally {
      setIsMatching(false);
      matchInFlight.current = false;
    }
  }, [currentResume, jobDescription, setJdMatch]);

  return (
    <div className="space-y-4 text-slate-100">
      {/* Header Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              🤖 AI Resume Coach
            </h3>
            <p className="text-[11px] text-slate-400">Powered by Gemini HR & ATS Scanner</p>
          </div>
        </div>
      </div>

      {/* Mode Switcher Pills */}
      <div className="grid grid-cols-3 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab("analysis")}
          className={`py-1.5 rounded-lg font-semibold transition-all ${
            activeTab === "analysis"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Full AI Analysis
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("jd-match")}
          className={`py-1.5 rounded-lg font-semibold transition-all ${
            activeTab === "jd-match"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          JD Matcher
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("skill-gap")}
          className={`py-1.5 rounded-lg font-semibold transition-all ${
            activeTab === "skill-gap"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Skill Gap
        </button>
      </div>

      {/* TAB 1: FULL AI ANALYSIS */}
      {activeTab === "analysis" && (
        <div className="space-y-4">
          {!analysis && (
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
                <BrainCircuit className="w-6 h-6 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">Get Executive HR & ATS Feedback</h4>
                <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                  Our Gemini HR Recruiter model will evaluate your resume, spot missing keywords, grammar gaps, and recruiter shortlist probability.
                </p>
              </div>
              <Button
                type="button"
                disabled={isAnalyzing}
                onClick={handleRunAnalysis}
                className="w-full h-10 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing Resume...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Analyze Resume with AI</span>
                  </>
                )}
              </Button>
            </div>
          )}

          {analysis && (
            <div className="space-y-3.5">
              {/* Strengths */}
              {analysis.strengths?.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Key Resume Strengths</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {analysis.strengths.map((str, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-400 font-bold mt-0.5">•</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Weaknesses & Blindspots */}
              {analysis.weaknesses?.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-rose-950/20 border border-rose-500/20 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-rose-400">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>Areas for Improvement</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {analysis.weaknesses.map((weak, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-rose-400 font-bold mt-0.5">•</span>
                        <span>{weak}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* ATS Shortlist Improvements */}
              {analysis.atsImprovements?.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-400">
                    <Target className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>ATS Shortlist Recommendations</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {analysis.atsImprovements.map((tip, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-indigo-400 font-bold mt-0.5">✓</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Categorized Missing Keywords */}
              {analysis.missingKeywords && (
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleSection("keywords")}
                  >
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-bold text-white">Missing Skill Keywords</span>
                    </div>
                    {expandedSections.keywords ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>

                  {expandedSections.keywords && (
                    <div className="space-y-2.5 pt-1">
                      {analysis.missingKeywords.technicalSkills?.length > 0 && (
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Technical Skills</span>
                          <div className="flex flex-wrap gap-1.5">
                            {analysis.missingKeywords.technicalSkills.map((kw, i) => (
                              <span key={i} className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-300 border border-rose-500/20 text-[11px] font-mono">
                                + {kw}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {analysis.missingKeywords.tools?.length > 0 && (
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Tools & Platforms</span>
                          <div className="flex flex-wrap gap-1.5">
                            {analysis.missingKeywords.tools.map((kw, i) => (
                              <span key={i} className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[11px] font-mono">
                                + {kw}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {analysis.missingKeywords.frameworks?.length > 0 && (
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Frameworks & Libraries</span>
                          <div className="flex flex-wrap gap-1.5">
                            {analysis.missingKeywords.frameworks.map((kw, i) => (
                              <span key={i} className="px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-[11px] font-mono">
                                + {kw}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {analysis.missingKeywords.industryTerms?.length > 0 && (
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Industry Terms</span>
                          <div className="flex flex-wrap gap-1.5">
                            {analysis.missingKeywords.industryTerms.map((kw, i) => (
                              <span key={i} className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[11px] font-mono">
                                + {kw}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* High-Impact Action Verbs */}
              {analysis.powerfulActionVerbs?.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>Recommended Power Verbs</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.powerfulActionVerbs.map((verb, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(verb);
                          toast.success(`Copied "${verb}" to clipboard!`);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border border-white/[0.06] text-xs font-medium transition-colors"
                        title="Click to copy"
                      >
                        {verb}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Grammar & Phrasing Suggestions */}
              {analysis.grammarSuggestions?.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>High-Impact Phrasing Upgrades</span>
                  </div>
                  <div className="space-y-2">
                    {analysis.grammarSuggestions.map((item, i) => (
                      <div key={i} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
                        <div className="text-slate-400 line-through text-[11px]">{item.original}</div>
                        <div className="text-emerald-300 font-semibold">{item.correction}</div>
                        <div className="text-[10px] text-slate-500 italic">{item.reason}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Section Suggestions */}
              {analysis.sectionSuggestions?.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <FileCheck2 className="w-4 h-4 text-indigo-400" />
                    <span>Section-Specific Advice</span>
                  </div>
                  <div className="space-y-2">
                    {analysis.sectionSuggestions.map((sec, i) => (
                      <div key={i} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1.5">
                        <div className="font-bold text-white capitalize">{sec.title || sec.sectionKey}</div>
                        <div className="text-[11px] text-amber-300">{sec.currentIssue}</div>
                        <div className="text-[11px] text-slate-300">{sec.suggestedImprovement}</div>
                        {sec.exampleText && (
                          <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04] text-[11px] text-indigo-300 font-mono">
                            &ldquo;{sec.exampleText}&rdquo;
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended Certifications */}
              {analysis.recommendedCertifications?.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Award className="w-4 h-4 text-indigo-400" />
                    <span>Recommended Certifications</span>
                  </div>
                  <div className="space-y-1.5">
                    {analysis.recommendedCertifications.map((cert, i) => (
                      <div key={i} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                        <div className="font-semibold text-white">{cert.name}</div>
                        <div className="text-[11px] text-indigo-400">{cert.provider} — {cert.relevance}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Re-analyze Button */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isAnalyzing}
                onClick={handleRunAnalysis}
                className="w-full h-10 text-xs bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800 hover:text-white rounded-xl flex items-center justify-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Re-analyze Resume with AI</span>
              </Button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: JOB DESCRIPTION MATCHER */}
      {activeTab === "jd-match" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-white">Target Job Description</label>
            <Textarea
              placeholder="Paste the job description here..."
              className="min-h-[160px] text-xs leading-relaxed resize-none bg-slate-900 border-slate-800"
              value={jobDescription}
              onChange={(e) => {
                setJobDescription(e.target.value);
                if (jdMatch) setJdMatch(null);
              }}
            />
            <Button
              type="button"
              disabled={isMatching || jobDescription.trim().length < 30}
              onClick={handleRunJDMatch}
              className="w-full h-10 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2"
            >
              {isMatching ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Matching JD Keywords...</span>
                </>
              ) : (
                <>
                  <Target className="w-4 h-4" />
                  <span>Analyze Resume Against JD</span>
                </>
              )}
            </Button>
          </div>

          {jdMatch && (
            <div className="space-y-4">
              {/* Categorized Skills */}
              {jdMatch.missingSkills?.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-rose-400 flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Missing Job Skills</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {jdMatch.missingSkills.map((skill, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-300 border border-rose-500/20 text-xs">
                        + {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {jdMatch.matchedSkills?.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Matched Requirements</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {jdMatch.matchedSkills.map((skill, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs">
                        ✓ {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="pt-2 grid grid-cols-2 gap-2">
            <Button
              type="button"
              onClick={() => setIsCoverLetterModalOpen(true)}
              className="w-full h-9 text-xs bg-slate-900 border border-indigo-500/30 text-indigo-300 font-semibold rounded-xl hover:bg-slate-800"
            >
              <FileText className="w-3.5 h-3.5 mr-1.5" />
              <span>Cover Letter</span>
            </Button>
            <Button
              type="button"
              onClick={() => setIsInterviewPrepModalOpen(true)}
              className="w-full h-9 text-xs bg-gradient-to-r from-emerald-600/20 to-indigo-600/20 border border-emerald-500/30 text-emerald-300 font-semibold rounded-xl hover:from-emerald-600/30 hover:to-indigo-600/30"
            >
              <HelpCircle className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
              <span>AI Mock Interview</span>
            </Button>
          </div>
        </div>
      )}

      {/* TAB 3: SKILL GAP */}
      {activeTab === "skill-gap" && (
        <div className="space-y-4">
          {jobDescription.trim().length < 30 ? (
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-800/50 border border-slate-700/50 text-slate-400 flex items-center justify-center mx-auto">
                <Target className="w-5 h-5" />
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-[250px] mx-auto">
                Add a valid job description to see your skill gaps.
              </p>
              <Button
                type="button"
                onClick={() => setActiveTab("jd-match")}
                className="w-full h-9 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl"
              >
                Go to JD Matcher
              </Button>
            </div>
          ) : !skillGapData ? (
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
                <LineChart className="w-6 h-6 animate-pulse" />
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-[250px] mx-auto">
                Analyze the job description first to see your skill gaps.
              </p>
              <Button
                type="button"
                disabled={isMatching}
                onClick={() => {
                  setActiveTab("jd-match");
                  handleRunJDMatch();
                }}
                className="w-full h-10 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2"
              >
                {isMatching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Target className="w-4 h-4" />}
                <span>Analyze Job</span>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Strong Match */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Strong Match</span>
                </span>
                {skillGapData.strongMatch.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {skillGapData.strongMatch.map((skill: string, i: number) => (
                      <span key={i} className="px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs">
                        ✓ {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No strong matches identified yet.</p>
                )}
              </div>

              {/* Not Found in Resume */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Not Found in Resume</span>
                </span>
                {skillGapData.notFoundInResume.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {skillGapData.notFoundInResume.map((skill: string, i: number) => (
                      <span key={i} className="px-2 py-1 rounded-md bg-rose-500/10 text-rose-300 border border-rose-500/20 text-xs">
                        ⚠ {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No additional skills were identified as missing from the resume.</p>
                )}
              </div>

              {/* Needs Review */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <FileCheck2 className="w-3.5 h-3.5" />
                  <span>Needs Review</span>
                </span>
                <p className="text-[10px] text-slate-400 mb-2 leading-relaxed">
                  Some evidence may be relevant, but the resume does not provide enough specific information to confidently classify it.
                </p>
                {skillGapData.needsReview.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {skillGapData.needsReview.map((skill: string, i: number) => (
                      <span key={i} className="px-2 py-1 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs">
                        ? {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No ambiguous skill matches require review.</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <CoverLetterModal
        isOpen={isCoverLetterModalOpen}
        onClose={() => setIsCoverLetterModalOpen(false)}
      />
      <InterviewPrepModal
        isOpen={isInterviewPrepModalOpen}
        onClose={() => setIsInterviewPrepModalOpen(false)}
      />
    </div>
  );
}
