"use client";

import type { RoleOptimizationResult } from "@/lib/ai/types";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Lightbulb,
} from "lucide-react";

interface OptimizationDashboardProps {
  result: RoleOptimizationResult;
  pendingCount: number;
  onReviewChanges: () => void;
  onReset: () => void;
}

export function OptimizationDashboard({
  result,
  pendingCount,
  onReviewChanges,
  onReset,
}: OptimizationDashboardProps) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center space-y-1">
        <h3 className="text-sm font-bold text-foreground">
          🎯 {result.targetRole} Analysis
        </h3>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          {result.overallAssessment}
        </p>
      </div>

      {/* Strengths */}
      <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
        <h4 className="text-[11px] font-bold text-emerald-300 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          Strengths Found
        </h4>
        <div className="space-y-1.5">
          {result.matchedSkills.length > 0 && (
            <p className="text-[11px] text-foreground/90">
              ✓ <span className="font-semibold text-emerald-300">{result.matchedSkills.length}</span> relevant skills already present
            </p>
          )}
          {result.relevantProjects.length > 0 && (
            <p className="text-[11px] text-foreground/90">
              ✓ <span className="font-semibold text-emerald-300">{result.relevantProjects.length}</span> projects highly relevant
            </p>
          )}
          {result.relevantExperience.length > 0 && (
            <p className="text-[11px] text-foreground/90">
              ✓ <span className="font-semibold text-emerald-300">{result.relevantExperience.length}</span> relevant experience entries
            </p>
          )}
          {result.matchedSkills.length === 0 && result.relevantProjects.length === 0 && result.relevantExperience.length === 0 && (
            <p className="text-[11px] text-muted-foreground italic">No strong matches identified yet</p>
          )}
        </div>
      </div>

      {/* Improvements Needed */}
      {pendingCount > 0 && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
          <h4 className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            Improvements Recommended
          </h4>
          <div className="space-y-1.5">
            {result.summary?.suggested && result.summary.suggested !== result.summary.current && (
              <p className="text-[11px] text-foreground/90">⚠ Summary needs optimization</p>
            )}
            {result.skills?.reordered && Object.keys(result.skills.reordered).length > 0 && (
              <p className="text-[11px] text-foreground/90">⚠ Skills ordering can be improved</p>
            )}
            {(result.sectionChanges || []).map((change) => (
              <p key={change.sectionKey} className="text-[11px] text-foreground/90">
                ⚠ {change.label} needs stronger impact
              </p>
            ))}
            {result.missingSkills.length > 0 && (
              <p className="text-[11px] text-foreground/90">
                ⚠ {result.missingSkills.length} skills suggested to learn
              </p>
            )}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {result.recommendations.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-card/70 border border-white/[0.08] space-y-2 backdrop-blur-md">
          <h4 className="text-[11px] font-bold text-cyan-300 flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            Recommendations
          </h4>
          <ul className="space-y-1">
            {result.recommendations.slice(0, 5).map((rec, i) => (
              <li key={i} className="text-[11px] text-foreground/90 flex items-start gap-1.5">
                <span className="text-cyan-400 font-bold shrink-0">{i + 1}.</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-2 pt-1">
        {pendingCount > 0 && (
          <Button
            type="button"
            onClick={onReviewChanges}
            className="w-full h-9 text-xs font-bold bg-gradient-to-r from-cyan-500 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 rounded-xl shadow-md shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>Review Changes ({pendingCount})</span>
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          onClick={onReset}
          className="w-full h-8 text-xs bg-white/[0.04] border-white/[0.08] text-muted-foreground hover:text-foreground hover:bg-white/[0.08] rounded-xl flex items-center justify-center gap-2 transition-all"
        >
          <RefreshCw className="w-3 h-3 text-cyan-400" />
          <span>Back to Analysis</span>
        </Button>
      </div>
    </div>
  );
}
