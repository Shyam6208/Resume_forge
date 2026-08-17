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
    <div className="space-y-5">
      {/* Header */}
      <div className="text-center space-y-1">
        <h3 className="text-sm font-bold text-white">
          🎯 {result.targetRole} Analysis
        </h3>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          {result.overallAssessment}
        </p>
      </div>

      {/* Strengths */}
      <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
        <h4 className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Strengths Found
        </h4>
        <div className="space-y-1.5">
          {result.matchedSkills.length > 0 && (
            <p className="text-[11px] text-slate-300">
              ✓ <span className="font-medium text-emerald-300">{result.matchedSkills.length}</span> relevant skills already present
            </p>
          )}
          {result.relevantProjects.length > 0 && (
            <p className="text-[11px] text-slate-300">
              ✓ <span className="font-medium text-emerald-300">{result.relevantProjects.length}</span> projects highly relevant
            </p>
          )}
          {result.relevantExperience.length > 0 && (
            <p className="text-[11px] text-slate-300">
              ✓ <span className="font-medium text-emerald-300">{result.relevantExperience.length}</span> relevant experience entries
            </p>
          )}
          {result.matchedSkills.length === 0 && result.relevantProjects.length === 0 && result.relevantExperience.length === 0 && (
            <p className="text-[11px] text-slate-400 italic">No strong matches identified yet</p>
          )}
        </div>
      </div>

      {/* Improvements Needed */}
      {pendingCount > 0 && (
        <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-2">
          <h4 className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            Improvements Recommended
          </h4>
          <div className="space-y-1.5">
            {result.summary?.suggested && result.summary.suggested !== result.summary.current && (
              <p className="text-[11px] text-slate-300">⚠ Summary needs optimization</p>
            )}
            {result.skills?.reordered && Object.keys(result.skills.reordered).length > 0 && (
              <p className="text-[11px] text-slate-300">⚠ Skills ordering can be improved</p>
            )}
            {(result.sectionChanges || []).map((change) => (
              <p key={change.sectionKey} className="text-[11px] text-slate-300">
                ⚠ {change.label} needs stronger impact
              </p>
            ))}
            {result.missingSkills.length > 0 && (
              <p className="text-[11px] text-slate-300">
                ⚠ {result.missingSkills.length} skills suggested to learn
              </p>
            )}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {result.recommendations.length > 0 && (
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
          <h4 className="text-[11px] font-bold text-indigo-400 flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5" />
            Recommendations
          </h4>
          <ul className="space-y-1">
            {result.recommendations.slice(0, 5).map((rec, i) => (
              <li key={i} className="text-[11px] text-slate-300 flex items-start gap-1.5">
                <span className="text-indigo-400 font-bold shrink-0">{i + 1}.</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-2">
        {pendingCount > 0 && (
          <Button
            type="button"
            onClick={onReviewChanges}
            className="w-full h-9 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl flex items-center justify-center gap-2"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>Review Changes ({pendingCount})</span>
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          onClick={onReset}
          className="w-full h-8 text-xs bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Back to Analysis</span>
        </Button>
      </div>
    </div>
  );
}
