"use client";

import { useState, useRef, useCallback } from "react";
import { useResumeStore } from "@/store/resume.store";
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
} from "lucide-react";
import toast from "react-hot-toast";

export function AICoachPanel() {
  const currentResume = useResumeStore((s) => s.currentResume);
  const userType = useAuthStore((s) => s.userType);

  const [activeTab, setActiveTab] = useState<"analysis" | "jd-match">("analysis");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);

  // JD Match state
  const [jobDescription, setJobDescription] = useState("");
  const [isMatching, setIsMatching] = useState(false);
  const [jdMatch, setJdMatch] = useState<JDMatchResult | null>(null);

  // Duplicate request prevention
  const analyzeInFlight = useRef(false);
  const matchInFlight = useRef(false);

  // Accordion toggles
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    verdict: true,
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
      jobDescription,
    });
    const cached = getClientCached<JDMatchResult>(cacheKey);
    if (cached) {
      setJdMatch(cached);
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
  }, [currentResume, jobDescription]);

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
      <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
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
            <div className="space-y-4">
              {/* Score Badges Summary */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">Overall</span>
                  <span className="text-lg font-extrabold text-indigo-400">{analysis.overallRating}/100</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">ATS Score</span>
                  <span className="text-lg font-extrabold text-emerald-400">{analysis.atsRating}%</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">Recruiter</span>
                  <span className="text-lg font-extrabold text-amber-400">{analysis.recruiterScore}%</span>
                </div>
              </div>

              {/* Recruiter Verdict Card */}
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-indigo-500/30 space-y-2">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleSection("verdict")}
                >
                  <div className="flex items-center gap-2">
                    <FileCheck2 className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-bold text-white">Recruiter Verdict</span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-2 py-0.2 font-semibold ${
                        analysis.recruiterVerdict.shortlistStatus === "Shortlisted"
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                          : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                      }`}
                    >
                      {analysis.recruiterVerdict.shortlistStatus}
                    </Badge>
                  </div>
                  {expandedSections.verdict ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>

                {expandedSections.verdict && (
                  <p className="text-xs text-slate-300 leading-relaxed pt-1">
                    {analysis.recruiterVerdict.summary}
                  </p>
                )}
              </div>

              {/* Categorized Missing Keywords */}
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
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
                  <div className="space-y-2 pt-1">
                    {analysis.missingKeywords.technicalSkills?.length > 0 && (
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Technical Skills</span>
                        <div className="flex flex-wrap gap-1.5">
                          {analysis.missingKeywords.technicalSkills.map((kw, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-300 border border-rose-500/20 text-[11px]">
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
                            <span key={i} className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[11px]">
                              + {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Recommended Certifications */}
              {analysis.recommendedCertifications?.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Award className="w-4 h-4 text-indigo-400" />
                    <span>Recommended Certifications</span>
                  </div>
                  <div className="space-y-1.5">
                    {analysis.recommendedCertifications.map((cert, i) => (
                      <div key={i} className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                        <div className="font-semibold text-white">{cert.name}</div>
                        <div className="text-[10px] text-indigo-400">{cert.provider} — {cert.relevance}</div>
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
                className="w-full h-9 text-xs bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
                <span>Re-analyze Resume</span>
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
              placeholder="Paste job posting text or key requirement bullet points here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="min-h-[120px] text-xs bg-slate-950 border-slate-800 text-slate-200"
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
            <div className="space-y-4 pt-2 border-t border-slate-800">
              <div className="p-4 rounded-2xl bg-slate-950 border border-indigo-500/30 text-center space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">JD Match Score</span>
                <div className="text-3xl font-extrabold text-indigo-400">{jdMatch.matchPercentage}%</div>
                <Badge variant="outline" className="text-xs px-2 py-0.5 border-indigo-500/40 text-indigo-300">
                  Hiring Probability: {jdMatch.hiringProbability}
                </Badge>
              </div>

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
        </div>
      )}
    </div>
  );
}
