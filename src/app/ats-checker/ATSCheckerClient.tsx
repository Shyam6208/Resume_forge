"use client";

import { useState, useMemo, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Target,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  Zap,
  ShieldCheck,
  FileText,
  RotateCcw,
  Copy,
  ChevronRight,
  BarChart3,
  Award,
  Layers,
  BookOpen,
  Upload,
  Image as ImageIcon,
  FileCheck,
  Loader2,
  Edit3,
  X,
  FileUp,
} from "lucide-react";
import toast from "react-hot-toast";

// Common action verbs for ATS scoring
const ACTION_VERBS = new Set([
  "achieved", "architected", "accelerated", "built", "spearheaded", "engineered",
  "developed", "designed", "implemented", "launched", "optimized", "increased",
  "reduced", "managed", "led", "mentored", "orchestrated", "automated", "delivered",
  "created", "streamlined", "scaled", "negotiated", "executed", "generated", "solved",
]);

// Stop words to exclude from keyword extraction
const STOP_WORDS = new Set([
  "the", "and", "a", "to", "of", "in", "for", "with", "on", "as", "by", "at",
  "an", "be", "this", "that", "from", "or", "is", "are", "will", "you", "your",
  "we", "our", "all", "have", "has", "can", "their", "more", "about", "into",
  "work", "team", "experience", "role", "must", "should", "ability", "strong",
]);

const SAMPLE_RESUME = `Alex Morgan
Senior Full Stack Engineer
alex.morgan@example.com | (555) 234-5678 | San Francisco, CA
LinkedIn: linkedin.com/in/alexmorgan | GitHub: github.com/alexmorgan

PROFESSIONAL SUMMARY
Results-driven Full Stack Developer with 5+ years of experience building scalable web applications using TypeScript, React, Next.js, Node.js, and PostgreSQL. Spearheaded the migration of legacy monolith to microservices, reducing server response times by 40%.

WORK EXPERIENCE
Senior Software Engineer | TechCorp Inc. | 2022 - Present
• Architected and developed high-throughput RESTful APIs using Node.js and GraphQL, serving over 2M daily active users.
• Optimized PostgreSQL database queries and implemented Redis caching, achieving a 45% reduction in latency.
• Led a cross-functional team of 6 engineers in delivering an automated CI/CD pipeline with Docker and AWS.

Frontend Developer | WebSolutions | 2019 - 2022
• Engineered responsive user interfaces using React, Next.js, and Tailwind CSS.
• Implemented end-to-end testing with Jest and Cypress, elevating code coverage to 92%.

TECHNICAL SKILLS
Languages: TypeScript, JavaScript, Python, SQL
Frontend: React, Next.js, Redux, Tailwind CSS, HTML5, CSS3
Backend: Node.js, Express, GraphQL, PostgreSQL, Redis, REST APIs
DevOps & Cloud: AWS, Docker, Git, CI/CD, Jest, Cypress`;

const SAMPLE_JD = `Senior Software Engineer - Full Stack
Company: CloudScale Systems

We are looking for a Senior Full Stack Engineer with strong experience in TypeScript, React, Next.js, Node.js, and cloud architectures.

Key Responsibilities:
- Design and build robust web applications with TypeScript and modern React.
- Develop scalable backend microservices using Node.js, GraphQL, and PostgreSQL.
- Optimize database performance and implement caching strategies (Redis).
- Collaborate with cloud teams to deploy microservices on AWS with Docker and Kubernetes.
- Drive automated testing with Jest, Cypress, and CI/CD best practices.

Requirements:
- 4+ years of professional full-stack development experience.
- Proficiency with TypeScript, React, Next.js, Node.js, and PostgreSQL.
- Experience with AWS, Docker, Kubernetes, CI/CD, and Redis caching.
- Strong knowledge of RESTful API design and GraphQL.`;

interface UploadedFileInfo {
  fileName: string;
  fileType: "pdf" | "image" | "docx";
  wordCount: number;
  detectedSections?: string[];
}

