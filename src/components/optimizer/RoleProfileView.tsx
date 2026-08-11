"use client";

import type { TargetRoleProfile } from "@/config/target-roles.config";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Rocket, Zap, BookOpen } from "lucide-react";

interface RoleProfileViewProps {
  profile: TargetRoleProfile;
  isOptimizing: boolean;
  onOptimize: () => void;
  onBack: () => void;
}

export function RoleProfileView({ profile, isOptimizing, onOptimize, onBack }: RoleProfileViewProps) {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3 h-3" />
          <span>Change Role</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-2xl">{profile.emoji}</span>
          <div>
            <h3 className="text-sm font-bold text-white">{profile.label}</h3>
            <p className="text-[11px] text-slate-400">{profile.description}</p>
          </div>
        </div>
      </div>

      {/* Core Skills */}
      <div className="space-y-2">
        <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Zap className="w-3 h-3 text-amber-400" />
          Core Skills Expected
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {profile.coreSkills.map((skill) => (
            <span
              key={skill}
              className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-500/15 text-indigo-300 border border-indigo-500/25"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Secondary Skills */}
      <div className="space-y-2">
        <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <BookOpen className="w-3 h-3 text-cyan-400" />
          Secondary Skills
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {profile.secondarySkills.map((skill) => (
            <span
              key={skill}
              className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Important Keywords */}
      <div className="space-y-2">
        <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
          📝 Important Resume Keywords
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {profile.importantKeywords.map((kw) => (
            <span
              key={kw}
              className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/25"
            >
              {kw}
            </span>
          ))}
        </div>
      </div>

      {/* Optimize Button */}
      <Button
        type="button"
        onClick={onOptimize}
        disabled={isOptimizing}
        className="w-full h-10 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
      >
        <Rocket className="w-4 h-4" />
        <span>{isOptimizing ? "Analyzing..." : "🚀 Optimize My Resume"}</span>
      </Button>

      <p className="text-[10px] text-slate-500 text-center">
        AI will analyze your resume and suggest improvements for this role.
        Your original resume will be preserved.
      </p>
    </div>
  );
}
