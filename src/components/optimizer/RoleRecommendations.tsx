"use client";

import { useMemo, useState } from "react";
import { useResumeStore } from "@/store/resume.store";
import { analyzeLocalRelevance } from "@/lib/role-matching";
import { CheckCircle2, PlusCircle, Target, ChevronDown, ChevronUp } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";

export function RoleRecommendations() {
  const currentResume = useResumeStore((s) => s.currentResume);
  const userType = useAuthStore((s) => s.userType);
  const targetJob = currentResume?.targetJob || "";

  const [expanded, setExpanded] = useState(true);

  const relevance = useMemo(() => {
    if (!currentResume) return null;
    return analyzeLocalRelevance(currentResume.data, targetJob, userType || "developer");
  }, [currentResume, targetJob, userType]);

  if (!relevance || !targetJob) return null;

  const {
    matchedSkills,
    missingRecommendedSkills,
    rankedProjects,
  } = relevance;

  return (
    <div className="bg-card/70 border border-white/[0.08] rounded-2xl overflow-hidden flex flex-col mt-4 shadow-sm backdrop-blur-md">
      <button 
        type="button"
        className="w-full p-3.5 flex items-center justify-between hover:bg-white/[0.04] transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Target className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-left">
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Optimized Target</p>
            <p className="text-xs font-bold text-foreground">{targetJob}</p>
          </div>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      {expanded && (
        <div className="p-3.5 border-t border-white/[0.06] space-y-4 bg-card/40">
          {/* Matched Skills / Focus */}
          {matchedSkills.length > 0 && (
            <div className="space-y-1.5">
              <h4 className="text-[11px] font-semibold text-foreground">Recommended Focus</h4>
              <div className="flex flex-wrap gap-1.5">
                {matchedSkills.map(skill => (
                  <div key={skill} className="flex items-center gap-1 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded-lg text-[10px] font-medium">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>{skill}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Missing Skills */}
          {missingRecommendedSkills.length > 0 && (
            <div className="space-y-1.5">
              <h4 className="text-[11px] font-semibold text-foreground">Skills to Consider</h4>
              <div className="flex flex-wrap gap-1.5">
                {missingRecommendedSkills.map(skill => (
                  <div key={skill} className="flex items-center gap-1 bg-white/[0.04] text-cyan-300 border border-cyan-500/20 px-2 py-0.5 rounded-lg text-[10px] font-medium">
                    <PlusCircle className="w-3 h-3 text-cyan-400" />
                    <span>{skill}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Project Focus */}
          {rankedProjects.length > 0 && (
            <div className="space-y-1.5">
              <h4 className="text-[11px] font-semibold text-foreground">Project Highlights</h4>
              <div className="space-y-1">
                {rankedProjects.slice(0, 3).map((project, idx) => (
                  <div key={project.id} className="text-[11px] text-muted-foreground flex gap-2">
                    <span className="text-cyan-400 font-bold">{idx + 1}.</span>
                    <span className="truncate text-foreground/90">{project.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
