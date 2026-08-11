"use client";

import type { SuggestedSkill } from "@/lib/ai/types";
import { CheckCircle2, AlertTriangle, BookOpen } from "lucide-react";

interface MissingSkillsPanelProps {
  matchedSkills: string[];
  missingSkills: SuggestedSkill[];
}

function getPriorityBadge(priority: string) {
  switch (priority) {
    case "high":
      return (
        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/25">
          HIGH
        </span>
      );
    case "medium":
      return (
        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/25">
          MED
        </span>
      );
    default:
      return (
        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-700 text-slate-400 border border-slate-600">
          LOW
        </span>
      );
  }
}

export function MissingSkillsPanel({ matchedSkills, missingSkills }: MissingSkillsPanelProps) {
  return (
    <div className="space-y-4">
      {/* Matched Skills */}
      {matchedSkills.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Skills Already Present ({matchedSkills.length})
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {matchedSkills.map((skill) => (
              <span
                key={skill}
                className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/25"
              >
                ✓ {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Suggested Missing Skills */}
      {missingSkills.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            Suggested Skills to Learn ({missingSkills.length})
          </h4>
          <p className="text-[10px] text-slate-500">
            These skills are NOT auto-added. They are learning suggestions only.
          </p>
          <div className="space-y-2">
            {missingSkills.map((skill) => (
              <div
                key={skill.skill}
                className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-white">{skill.skill}</span>
                  {getPriorityBadge(skill.learningPriority)}
                </div>
                <p className="text-[10px] text-slate-400">{skill.reason}</p>
                {skill.commonUseCase && (
                  <p className="text-[10px] text-slate-500 flex items-start gap-1">
                    <BookOpen className="w-3 h-3 shrink-0 mt-px text-indigo-400" />
                    <span>{skill.commonUseCase}</span>
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {matchedSkills.length === 0 && missingSkills.length === 0 && (
        <p className="text-xs text-slate-500 text-center py-2">No skill analysis available</p>
      )}
    </div>
  );
}
