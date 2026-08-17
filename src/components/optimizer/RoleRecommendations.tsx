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
    resolvedProfile,
    matchedSkills,
    missingRecommendedSkills,
    rankedProjects,
    sectionPriority
  } = relevance;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden flex flex-col mt-4">
      <button 
        className="w-full p-3 flex items-center justify-between hover:bg-slate-800/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-indigo-400" />
          <div className="text-left">
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Optimized For</p>
            <p className="text-xs font-bold text-slate-200">{targetJob}</p>
          </div>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
      </button>

      {expanded && (
        <div className="p-3 border-t border-slate-800 space-y-4 bg-slate-950/50">
          
          {/* Matched Skills / Focus */}
          {matchedSkills.length > 0 && (
            <div className="space-y-1.5">
              <h4 className="text-[11px] font-semibold text-slate-300">Recommended Focus</h4>
              <div className="flex flex-wrap gap-1.5">
                {matchedSkills.map(skill => (
                  <div key={skill} className="flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded text-[10px] font-medium">
                    <CheckCircle2 className="w-3 h-3" />
                    {skill}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Missing Skills */}
          {missingRecommendedSkills.length > 0 && (
            <div className="space-y-1.5">
              <h4 className="text-[11px] font-semibold text-slate-300">Skills to Consider</h4>
              <div className="flex flex-wrap gap-1.5">
                {missingRecommendedSkills.map(skill => (
                  <div key={skill} className="flex items-center gap-1 bg-slate-800 text-slate-400 border border-slate-700 px-1.5 py-0.5 rounded text-[10px] font-medium">
                    <PlusCircle className="w-3 h-3" />
                    {skill}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Project Focus */}
          {rankedProjects.length > 0 && (
            <div className="space-y-1.5">
              <h4 className="text-[11px] font-semibold text-slate-300">Project Focus</h4>
              <div className="space-y-1">
                {rankedProjects.slice(0, 3).map((project, idx) => (
                  <div key={project.id} className="text-[11px] text-slate-400 flex gap-2">
                    <span className="text-slate-500">{idx + 1}.</span>
                    <span className="truncate">{project.name}</span>
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
