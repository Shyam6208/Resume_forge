"use client";

import { useMemo } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { motion } from "framer-motion";
import { useATSCheck } from "@/hooks/useATSCheck";
import { useResumeStore } from "@/store/resume.store";
import { useUIStore } from "@/store/ui.store";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { Skills } from "@/types/resume.types";
import {
  Target,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  PlusCircle,
  Loader2,
  Info,
} from "lucide-react";
import toast from "react-hot-toast";

ChartJS.register(ArcElement, Tooltip, Legend);

function getATSColor(percentage: number) {
  if (percentage >= 80) return { hex: "#10b981", bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-400", label: "Excellent Match" };
  if (percentage >= 60) return { hex: "#06b6d4", bg: "bg-cyan-500/10", border: "border-cyan-500/30", text: "text-cyan-400", label: "Good Match" };
  if (percentage >= 40) return { hex: "#f59e0b", bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-400", label: "Average Match" };
  return { hex: "#f43f5e", bg: "bg-rose-500/10", border: "border-rose-500/30", text: "text-rose-400", label: "Low Match" };
}

export function ATSChecker() {
  const { jobDescription, setJobDescription, atsResult, isAnalyzing } = useATSCheck();
  const currentResume = useResumeStore((s) => s.currentResume);
  const updateSection = useResumeStore((s) => s.updateSection);
  const setActiveSection = useUIStore((s) => s.setActiveSection);
  const setMobileTab = useUIStore((s) => s.setMobileTab);

  const charCount = jobDescription.trim().length;
  const isEnoughChars = charCount >= 50;

  // Calculate frequency for repeated keywords
  const repeatedKeywordCounts = useMemo(() => {
    if (!atsResult || !atsResult.repeatedKeywords || !currentResume) return new Map<string, number>();

    const textParts: string[] = [];
    const data = currentResume.data;
    if (data.summary) textParts.push(data.summary);
    if (data.skills) {
      for (const arr of Object.values(data.skills)) {
        if (arr) textParts.push(arr.join(" "));
      }
    }
    if (data.experience) {
      for (const exp of data.experience) {
        textParts.push(exp.position, exp.company, ...(exp.responsibilities || []));
      }
    }
    if (data.projects) {
      for (const p of data.projects) {
        textParts.push(p.name, p.description, ...(p.technologies || []));
      }
    }

    const fullText = textParts.join(" ").toLowerCase();
    const map = new Map<string, number>();

    for (const kw of atsResult.repeatedKeywords) {
      const regex = new RegExp(`\\b${kw.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}\\b`, "gi");
      const matches = fullText.match(regex);
      map.set(kw, matches ? matches.length : 4);
    }

    return map;
  }, [atsResult, currentResume]);

  const colorInfo = atsResult ? getATSColor(atsResult.matchPercentage) : getATSColor(0);

  // Chart data
  const chartData = {
    datasets: [
      {
        data: atsResult ? [atsResult.matchPercentage, 100 - atsResult.matchPercentage] : [0, 100],
        backgroundColor: [colorInfo.hex, "rgba(255, 255, 255, 0.08)"],
        borderWidth: 0,
        borderRadius: 4,
        cutout: "82%",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    animation: {
      duration: 800,
    },
  };

  const handleHighlightMissingKeyword = (keyword: string) => {
    setActiveSection("skills");
    setMobileTab("edit");
    toast(`Highlighting section to add "${keyword}"`, {
      icon: "💡",
    });
    setTimeout(() => {
      const el = document.getElementById("section-skills") || document.querySelector('[data-section="skills"]');
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);
  };

  const handleAddMissingSkillsToStore = () => {
    if (!atsResult || atsResult.missingKeywords.length === 0) return;

    const existingSkills: Skills = currentResume?.data.skills || {};
    const existingOther = existingSkills.other || [];

    const newSkillsToAdd = atsResult.missingKeywords.filter(
      (kw) =>
        !existingOther.map((s) => s.toLowerCase()).includes(kw.toLowerCase()) &&
        !Object.values(existingSkills)
          .flat()
          .some((s) => s && s.toLowerCase() === kw.toLowerCase())
    );

    if (newSkillsToAdd.length === 0) {
      toast.success("All missing keywords are already in your Skills section!");
      setActiveSection("skills");
      setMobileTab("edit");
      return;
    }

    const updatedSkills: Skills = {
      ...existingSkills,
      other: [...existingOther, ...newSkillsToAdd],
    };

    updateSection("skills", updatedSkills);
    setActiveSection("skills");
    setMobileTab("edit");
    toast.success(`Added ${newSkillsToAdd.length} missing skill(s) to your Skills section!`);
  };

  return (
    <div className="space-y-5 text-slate-100">
      {/* Input area */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-cyan-400" />
            <span>Target Job Description</span>
          </label>
          <span className="text-[11px] text-slate-400">
            {charCount} / 50+ chars
          </span>
        </div>

        <Textarea
          placeholder="Paste job description here..."
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          className="min-h-[110px] text-xs bg-slate-900/80 border-white/[0.08] focus:border-cyan-500 focus:ring-cyan-500/20 text-slate-100 placeholder:text-slate-500 rounded-xl"
        />

        <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>Real-time keyword parity against top enterprise ATS parsers</span>
        </p>
      </div>

      {/* Analyzing state */}
      {isAnalyzing && (
        <div className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.08] text-center space-y-2">
          <Loader2 className="w-5 h-5 text-cyan-400 animate-spin mx-auto" />
          <p className="text-xs font-medium text-slate-400">Analyzing keywords against job description...</p>
        </div>
      )}

      {/* Results Section after 50+ chars */}
      {!isAnalyzing && isEnoughChars && atsResult && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 pt-2 border-t border-white/[0.08]"
        >
          {/* Match Score Doughnut Circle */}
          <div className="relative flex flex-col items-center justify-center p-5 rounded-2xl bg-gradient-to-b from-slate-900/80 to-slate-950/90 border border-white/[0.08] shadow-inner">
            <div className="relative w-44 h-44 flex items-center justify-center">
              <Doughnut data={chartData} options={chartOptions} />

              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <motion.div
                  key={atsResult.matchPercentage}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="text-4xl font-extrabold tracking-tight text-white flex items-baseline gap-0.5"
                >
                  <span>{atsResult.matchPercentage}</span>
                  <span className="text-sm font-semibold text-slate-400">%</span>
                </motion.div>
                <span className="text-[11px] font-semibold text-slate-400 mt-0.5 uppercase tracking-wider">
                  ATS Match
                </span>
              </div>
            </div>

            <div className={`mt-3 px-3.5 py-1 rounded-full border text-xs font-bold ${colorInfo.bg} ${colorInfo.border} ${colorInfo.text}`}>
              {colorInfo.label} ({atsResult.matchedKeywords.length}/{atsResult.totalJobKeywords} keywords)
            </div>
          </div>

          {/* Quick Action Button to Add Missing Skills */}
          {atsResult.missingKeywords.length > 0 && (
            <Button
              type="button"
              onClick={handleAddMissingSkillsToStore}
              className="w-full h-9.5 text-xs bg-gradient-to-r from-cyan-400 to-emerald-400 hover:opacity-90 text-slate-950 font-bold rounded-xl shadow-md shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-950" />
              <span>Add Missing Skills to Skills Section</span>
            </Button>
          )}

          {/* Matched Keywords */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Matched Keywords ({atsResult.matchedKeywords.length})</span>
              </h4>
            </div>
            {atsResult.matchedKeywords.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No matching keywords found yet.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                {atsResult.matchedKeywords.map((kw) => (
                  <span
                    key={kw}
                    className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Missing Keywords */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                <XCircle className="w-3.5 h-3.5" />
                <span>Missing Keywords ({atsResult.missingKeywords.length})</span>
              </h4>
              <span className="text-[10px] text-slate-400 font-medium">Click to highlight section</span>
            </div>
            {atsResult.missingKeywords.length === 0 ? (
              <p className="text-xs text-emerald-400 font-medium">Awesome! No missing keywords.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto pr-1">
                {atsResult.missingKeywords.map((kw) => (
                  <button
                    key={kw}
                    type="button"
                    onClick={() => handleHighlightMissingKeyword(kw)}
                    className="px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25 hover:border-rose-400 transition-colors flex items-center gap-1 group"
                  >
                    <span>{kw}</span>
                    <PlusCircle className="w-3 h-3 text-rose-400 group-hover:scale-110 transition-transform" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Repeated Keywords */}
          {atsResult.repeatedKeywords.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Repeated Keywords ({atsResult.repeatedKeywords.length})</span>
                </h4>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {atsResult.repeatedKeywords.map((kw) => {
                  const count = repeatedKeywordCounts.get(kw) || 4;
                  return (
                    <span
                      key={kw}
                      className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1"
                    >
                      <span>{kw}</span>
                      <span className="px-1.5 py-0.2 rounded-full bg-amber-500/30 text-[10px] font-bold">
                        x{count}
                      </span>
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {!isEnoughChars && jobDescription.length > 0 && (
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/[0.08] text-center">
          <p className="text-xs text-slate-400">
            Keep typing or paste at least <span className="font-bold text-slate-200">{50 - charCount} more characters</span> to see full ATS analysis.
          </p>
        </div>
      )}
    </div>
  );
}
