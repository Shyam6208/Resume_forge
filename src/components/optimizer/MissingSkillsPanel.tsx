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
        <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/25">
          HIGH
        </span>
      );
    case "medium":
      return (
        <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/25">
          MED
        </span>
      );
    default:
      return (
        <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-white/[0.06] text-muted-foreground border border-white/[0.08]">
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
          <h4 className="text-[11px] font-bold text-emerald-300 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Skills Already Present ({matchedSkills.length})</span>
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {matchedSkills.map((skill) => (
              <span
                key={skill}
                className="px-2.5 py-0.5 rounded-xl text-[10px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 shadow-2xs"
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
          <h4 className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Suggested Skills to Learn ({missingSkills.length})</span>
          </h4>
          <p className="text-[10px] text-muted-foreground">
            These skills are not auto-added. They are strategic learning recommendations for this target role.
          </p>
          <div className="space-y-2">
            {missingSkills.map((skill) => (
              <div
                key={skill.skill}
                className="p-3 rounded-2xl bg-card/70 border border-white/[0.08] space-y-1.5 backdrop-blur-md"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-foreground">{skill.skill}</span>
                  {getPriorityBadge(skill.learningPriority)}
                </div>
                <p className="text-[10px] text-muted-foreground">{skill.reason}</p>
                {skill.commonUseCase && (
                  <p className="text-[10px] text-cyan-300/90 flex items-start gap-1">
                    <BookOpen className="w-3 h-3 shrink-0 mt-px text-cyan-400" />
                    <span>{skill.commonUseCase}</span>
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {matchedSkills.length === 0 && missingSkills.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-4">No skill analysis available</p>
      )}
    </div>
  );
}