export function ATSCheckerClient() {
  const [resumeText, setResumeText] = useState(SAMPLE_RESUME);
  const [jobDescription, setJobDescription] = useState(SAMPLE_JD);
  const [activeTab, setActiveTab] = useState<"overview" | "keywords" | "structure">("overview");

  // Upload States
  const [inputMode, setInputMode] = useState<"upload" | "paste">("upload");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<UploadedFileInfo | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    setUploadError(null);
    setIsUploading(true);
    const toastId = toast.loading(`📄 Reading & verifying "${file.name}"...`);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/resume/parse-ats-upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        throw new Error(data.error || "The uploaded file could not be verified as a valid resume.");
      }

      setResumeText(data.extractedText);
      setUploadedFile({
        fileName: data.fileName,
        fileType: data.fileType,
        wordCount: data.wordCount,
        detectedSections: data.detectedSections,
      });

      toast.dismiss(toastId);
      toast.success(`✅ Resume verified! Extracted ${data.wordCount} words.`, { duration: 4000 });
    } catch (err: unknown) {
      toast.dismiss(toastId);
      const msg = err instanceof Error ? err.message : "Failed to verify resume document.";
      setUploadError(msg);
      toast.error(msg, { duration: 5000 });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // Calculate ATS metrics
  const analysis = useMemo(() => {
    if (!resumeText.trim()) {
      return null;
    }

    const cleanResume = resumeText.toLowerCase();
    const resumeWords = cleanResume.match(/\b[a-z0-9+#.-]{2,}\b/g) || [];
    const resumeWordSet = new Set(resumeWords);

    // Extract action verbs used
    const foundVerbs: string[] = [];
    ACTION_VERBS.forEach((verb) => {
      if (cleanResume.includes(verb)) {
        foundVerbs.push(verb);
      }
    });

    // Check for quantifiable metrics (numbers, %, $, etc.)
    const metricsMatches = resumeText.match(/\b(\d+[%kKmMbB]?|\$\d+|\d+\+|\d+x)\b/g) || [];

    // Extract JD Keywords & Match
    let matchedKeywords: string[] = [];
    let missingKeywords: string[] = [];
    let keywordScore = 70; // default baseline

    if (jobDescription.trim()) {
      const cleanJD = jobDescription.toLowerCase();
      const jdWords = cleanJD.match(/\b[a-z0-9+#.-]{3,}\b/g) || [];
      const jdWordFreq: Record<string, number> = {};

      jdWords.forEach((word) => {
        if (!STOP_WORDS.has(word) && isNaN(Number(word))) {
          jdWordFreq[word] = (jdWordFreq[word] || 0) + 1;
        }
      });

      // Sort by frequency to find top keywords
      const topKeywords = Object.entries(jdWordFreq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .map(([word]) => word);

      matchedKeywords = topKeywords.filter((kw) => resumeWordSet.has(kw) || cleanResume.includes(kw));
      missingKeywords = topKeywords.filter((kw) => !matchedKeywords.includes(kw));

      if (topKeywords.length > 0) {
        keywordScore = Math.round((matchedKeywords.length / topKeywords.length) * 100);
      }
    }

    // Check standard section completeness
    const hasSummary = /\b(summary|objective|profile|about)\b/i.test(resumeText);
    const hasExperience = /\b(experience|employment|work history)\b/i.test(resumeText);
    const hasEducation = /\b(education|academic|degree|university)\b/i.test(resumeText);
    const hasSkills = /\b(skills|technical|technologies|proficiencies)\b/i.test(resumeText);
    const hasContact = /\b(email|phone|linkedin|github|@)\b/i.test(resumeText);

    const structureCount = [hasSummary, hasExperience, hasEducation, hasSkills, hasContact].filter(Boolean).length;
    const structureScore = Math.round((structureCount / 5) * 100);

    // Compute aggregate overall score
    const overallScore = Math.min(
      98,
      Math.max(
        20,
        Math.round(
          (jobDescription.trim() ? keywordScore * 0.5 : 40) +
            structureScore * 0.3 +
            Math.min(foundVerbs.length * 4, 15) +
            Math.min(metricsMatches.length * 2, 10)
        )
      )
    );

    return {
      overallScore,
      keywordScore,
      structureScore,
      wordCount: resumeWords.length,
      foundVerbs,
      metricsCount: metricsMatches.length,
      matchedKeywords,
      missingKeywords,
      sections: {
        hasSummary,
        hasExperience,
        hasEducation,
        hasSkills,
        hasContact,
      },
    };
  }, [resumeText, jobDescription]);

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { label: "High ATS Match", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" };
    if (score >= 60) return { label: "Moderate Match", color: "text-amber-400 bg-amber-500/10 border-amber-500/30" };
    return { label: "Needs Optimization", color: "text-rose-400 bg-rose-500/10 border-rose-500/30" };
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 h-16 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="p-1.5 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 font-bold text-xs">
            RF
          </span>
          <span className="font-extrabold text-base text-white tracking-tight">
            ResumeForge
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/templates"
            className="text-xs font-semibold text-slate-300 hover:text-white hidden sm:block px-3 py-1.5"
          >
            Templates
          </Link>
          <Link href="/onboarding">
            <Button
              type="button"
              className="h-9 px-4 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md flex items-center gap-1.5"
            >
              <span>Build Free Resume</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Hero Title */}
        <div className="text-center space-y-3 max-w-3xl mx-auto pt-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>AI OCR PDF/Image Scanner & Free ATS Compatibility Analyzer</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Free ATS Resume Checker
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
            Upload your resume as a <strong>PDF, Image, or DOCX</strong>. Our AI verifies and extracts the content to analyze keyword matching against any job description.
          </p>
        </div>

        {/* Score & Summary Banner */}
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-white/[0.08] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6"
          >
            <div className="flex items-center gap-6">
              {/* Circular Score Display */}
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-slate-950 border-4 border-indigo-500/40 flex flex-col items-center justify-center shadow-2xl shrink-0">
                <span className="text-3xl sm:text-4xl font-extrabold text-white">
                  {analysis.overallScore}
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  / 100
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                      getScoreBadge(analysis.overallScore).color
                    }`}
                  >
                    {getScoreBadge(analysis.overallScore).label}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-white">
                  {analysis.overallScore >= 80
                    ? "Great ATS Optimization!"
                    : analysis.overallScore >= 60
                    ? "Good Foundation — A Few Missing Keywords"
                    : "Action Required to Pass ATS Scanners"}
                </h2>
                <p className="text-xs text-slate-400 max-w-md">
                  {analysis.overallScore >= 80
                    ? "Your resume strongly matches the role requirements and uses strong action metrics."
                    : "Add the highlighted missing keywords and action verbs below to raise your score."}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
              <Link href="/onboarding" className="w-full sm:w-auto">
                <Button
                  type="button"
                  className="h-11 px-6 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 w-full"
                >
                  <span>Fix & Build in ResumeForge</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        )}

        {/* Input Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Resume Input (Upload or Paste) */}
          <div className="space-y-3">
            {/* Header with Mode Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setInputMode("upload")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                    inputMode === "upload"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload PDF / Image</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode("paste")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                    inputMode === "paste"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Paste Text</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setResumeText(SAMPLE_RESUME);
                  setUploadedFile(null);
                  setUploadError(null);
                }}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Load Sample
              </button>
            </div>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.webp,.docx,application/pdf,image/*,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Mode 1: File Upload Box */}
            {inputMode === "upload" && (
              <div className="space-y-3">
                {/* Drag & Drop Zone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`cursor-pointer border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                    isDragOver
                      ? "border-indigo-400 bg-indigo-500/10 scale-[1.01]"
                      : "border-slate-800 hover:border-indigo-500/40 bg-slate-900/40 hover:bg-slate-900/60"
                  }`}
                >
                  {isUploading ? (
                    <div className="flex flex-col items-center gap-3 py-4">
                      <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-white">
                          Scanning & Verifying Resume Document...
                        </p>
                        <p className="text-xs text-slate-400">
                          Extracting text via AI OCR & verifying resume content structure
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3 py-2">
                      <div className="p-4 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400">
                        <FileUp className="w-8 h-8" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-white">
                          Click to upload or drag & drop your resume
                        </p>
                        <p className="text-xs text-slate-400">
                          Supports <strong>PDF, PNG, JPG, WEBP, or Word DOCX</strong> (Max 10 MB)
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Upload Error Banner */}
                {uploadError && (
                  <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-3">
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold text-rose-200 mb-0.5">
                        Document Verification Failed
                      </strong>
                      <span>{uploadError}</span>
                    </div>
                  </div>
                )}

                {/* Verified File Badge */}
                {uploadedFile && !uploadError && (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-slate-300 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0">
                        <FileCheck className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-white truncate text-sm">
                          {uploadedFile.fileName}
                        </p>
                        <p className="text-[11px] text-emerald-400">
                          Verified Resume ({uploadedFile.wordCount} words extracted)
                          {uploadedFile.detectedSections && (
                            <span className="text-slate-400 ml-1">
                              · Sections: {uploadedFile.detectedSections.slice(0, 3).join(", ")}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setInputMode("paste")}
                      className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold shrink-0"
                    >
                      View Text
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Mode 2: Paste / Edit Textarea */}
            {inputMode === "paste" && (
              <textarea
                rows={12}
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your full resume text here..."
                className="w-full p-4 bg-slate-900/70 border border-white/[0.08] rounded-2xl text-xs sm:text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 font-mono leading-relaxed resize-y"
              />
            )}
          </div>

          {/* Right: Job Description */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-emerald-400" />
                <span>Target Job Description (Optional)</span>
              </label>
              <button
                type="button"
                onClick={() => setJobDescription(SAMPLE_JD)}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                Load Sample JD
              </button>
            </div>
            <textarea
              rows={inputMode === "upload" ? 10 : 12}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste job posting description from LinkedIn, Indeed, or company career site..."
              className="w-full p-4 bg-slate-900/70 border border-white/[0.08] rounded-2xl text-xs sm:text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 font-mono leading-relaxed resize-y"
            />
          </div>
        </div>

        {/* Detailed Breakdown Tabs */}
        {analysis && (
          <div className="rounded-2xl bg-slate-900/50 border border-white/[0.06] p-6 space-y-6">
            <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3">
              <button
                type="button"
                onClick={() => setActiveTab("overview")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "overview"
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]"
                }`}
              >
                Overview & Metrics
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("keywords")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "keywords"
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]"
                }`}
              >
                Keywords Analysis ({analysis.matchedKeywords.length} Matched)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("structure")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "structure"
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]"
                }`}
              >
                Structure & Sections
              </button>
            </div>

            {/* TAB 1: OVERVIEW */}
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-white/[0.06] space-y-2">
                  <div className="text-xs font-bold text-slate-400 flex items-center justify-between">
                    <span>Keyword Match</span>
                    <span className="text-indigo-400 font-mono">{analysis.keywordScore}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full"
                      style={{ width: `${analysis.keywordScore}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {analysis.matchedKeywords.length} of{" "}
                    {analysis.matchedKeywords.length + analysis.missingKeywords.length} target keywords found in resume.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-white/[0.06] space-y-2">
                  <div className="text-xs font-bold text-slate-400 flex items-center justify-between">
                    <span>Structure & Format</span>
                    <span className="text-emerald-400 font-mono">{analysis.structureScore}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${analysis.structureScore}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Essential resume sections (Experience, Education, Skills, Contact) detected.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-white/[0.06] space-y-2">
                  <div className="text-xs font-bold text-slate-400 flex items-center justify-between">
                    <span>Action Verbs & Impact</span>
                    <span className="text-amber-400 font-mono">
                      {analysis.foundVerbs.length} Verbs
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${Math.min(analysis.foundVerbs.length * 10, 100)}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {analysis.metricsCount} quantifiable metrics (% or figures) detected in achievements.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 2: KEYWORDS */}
            {activeTab === "keywords" && (
              <div className="space-y-4">
                {analysis.matchedKeywords.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Matched Keywords ({analysis.matchedKeywords.length})</span>
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {analysis.matchedKeywords.map((kw) => (
                        <span
                          key={kw}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs font-medium"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {analysis.missingKeywords.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                    <h3 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Missing Job Keywords ({analysis.missingKeywords.length})</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Recruiters and ATS scanners look for these exact terms from the job posting:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {analysis.missingKeywords.map((kw) => (
                        <span
                          key={kw}
                          className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-300 border border-rose-500/20 text-xs font-medium"
                        >
                          + {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: STRUCTURE */}
            {activeTab === "structure" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { name: "Professional Summary", present: analysis.sections.hasSummary },
                  { name: "Work Experience", present: analysis.sections.hasExperience },
                  { name: "Education", present: analysis.sections.hasEducation },
                  { name: "Technical Skills", present: analysis.sections.hasSkills },
                  { name: "Contact Details", present: analysis.sections.hasContact },
                ].map((item) => (
                  <div
                    key={item.name}
                    className="p-3.5 rounded-xl bg-slate-950/60 border border-white/[0.06] flex items-center justify-between"
                  >
                    <span className="text-xs font-semibold text-white">{item.name}</span>
                    {item.present ? (
                      <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Found
                      </span>
                    ) : (
                      <span className="text-xs text-rose-400 font-bold flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" /> Missing
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
