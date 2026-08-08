"use client";

import { useEffect, useState } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useResumeScore } from "@/hooks/useResumeScore";
import { useUIStore } from "@/store/ui.store";
import type { ScoreLevel, Suggestion } from "@/utils/score-calculator";
import type { SectionKey } from "@/types/resume.types";
import { SECTION_CONFIG } from "@/config/sections.config";
import { Sparkles, AlertCircle, AlertTriangle, Lightbulb, ChevronRight, CheckCircle2 } from "lucide-react";

ChartJS.register(ArcElement, Tooltip, Legend);

const LEVEL_CONFIG: Record<
  ScoreLevel,
  { label: string; bgClass: string; borderClass: string; textClass: string; colorHex: string; icon: string }
> = {
  "top-candidate": {
    label: "Top Candidate",
    bgClass: "bg-emerald-500/15",
    borderClass: "border-emerald-500/30",
    textClass: "text-emerald-400",
    colorHex: "#22c55e",
    icon: "🌟",
  },
  "interview-ready": {
    label: "Interview Ready",
    bgClass: "bg-blue-500/15",
    borderClass: "border-blue-500/30",
    textClass: "text-blue-400",
    colorHex: "#3b82f6",
    icon: "🚀",
  },
  "job-ready": {
    label: "Job Ready",
    bgClass: "bg-yellow-500/15",
    borderClass: "border-amber-500/30",
    textClass: "text-amber-400",
    colorHex: "#eab308",
    icon: "👍",
  },
  developing: {
    label: "Developing",
    bgClass: "bg-orange-500/15",
    borderClass: "border-orange-500/30",
    textClass: "text-orange-400",
    colorHex: "#f97316",
    icon: "📈",
  },
  beginner: {
    label: "Beginner",
    bgClass: "bg-red-500/15",
    borderClass: "border-rose-500/30",
    textClass: "text-rose-400",
    colorHex: "#ef4444",
    icon: "🌱",
  },
};

function AnimatedScoreNumber({ value }: { value: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(count, value, {
      type: "spring",
      stiffness: 90,
      damping: 14,
    });
    return () => controls.stop();
  }, [value, count]);

  useEffect(() => {
    return rounded.on("change", (v) => setDisplayValue(v));
  }, [rounded]);

  return <span>{displayValue}</span>;
}

export function ResumeScore() {
  const { score, level, suggestions, isCalculating } = useResumeScore();
  const setActiveSection = useUIStore((s) => s.setActiveSection);
  const setMobileTab = useUIStore((s) => s.setMobileTab);

  const levelInfo = LEVEL_CONFIG[level] || LEVEL_CONFIG.beginner;

  // Chart data
  const chartData = {
    datasets: [
      {
        data: [score, 100 - score],
        backgroundColor: [levelInfo.colorHex, "rgba(255, 255, 255, 0.08)"],
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

  // Group suggestions
  const criticalSuggestions = suggestions.filter((s) => s.type === "critical");
  const importantSuggestions = suggestions.filter((s) => s.type === "important");
  const tipSuggestions = suggestions.filter((s) => s.type === "tip");

  const handleSuggestionClick = (sectionName: string) => {
    const sectionKey = sectionName as SectionKey;
    setActiveSection(sectionKey);
    setMobileTab("edit");

    // Scroll to section in DOM if available
    setTimeout(() => {
      const el =
        document.getElementById(`section-${sectionKey}`) ||
        document.getElementById(sectionKey) ||
        document.querySelector(`[data-section="${sectionKey}"]`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);
  };

  const renderSuggestionItem = (item: Suggestion, idx: number, iconEmoji: string, badgeBg: string) => {
    const sectionLabel = SECTION_CONFIG[item.section as SectionKey]?.label || item.section;

    return (
      <motion.button
        key={`${item.section}-${idx}`}
        type="button"
        whileHover={{ scale: 1.01, x: 2 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => handleSuggestionClick(item.section)}
        className="w-full text-left p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-900 transition-all flex items-start justify-between gap-3 group"
      >
        <div className="flex items-start gap-2 min-w-0">
          <span className="text-sm shrink-0 mt-0.5">{iconEmoji}</span>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-200 capitalize">
                {sectionLabel}
              </span>
              <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${badgeBg}`}>
                +{item.points} pts
              </span>
            </div>
            <p className="text-xs text-slate-400 group-hover:text-slate-300 leading-relaxed">
              {item.message}
            </p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300 shrink-0 mt-1 transition-colors" />
      </motion.button>
    );
  };

  return (
    <div className="space-y-6 text-slate-100">
      {/* Circle Doughnut Chart + Center Score */}
      <div className="relative flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 shadow-inner">
        <div className="relative w-44 h-44 flex items-center justify-center">
          <Doughnut data={chartData} options={chartOptions} />

          {/* Central Animated Counter */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <motion.div
              key={score}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="text-4xl font-extrabold tracking-tight text-white flex items-baseline gap-0.5"
            >
              <AnimatedScoreNumber value={score} />
              <span className="text-sm font-semibold text-slate-500">/100</span>
            </motion.div>

            <span className="text-[11px] font-medium text-slate-400 mt-0.5 flex items-center gap-1">
              {isCalculating ? (
                <span className="animate-pulse text-amber-400">Calculating...</span>
              ) : (
                <>
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  <span>Resume Score</span>
                </>
              )}
            </span>
          </div>
        </div>

        {/* Level Badge Below */}
        <motion.div
          key={level}
          initial={{ y: 5, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`mt-4 px-3.5 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-1.5 ${levelInfo.bgClass} ${levelInfo.borderClass} ${levelInfo.textClass}`}
        >
          <span>{levelInfo.icon}</span>
          <span>{levelInfo.label}</span>
        </motion.div>
      </div>

      {/* Suggestions Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Score Suggestions</span>
          </h3>
          <span className="text-[11px] font-semibold text-slate-500">
            {suggestions.length} action {suggestions.length === 1 ? "item" : "items"}
          </span>
        </div>

        {suggestions.length === 0 ? (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-1">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
            <p className="text-xs font-bold text-emerald-300">Your resume is fully optimized!</p>
            <p className="text-[11px] text-slate-400">No pending suggestions found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Critical List */}
            {criticalSuggestions.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>🔴 Critical ({criticalSuggestions.length})</span>
                </div>
                <div className="space-y-1.5">
                  {criticalSuggestions.map((item, idx) =>
                    renderSuggestionItem(item, idx, "🔴", "bg-rose-500/20 text-rose-300")
                  )}
                </div>
              </div>
            )}

            {/* Important List */}
            {importantSuggestions.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>🟡 Important ({importantSuggestions.length})</span>
                </div>
                <div className="space-y-1.5">
                  {importantSuggestions.map((item, idx) =>
                    renderSuggestionItem(item, idx, "🟡", "bg-amber-500/20 text-amber-300")
                  )}
                </div>
              </div>
            )}

            {/* Tips List */}
            {tipSuggestions.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>🟢 Tips ({tipSuggestions.length})</span>
                </div>
                <div className="space-y-1.5">
                  {tipSuggestions.map((item, idx) =>
                    renderSuggestionItem(item, idx, "🟢", "bg-emerald-500/20 text-emerald-300")
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
