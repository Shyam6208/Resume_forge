"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useResumeStore } from "@/store/resume.store";
import { useUIStore } from "@/store/ui.store";
import { useInterviewStore } from "@/store/interview.store";
import { buildInterviewContext } from "@/lib/ai/interview-context";
import { analyzeLocalRelevance } from "@/lib/role-matching";
import type { InterviewPrepResult, InterviewQuestion, AnswerEvaluation, InterviewAnswer, ReadinessReportResult } from "@/lib/ai/types";
import {
  generateClientCacheKey,
  getClientCached,
  setClientCached,
} from "@/lib/ai/ai-client-cache";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, Loader2, CheckCircle2, MessageSquare, Target, Users, Code, Briefcase, 
  FileText, AlertTriangle, Info, ShieldCheck, Zap, Mic, MicOff, Play, Pause, RotateCcw, 
  Copy, Check, ArrowRight, ArrowLeft, Trophy, BarChart3, HelpCircle, ChevronRight,
  TrendingUp, Award, Clock, Lightbulb, Search, BookOpen, Volume2
} from "lucide-react";
import toast from "react-hot-toast";

interface InterviewPrepModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// ═══════════════════════════════════════════════════════════════
// Category Badge Colors & Helpers
// ═══════════════════════════════════════════════════════════════
const getCategoryBadgeClass = (category: string) => {
  switch (category.toLowerCase()) {
    case "technical":
      return "bg-indigo-500/15 text-indigo-300 border-indigo-500/30";
    case "behavioral":
      return "bg-purple-500/15 text-purple-300 border-purple-500/30";
    case "resume":
      return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
    case "job-specific":
    case "job description":
      return "bg-amber-500/15 text-amber-300 border-amber-500/30";
    case "project deep dive":
      return "bg-cyan-500/15 text-cyan-300 border-cyan-500/30";
    default:
      return "bg-slate-700/30 text-slate-300 border-slate-600/30";
  }
};

