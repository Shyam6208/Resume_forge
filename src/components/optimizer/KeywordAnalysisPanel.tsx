"use client";

import type { KeywordAnalysis } from "@/lib/ai/types";
import { Tag } from "lucide-react";

interface KeywordAnalysisPanelProps {
  keywords: KeywordAnalysis;
}

export function KeywordAnalysisPanel({ keywords }: KeywordAnalysisPanelProps) {
  const hasAny =
    keywords.highPriority.length > 0 ||
    keywords.mediumPriority.length > 0 ||
    keywords.lowPriority.length > 0;

  if (!hasAny) return null;

  return (
    <div className="space-y-3">
      <h4 className="text-[11px] font-bold text-white flex items-center gap-1.5">
        <Tag className="w-3.5 h-3.5 text-indigo-400" />
        Keyword Recommendations
      </h4>

      {keywords.highPriority.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">High Priority</p>
          <div className="flex flex-wrap gap-1.5">
            {keywords.highPriority.map((kw) => (
              <span
                key={kw}
                className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-500/10 text-rose-300 border border-rose-500/25"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {keywords.mediumPriority.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Medium Priority</p>
          <div className="flex flex-wrap gap-1.5">
            {keywords.mediumPriority.map((kw) => (
              <span
                key={kw}
                className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/25"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {keywords.lowPriority.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nice to Have</p>
          <div className="flex flex-wrap gap-1.5">
            {keywords.lowPriority.map((kw) => (
              <span
                key={kw}
                className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-400 border border-slate-700"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