const getScoreBadge = (score: number) => {
  if (score >= 85) return { label: "Excellent", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30" };
  if (score >= 70) return { label: "Strong", color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/30" };
  if (score >= 50) return { label: "Developing", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/30" };
  return { label: "Needs Improvement", color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/30" };
};

const getRoleFallbackQuestions = (role: string): InterviewPrepResult => ({
  jobRole: role,
  questions: [
    {
      category: "Technical",
      question: `Can you walk me through the end-to-end architecture of the most complex system or project you built for ${role}?`,
      whyAsked: "Evaluates architectural thinking, understanding of system trade-offs, and technical depth.",
      answerGuide: [
        "Outline the high-level architecture (frontend, API layer, database, caching).",
        "Mention specific technologies and why you chose them over alternatives.",
        "Explain how you handled scaling, state management, or latency bottlenecks.",
        "Conclude with measurable performance metrics or user impact."
      ]
    },
    {
      category: "Behavioral",
      question: "Tell me about a time when a critical bug or production outage occurred right before a deadline. How did you handle it?",
      whyAsked: "Tests composure under pressure, root-cause debugging, communication, and ownership.",
      answerGuide: [
        "Situation: Describe the outage, deadline urgency, and potential business impact.",
        "Task: What was your immediate responsibility vs team coordination.",
        "Action: Explain your systematic debugging steps, rollbacks, or hotfixes.",
        "Result: Recovery timeline, post-mortem improvements, and preventive measures implemented."
      ]
    },
    {
      category: "Resume",
      question: "Looking at your experience and projects, what was the single hardest technical challenge you solved, and what would you do differently today?",
      whyAsked: "Verifies authentic hands-on contribution and technical maturity through hindsight reflection.",
      answerGuide: [
        "Pick your strongest project from your resume.",
        "Detail the exact bottleneck (memory leak, database locking, state sync, etc.).",
        "Explain your creative solution and why it succeeded.",
        "Share mature retrospective insights on how you'd design it with newer tools today."
      ]
    },
    {
      category: "Technical",
      question: "How do you approach performance optimization, caching strategies, and API security in modern web applications?",
      whyAsked: "Assesses understanding of real-world production engineering best practices.",
      answerGuide: [
        "Discuss database indexing, query optimization, and pagination.",
        "Explain caching layers (Redis, CDN, HTTP cache-control headers).",
        "Cover security basics: JWT/OAuth2 auth, rate limiting, SQL injection defense, CORS.",
        "Cite an example where you improved response times or secured an endpoint."
      ]
    },
    {
      category: "Behavioral",
      question: "Describe a situation where you had a strong disagreement with a team member or product manager on a technical decision. How did you resolve it?",
      whyAsked: "Evaluates collaboration, conflict resolution, emotional intelligence, and data-driven debate.",
      answerGuide: [
        "Explain the technical dilemma and both viewpoints objectively.",
        "Describe how you evaluated trade-offs (proof-of-concept benchmarks, user metrics).",
        "Emphasize constructive collaboration rather than 'winning' the argument.",
        "Share the successful outcome and how it strengthened team trust."
      ]
    },
    {
      category: "Job-Specific",
      question: `Why are you interested in this ${role} position, and how do your skills align with what our team needs?`,
      whyAsked: "Measures genuine motivation, role understanding, and alignment with company goals.",
      answerGuide: [
        "Connect your technical strengths directly to the core challenges of this role.",
        "Highlight enthusiasm for continuous learning and team impact.",
        "Mention specific skills on your resume that give you a fast ramp-up."
      ]
    }
  ],
  overallTips: [
    "Use the STAR framework for all behavioral and situational questions.",
    "Back up claims with quantifiable metrics (%, latency, user count).",
    "Speak clearly and structure your answers with a summary before deep-diving."
  ]
});

export function InterviewPrepModal({ isOpen, onClose }: InterviewPrepModalProps) {
  const currentResume = useResumeStore((s) => s.currentResume);
  const targetJob = currentResume?.targetJob || currentResume?.title || "Software Professional";
  const { jobDescription, jdMatchResult } = useUIStore();
  
  const {
    phase,
    setPhase,
    prepResult,
    setPrepResult,
    isGenerating,
    setIsGenerating,
  } = useInterviewStore();

  // Navigation mode: "bank" (Question Bank) | "mock" (Live AI Mock) | "scorecard" (Readiness Report)
  const [activeTab, setActiveTab] = useState<"bank" | "mock" | "scorecard">("bank");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Mock Interview State
  const [mockIndex, setMockIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluations, setEvaluations] = useState<Record<number, AnswerEvaluation>>({});
  const [userAnswersHistory, setUserAnswersHistory] = useState<Record<number, string>>({});
  const [readinessReport, setReadinessReport] = useState<ReadinessReportResult | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // Timer State for Live Mock (2 minutes per question)
  const [timerSeconds, setTimerSeconds] = useState(120);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Speech-to-Text Voice Dictation State
  const [isListening, setIsListening] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  // Duplicate request prevention
  const inFlightRef = useRef(false);

  // Timer Effect
  useEffect(() => {
    if (!isTimerRunning) return;

    const interval = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          setIsTimerRunning(false);
          toast("⏰ Time's up for this question! Submit your answer for AI review.", { icon: "⏰" });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Voice Dictation (Web Speech API) Setup
  const toggleVoiceRecording = () => {
    if (typeof window === "undefined") return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error("Speech Recognition is not supported in this browser. Please type your answer.", { duration: 4000 });
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        let currentTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          currentTranscript += event.results[i][0].transcript;
        }
        if (currentTranscript) {
          setUserAnswer((prev) => {
            const separator = prev && !prev.endsWith(" ") ? " " : "";
            return prev + separator + currentTranscript.trim();
          });
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        setIsListening(false);
        if (event.error === "not-allowed") {
          toast.error("Microphone permission denied. Please allow microphone access in your browser.");
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
      setIsListening(true);
      setIsTimerRunning(true);
      toast.success("🎙️ Listening... Speak your answer clearly!", { duration: 2500 });
    } catch (err) {
      console.error("Speech recognition startup error:", err);
      setIsListening(false);
      toast.error("Could not start microphone.");
    }
  };

  // Local Intelligence
  const localRelevance = useMemo(() => {
    if (!currentResume) return null;
    return analyzeLocalRelevance(currentResume.data, targetJob, "developer");
  }, [currentResume, targetJob]);

  // Generate Questions handler
  const handleGenerate = useCallback(async (isRegenerate = false) => {
    if (!currentResume) return;

    if (inFlightRef.current) return;

    const interviewContext = buildInterviewContext(targetJob, jdMatchResult);

    const cacheKey = generateClientCacheKey({
      resumeId: currentResume.id,
      operation: "interview-prep",
      content: currentResume.data,
      jobDescription: jobDescription,
      targetRole: interviewContext.targetRole,
    });
    
    if (!isRegenerate) {
      const cached = getClientCached<InterviewPrepResult>(cacheKey);
      if (cached && cached.questions && cached.questions.length > 0) {
        setPrepResult(cached);
        setPhase("reviewing_prep");
        return;
      }
    }

    inFlightRef.current = true;
    setIsGenerating(true);
    setPhase("generating_prep");
    const toastId = toast.loading("🎯 Generating AI role-tailored interview questions...");

    try {
      const res = await fetch("/api/ai/interview-prep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeData: currentResume.data,
          jobDescription: jobDescription || "",
          jdMatchContext: interviewContext.jdMatchContext,
          targetRole: interviewContext.targetRole || targetJob,
          roleContext: interviewContext.roleContext,
        }),
      });

      if (res.ok) {
        const result: InterviewPrepResult = await res.json().catch(() => null);
        if (result && Array.isArray(result.questions) && result.questions.length > 0) {
          setPrepResult(result);
          setPhase("reviewing_prep");
          setClientCached(cacheKey, result);
          toast.dismiss(toastId);
          toast.success("✨ Tailored interview questions ready!", { duration: 3000 });
          return;
        }
      }
    } catch {
      // Handled by fallback below
    } finally {
      setIsGenerating(false);
      inFlightRef.current = false;
    }

    // High-quality fallback always applies smoothly without errors
    toast.dismiss(toastId);
    const fallback = getRoleFallbackQuestions(targetJob || "Software Engineer");
    setPrepResult(fallback);
    setPhase("reviewing_prep");
    toast.success("✨ Questions ready for " + (targetJob || "Software Engineer") + "!", { duration: 2500 });
  }, [currentResume, jobDescription, targetJob, jdMatchResult, setPhase, setPrepResult, setIsGenerating]);

  // Initial load check
  useEffect(() => {
    if (isOpen && !prepResult && !isGenerating) {
      handleGenerate(false);
    }
  }, [isOpen, prepResult, isGenerating, handleGenerate]);

  // Evaluate Mock Answer
  const handleEvaluateMockAnswer = async () => {
    if (!prepResult?.questions || prepResult.questions.length === 0) return;
    const currentQuestion = prepResult.questions[mockIndex];
    if (!currentQuestion) return;

    if (!userAnswer.trim()) {
      toast.error("Please speak or type your answer before evaluating.");
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    setIsTimerRunning(false);

    setIsEvaluating(true);
    const toastId = toast.loading("🤖 AI Coach analyzing your response...");

    try {
      const res = await fetch("/api/ai/interview-eval", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "evaluate",
          question: currentQuestion.question,
          userAnswer: userAnswer.trim(),
          category: currentQuestion.category,
          targetJob: targetJob,
          resumeContext: JSON.stringify(currentResume?.data || {}),
          jobDescription: jobDescription || "",
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to evaluate answer");
      }

      const evaluation: AnswerEvaluation = await res.json();
      
      setEvaluations((prev) => ({ ...prev, [mockIndex]: evaluation }));
      setUserAnswersHistory((prev) => ({ ...prev, [mockIndex]: userAnswer.trim() }));
      
      toast.dismiss(toastId);
      toast.success(`Score: ${evaluation.score}/100 — Feedback ready!`, { duration: 3000 });
    } catch (err: unknown) {
      console.error(err);
      toast.dismiss(toastId);
      toast.error("Failed to evaluate response. Please try again.");
    } finally {
      setIsEvaluating(false);
    }
  };

  // Switch to next Mock Question
  const handleNextMockQuestion = () => {
    if (!prepResult?.questions) return;
    if (mockIndex < prepResult.questions.length - 1) {
      const nextIdx = mockIndex + 1;
      setMockIndex(nextIdx);
      setUserAnswer(userAnswersHistory[nextIdx] || "");
      setTimerSeconds(120);
      setIsTimerRunning(false);
    } else {
      // Last question reached -> Generate Readiness Report
      handleGenerateReadinessReport();
    }
  };

  // Generate Final Readiness Report
  const handleGenerateReadinessReport = async () => {
    if (!prepResult?.questions) return;
    setIsGeneratingReport(true);
    setActiveTab("scorecard");
    const toastId = toast.loading("🏆 Compiling your overall Interview Readiness Scorecard...");

    try {
      const answersPayload: InterviewAnswer[] = prepResult.questions.map((q, idx) => ({
        questionId: q.question,
        userAnswer: userAnswersHistory[idx] || "",
        evaluation: evaluations[idx] || null,
        skipped: !userAnswersHistory[idx],
      }));

      const res = await fetch("/api/ai/interview-eval", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "report",
          answers: answersPayload,
          targetJob: targetJob,
          resumeContext: JSON.stringify(currentResume?.data || {}),
          jobDescription: jobDescription || "",
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to generate report");
      }

      const report: ReadinessReportResult = await res.json();
      setReadinessReport(report);
      toast.dismiss(toastId);
      toast.success("🎉 Interview Readiness Scorecard ready!");
    } catch (err: unknown) {
      console.error(err);
      toast.dismiss(toastId);
      toast.error("Failed to compile full report.");
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // Copy Answer Helper
  const handleCopyAnswer = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success("Answer copied to clipboard!");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Launch Live Mock on a specific question from the question bank
  const handlePracticeSpecificQuestion = (qIndex: number) => {
    setMockIndex(qIndex);
    setUserAnswer(userAnswersHistory[qIndex] || "");
    setTimerSeconds(120);
    setIsTimerRunning(false);
    setActiveTab("mock");
  };

  // Filtered questions for bank
  const filteredQuestions = useMemo(() => {
    if (!prepResult?.questions) return [];
    return prepResult.questions.filter((q) => {
      const matchCat = activeCategory === "All" || q.category.toLowerCase() === activeCategory.toLowerCase();
      const matchSearch = !searchQuery.trim() || 
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
        q.whyAsked.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [prepResult, activeCategory, searchQuery]);

  const currentMockQuestion = prepResult?.questions?.[mockIndex];
  const currentMockEval = evaluations[mockIndex];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95vw] max-w-4xl bg-slate-950 border-slate-800 text-slate-100 p-0 overflow-hidden shadow-2xl rounded-3xl max-h-[92vh] flex flex-col">
        {/* ═══════════════════════════════════════════════════════════════
            Header with Glowing Gradient Accent
            ═══════════════════════════════════════════════════════════════ */}
        <div className="relative p-5 sm:p-6 bg-gradient-to-b from-indigo-950/40 via-slate-900/60 to-transparent border-b border-slate-800/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="relative p-3 rounded-2xl bg-gradient-to-br from-indigo-600/30 to-violet-600/30 border border-indigo-500/30 shadow-lg shadow-indigo-600/20 shrink-0">
                <Sparkles className="w-6 h-6 text-indigo-400" />
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full" />
              </div>
              <DialogHeader className="gap-1 text-left">
                <DialogTitle className="text-lg sm:text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                  <span>AI Interview Mastery Suite</span>
                  <Badge variant="outline" className="text-[10px] px-2 py-0.5 bg-indigo-500/10 text-indigo-300 border-indigo-500/30 font-bold uppercase tracking-wider">
                    PRO
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-400 flex items-center gap-1.5">
                  <span>Target Role:</span>
                  <span className="font-semibold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                    {targetJob}
                  </span>
                </DialogDescription>
              </DialogHeader>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900/90 border border-slate-800 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setActiveTab("bank")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "bank"
                    ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Question Bank</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("mock")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "mock"
                    ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Mic className="w-3.5 h-3.5 text-emerald-400" />
                <span>Live AI Mock</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("scorecard");
                  if (!readinessReport && Object.keys(evaluations).length > 0) {
                    handleGenerateReadinessReport();
                  }
                }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "scorecard"
                    ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>Scorecard</span>
              </button>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            Main Body Content
            ═══════════════════════════════════════════════════════════════ */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Loading State */}
          {isGenerating && (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <div className="relative p-5 rounded-3xl bg-indigo-600/10 border border-indigo-500/20">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-400" />
                <Sparkles className="w-5 h-5 text-amber-300 absolute -top-1 -right-1 animate-bounce" />
              </div>
              <div className="space-y-1 max-w-sm">
                <h3 className="text-base font-bold text-white">Analyzing Resume & Target Role...</h3>
                <p className="text-xs text-slate-400">
                  Synthesizing tailored Technical, STAR Behavioral, and Project deep-dive questions based on your experience.
                </p>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════
              TAB 1: QUESTION BANK & STRATEGY GUIDE
              ═══════════════════════════════════════════════════════════ */}
          {!isGenerating && activeTab === "bank" && (
            <div className="space-y-5">
              {/* Category Pills & Search Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-2 rounded-2xl border border-slate-800/80">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  {["All", "Technical", "Behavioral", "Resume", "Job-Specific"].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setActiveCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                        activeCategory.toLowerCase() === cat.toLowerCase()
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1 sm:w-48">
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search questions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-950/80 border border-slate-800 rounded-xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleGenerate(true)}
                    className="h-8 text-xs bg-slate-950 border-slate-800 text-slate-300 hover:text-white"
                  >
                    <RotateCcw className="w-3 h-3 mr-1 text-indigo-400" />
                    <span>Regenerate</span>
                  </Button>
                </div>
              </div>

              {/* Questions List */}
              {filteredQuestions.length === 0 ? (
                <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center space-y-3">
                  <HelpCircle className="w-8 h-8 text-slate-500 mx-auto" />
                  <p className="text-xs text-slate-400">No questions found matching your filter criteria.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredQuestions.map((q, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 space-y-4 hover:border-slate-700 transition-all shadow-md group"
                    >
                      {/* Top Meta Bar */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${getCategoryBadgeClass(q.category)}`}>
                            {q.category}
                          </span>
                          <span className="text-[11px] font-mono text-slate-500">Question #{idx + 1}</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handlePracticeSpecificQuestion(prepResult?.questions?.indexOf(q) ?? idx)}
                          className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all"
                        >
                          <Play className="w-3 h-3 text-emerald-400 fill-emerald-400" />
                          <span>Practice in Mock</span>
                        </button>
                      </div>

                      {/* Question Text */}
                      <h4 className="text-sm sm:text-base font-bold text-white leading-snug">
                        {q.question}
                      </h4>

                      {/* Why Recruiter Asks This */}
                      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
                        <div className="flex items-center gap-1.5 text-amber-400">
                          <Lightbulb className="w-3.5 h-3.5" />
                          <span className="text-[11px] font-bold uppercase tracking-wider">Recruiter Mindset & Intent</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed pl-5">
                          {q.whyAsked}
                        </p>
                      </div>

                      {/* Suggested Answer Framework (STAR) */}
                      <div className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-500/20 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-indigo-300 font-bold text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                            <span>STAR Framework & Key Talking Points</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopyAnswer(q.answerGuide?.join("\n• ") || "", idx)}
                            className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 hover:text-white bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800 transition-colors"
                          >
                            {copiedIndex === idx ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span>Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy Framework</span>
                              </>
                            )}
                          </button>
                        </div>
                        <ul className="text-xs text-slate-200 space-y-1.5 pl-5 list-disc leading-relaxed">
                          {q.answerGuide?.map((point, pIdx) => (
                            <li key={pIdx}>{point}</li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════
              TAB 2: LIVE AI MOCK INTERVIEW SIMULATOR (THE WOW FACTOR)
              ═══════════════════════════════════════════════════════════ */}
          {!isGenerating && activeTab === "mock" && currentMockQuestion && (
            <div className="space-y-6">
              {/* Stepper Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                  <span className="flex items-center gap-1.5 text-indigo-400">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Question {mockIndex + 1} of {prepResult?.questions?.length || 5}</span>
                  </span>
                  <span>{Math.round(((mockIndex + 1) / (prepResult?.questions?.length || 1)) * 100)}% Complete</span>
                </div>
                <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-emerald-500 transition-all duration-500"
                    style={{ width: `${((mockIndex + 1) / (prepResult?.questions?.length || 1)) * 100}%` }}
                  />
                </div>
              </div>

              {/* Interviewer Persona Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 to-indigo-950/30 border border-slate-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                      AI
                      <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-900" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">AI Technical Interviewer</h4>
                      <p className="text-[10px] text-slate-400">Evaluating for {targetJob}</p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${getCategoryBadgeClass(currentMockQuestion.category)}`}>
                    {currentMockQuestion.category}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Interviewer Asks:</span>
                  </p>
                  <h3 className="text-base sm:text-lg font-bold text-white leading-relaxed">
                    &ldquo;{currentMockQuestion.question}&rdquo;
                  </h3>
                </div>
              </div>

              {/* Interactive Response Console */}
              <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    {/* Live Voice Microphone Button */}
                    <button
                      type="button"
                      onClick={toggleVoiceRecording}
                      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md ${
                        isListening
                          ? "bg-rose-600 text-white animate-pulse shadow-rose-600/30"
                          : "bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30"
                      }`}
                    >
                      {isListening ? (
                        <>
                          <MicOff className="w-4 h-4" />
                          <span>Stop Recording</span>
                        </>
                      ) : (
                        <>
                          <Mic className="w-4 h-4 text-emerald-400" />
                          <span>Speak Answer (Voice)</span>
                        </>
                      )}
                    </button>

                    {/* Animated Audio Wave when listening */}
                    {isListening && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-rose-950/50 border border-rose-500/30 rounded-lg">
                        <span className="w-1 h-3 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-1 h-4 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-1 h-2 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        <span className="text-[10px] text-rose-300 font-bold ml-1">Live Dictation Active</span>
                      </div>
                    )}
                  </div>

                  {/* 2-Minute Timer */}
                  <div className="flex items-center gap-2">
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-mono font-bold border ${
                      timerSeconds < 30 
                        ? "bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse" 
                        : "bg-slate-950 text-slate-300 border-slate-800"
                    }`}>
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{Math.floor(timerSeconds / 60)}:{String(timerSeconds % 60).padStart(2, "0")}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsTimerRunning(!isTimerRunning)}
                      className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
                      title={isTimerRunning ? "Pause Timer" : "Start Timer"}
                    >
                      {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setTimerSeconds(120);
                        setIsTimerRunning(false);
                      }}
                      className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
                      title="Reset Timer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* STAR Method Helper Chips */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
                  <span className="text-[10px] font-bold text-slate-500 mr-1">Insert STAR Scaffold:</span>
                  {[
                    { label: "+ Situation", snippet: "\n[Situation]: In my previous role at... " },
                    { label: "+ Task", snippet: "\n[Task]: I was responsible for... " },
                    { label: "+ Action", snippet: "\n[Action]: To resolve this, I implemented... " },
                    { label: "+ Result", snippet: "\n[Result]: As a result, we achieved... " },
                  ].map((chip, cIdx) => (
                    <button
                      key={cIdx}
                      type="button"
                      onClick={() => setUserAnswer((prev) => prev + chip.snippet)}
                      className="px-2 py-0.5 rounded-md bg-slate-950 hover:bg-slate-800 text-[10px] font-semibold text-indigo-300 border border-slate-800 hover:border-indigo-500/50 transition-colors"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>

                {/* Answer Text Area */}
                <textarea
                  rows={5}
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Type your response here or click 'Speak Answer' to speak using your microphone..."
                  className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-500 text-xs sm:text-sm leading-relaxed focus:outline-none focus:border-indigo-500 resize-y"
                />

                {/* Submit & Navigation Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (mockIndex > 0) {
                          setMockIndex(mockIndex - 1);
                          setUserAnswer(userAnswersHistory[mockIndex - 1] || "");
                        }
                      }}
                      disabled={mockIndex === 0}
                      className="h-9 text-xs bg-slate-950 border-slate-800 text-slate-400 hover:text-white disabled:opacity-30"
                    >
                      <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                      <span>Previous</span>
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleNextMockQuestion}
                      className="h-9 text-xs bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                    >
                      <span>Skip / Next</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </div>

                  <Button
                    type="button"
                    disabled={isEvaluating || !userAnswer.trim()}
                    onClick={handleEvaluateMockAnswer}
                    className="w-full sm:w-auto h-10 text-xs sm:text-sm bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
                  >
                    {isEvaluating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>AI Analyzing Response...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>Submit Answer for AI Review</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* ═══════════════════════════════════════════════════════
                  AI Evaluation Feedback Card
                  ═══════════════════════════════════════════════════════ */}
              <AnimatePresence>
                {currentMockEval && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 15 }}
                    className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950/20 to-slate-900 border border-indigo-500/30 shadow-2xl space-y-5"
                  >
                    {/* Score Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                      <div className="flex items-center gap-3.5">
                        <div className="relative w-14 h-14 rounded-2xl bg-slate-900 border border-indigo-500/30 flex flex-col items-center justify-center">
                          <span className={`text-xl font-extrabold ${getScoreBadge(currentMockEval.score).color}`}>
                            {currentMockEval.score}
                          </span>
                          <span className="text-[9px] text-slate-500 uppercase font-bold">/ 100</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-md text-xs font-bold border ${getScoreBadge(currentMockEval.score).bg} ${getScoreBadge(currentMockEval.score).color}`}>
                              {getScoreBadge(currentMockEval.score).label}
                            </span>
                            <span className="text-xs font-bold text-white">AI Evaluation Summary</span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">Scored based on relevance, STAR structure, and technical depth.</p>
                        </div>
                      </div>

                      <Button
                        type="button"
                        onClick={handleNextMockQuestion}
                        className="h-9 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md"
                      >
                        <span>Next Question</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Strengths */}
                      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                        <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>What You Did Great</span>
                        </div>
                        <ul className="text-xs text-slate-300 space-y-1.5 pl-4 list-disc leading-relaxed">
                          {currentMockEval.strengths?.map((s, sIdx) => (
                            <li key={sIdx}>{s}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Improvements */}
                      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                        <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                          <Lightbulb className="w-4 h-4" />
                          <span>How to Level Up</span>
                        </div>
                        <ul className="text-xs text-slate-300 space-y-1.5 pl-4 list-disc leading-relaxed">
                          {currentMockEval.improvements?.map((imp, iIdx) => (
                            <li key={iIdx}>{imp}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Missing Elements / Unsupported Claims */}
                    {((currentMockEval.missingElements && currentMockEval.missingElements.length > 0) ||
                      (currentMockEval.unsupportedClaims && currentMockEval.unsupportedClaims.length > 0)) && (
                      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                          Missing Keywords & Verification Signals:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {currentMockEval.missingElements?.map((m, mIdx) => (
                            <span key={mIdx} className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[11px] font-medium">
                              Missing: {m}
                            </span>
                          ))}
                          {currentMockEval.unsupportedClaims?.map((u, uIdx) => (
                            <span key={uIdx} className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-300 border border-rose-500/20 text-[11px] font-medium">
                              Claim not in resume: {u}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Follow-Up Question Probing */}
                    {currentMockEval.followUpQuestion && (
                      <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/30 space-y-2">
                        <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase">
                          <MessageSquare className="w-4 h-4 text-indigo-400" />
                          <span>Interviewer Follow-Up Probe:</span>
                        </div>
                        <p className="text-xs sm:text-sm font-semibold text-white pl-6 leading-relaxed">
                          &ldquo;{currentMockEval.followUpQuestion}&rdquo;
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════
              TAB 3: INTERVIEW READINESS SCORECARD
              ═══════════════════════════════════════════════════════════ */}
          {!isGenerating && activeTab === "scorecard" && (
            <div className="space-y-6">
              {isGeneratingReport ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                  <Loader2 className="w-10 h-10 animate-spin text-indigo-400" />
                  <p className="text-xs text-slate-400">Compiling your comprehensive Interview Readiness Scorecard...</p>
                </div>
              ) : readinessReport ? (
                <div className="space-y-6">
                  {/* Hero Readiness Banner */}
                  <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-violet-950 border border-indigo-500/30 shadow-2xl space-y-4 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="space-y-1.5">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                        <Trophy className="w-3.5 h-3.5" />
                        <span>Mock Interview Completed</span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                        Overall Interview Readiness Score
                      </h3>
                      <p className="text-xs text-slate-300 max-w-md">
                        Based on your answered responses, STAR structure, and role alignment for {targetJob}.
                      </p>
                    </div>

                    <div className="relative p-6 rounded-3xl bg-slate-950/80 border border-indigo-500/30 shadow-inner flex flex-col items-center justify-center shrink-0">
                      <span className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-indigo-300 to-violet-400">
                        {readinessReport.overallScore}%
                      </span>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-1">
                        Readiness Level
                      </span>
                    </div>
                  </div>

                  {/* Category Scores Breakdown */}
                  {readinessReport.categoryScores && (
                    <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-indigo-400" />
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Performance Breakdown by Category</h4>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {Object.entries(readinessReport.categoryScores).map(([cat, score], idx) => (
                          <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-semibold text-slate-300">{cat}</span>
                              <span className="font-bold text-indigo-400">{score}%</span>
                            </div>
                            <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                              <div
                                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400"
                                style={{ width: `${score}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Strengths & Critical Gaps Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
                      <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Key Strengths Observed</span>
                      </div>
                      <ul className="text-xs text-slate-300 space-y-2 pl-4 list-disc leading-relaxed">
                        {readinessReport.keyStrengths?.map((s, idx) => (
                          <li key={idx}>{s}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
                      <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Critical Blind Spots</span>
                      </div>
                      <ul className="text-xs text-slate-300 space-y-2 pl-4 list-disc leading-relaxed">
                        {readinessReport.criticalGaps?.map((g, idx) => (
                          <li key={idx}>{g}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Actionable 48-Hour Plan */}
                  <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
                    <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs uppercase tracking-wider">
                      <TrendingUp className="w-4 h-4 text-indigo-400" />
                      <span>Actionable 48-Hour Preparation Plan</span>
                    </div>
                    <div className="space-y-2">
                      {readinessReport.actionablePlan?.map((plan, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                          <span className="w-5 h-5 rounded-full bg-indigo-600/20 text-indigo-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <p className="text-xs text-slate-200 leading-relaxed">{plan}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Action Controls */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab("bank")}
                      className="h-10 text-xs bg-slate-950 border-slate-800 text-slate-300 hover:text-white"
                    >
                      <BookOpen className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
                      <span>Back to Question Bank</span>
                    </Button>

                    <Button
                      type="button"
                      onClick={() => {
                        setMockIndex(0);
                        setUserAnswer("");
                        setEvaluations({});
                        setActiveTab("mock");
                        setTimerSeconds(120);
                        setIsTimerRunning(false);
                      }}
                      className="h-10 text-xs bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30"
                    >
                      <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                      <span>Retake Mock Interview</span>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-4">
                  <Trophy className="w-10 h-10 text-amber-400 mx-auto" />
                  <div className="space-y-1 max-w-md mx-auto">
                    <h3 className="text-base font-bold text-white">No Mock Round Completed Yet</h3>
                    <p className="text-xs text-slate-400">
                      Answer questions in the Live AI Mock Simulator to generate your personalized Interview Readiness Scorecard.
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={() => setActiveTab("mock")}
                    className="h-10 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl"
                  >
                    <Play className="w-3.5 h-3.5 mr-1.5 fill-white" />
                    <span>Start Live Mock Interview</span>
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
