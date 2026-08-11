"use client";

import { useState } from "react";
import type { RoleOptimizationResult } from "@/lib/ai/types";
import type { SectionStatus } from "@/store/optimization.store";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Undo2,
  Redo2,
  RotateCcw,
  CheckCheck,
  ArrowLeft,
} from "lucide-react";

interface ChangePreviewPanelProps {
  result: RoleOptimizationResult;
  sectionStatuses: Record<string, SectionStatus>;
  canUndo: boolean;
  canRedo: boolean;
  hasOriginalSnapshot: boolean;
  onAcceptSection: (key: string) => void;
  onRejectSection: (key: string) => void;
  onApplyAll: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onRestoreOriginal: () => void;
  onBack: () => void;
}

function formatSectionData(data: unknown): string {
  if (typeof data === "string") return data;
  if (Array.isArray(data)) {
    return data
      .map((item) => {
        if (typeof item === "string") return `• ${item}`;
        if (typeof item === "object" && item !== null) {
          const obj = item as Record<string, unknown>;
          const name = obj.name || obj.title || obj.position || obj.company || "";
          return `• ${name}`;
        }
        return `• ${JSON.stringify(item)}`;
      })
      .join("\n");
  }
  if (typeof data === "object" && data !== null) {
    return Object.entries(data as Record<string, unknown>)
      .map(([key, val]) => {
        if (Array.isArray(val)) return `${key}: ${val.join(", ")}`;
        return `${key}: ${val}`;
      })
      .join("\n");
  }
  return String(data ?? "");
}

export function ChangePreviewPanel({
  result,
  sectionStatuses,
  canUndo,
  canRedo,
  hasOriginalSnapshot,
  onAcceptSection,
  onRejectSection,
  onApplyAll,
  onUndo,
  onRedo,
  onRestoreOriginal,
  onBack,
}: ChangePreviewPanelProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["summary"]));

  const toggleExpanded = (key: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // Build list of all changeable sections
  const sections: Array<{
    key: string;
    label: string;
    before: string;
    after: string;
    reason: string;
    keyChanges: string[];
  }> = [];

  // Summary
  if (result.summary?.suggested && result.summary.suggested !== result.summary.current) {
    sections.push({
      key: "summary",
      label: "Professional Summary",
      before: result.summary.current || "(empty)",
      after: result.summary.suggested,
      reason: result.summary.reason,
      keyChanges: ["Optimized for target role keywords", "Enhanced professional tone"],
    });
  }

  // Skills
  if (result.skills?.reordered && Object.keys(result.skills.reordered).length > 0) {
    sections.push({
      key: "skills",
      label: "Skills & Technologies",
      before: formatSectionData(result.skills.existing),
      after: formatSectionData(result.skills.reordered),
      reason: "Skills reordered by relevance to target role",
      keyChanges: ["Grouped by category", "Prioritized relevant skills"],
    });
  }

  // Section changes
  for (const change of result.sectionChanges || []) {
    sections.push({
      key: change.sectionKey,
      label: change.label,
      before: formatSectionData(change.currentData),
      after: formatSectionData(change.suggestedData),
      reason: change.reason,
      keyChanges: change.keyChanges,
    });
  }

  const pendingCount = sections.filter((s) => sectionStatuses[s.key] === "pending").length;

  const getStatusBadge = (status: SectionStatus | undefined) => {
    switch (status) {
      case "accepted":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            Accepted
          </span>
        );
      case "rejected":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-500/15 text-rose-400 border border-rose-500/30">
            Rejected
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/15 text-amber-400 border border-amber-500/30">
            Pending
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3 h-3" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={!canUndo}
            onClick={onUndo}
            className="h-7 w-7 p-0 text-slate-400 hover:text-white disabled:opacity-30"
            title="Undo"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={!canRedo}
            onClick={onRedo}
            className="h-7 w-7 p-0 text-slate-400 hover:text-white disabled:opacity-30"
            title="Redo"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </Button>
          {hasOriginalSnapshot && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onRestoreOriginal}
              className="h-7 px-2 text-[10px] text-slate-400 hover:text-rose-400"
              title="Restore Original Resume"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Restore
            </Button>
          )}
        </div>
      </div>

      <h3 className="text-xs font-bold text-white">Review Changes</h3>

      {/* Section Cards */}
      <div className="space-y-2">
        {sections.map((section) => {
          const status = sectionStatuses[section.key];
          const isExpanded = expandedSections.has(section.key);
          const isPending = !status || status === "pending";

          return (
            <div
              key={section.key}
              className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden"
            >
              {/* Section Header */}
              <button
                type="button"
                onClick={() => toggleExpanded(section.key)}
                className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs font-semibold text-white truncate">{section.label}</span>
                  {getStatusBadge(status)}
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                )}
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="px-3 pb-3 space-y-3 border-t border-slate-800/60">
                  {/* Reason */}
                  <p className="text-[10px] text-slate-400 pt-2">{section.reason}</p>

                  {/* Before / After */}
                  <div className="space-y-2">
                    <div className="p-2.5 rounded-lg bg-rose-500/5 border border-rose-500/15">
                      <p className="text-[10px] font-bold text-rose-400 mb-1">BEFORE</p>
                      <p className="text-[11px] text-slate-300 whitespace-pre-wrap leading-relaxed line-clamp-6">
                        {section.before || "(empty)"}
                      </p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/15">
                      <p className="text-[10px] font-bold text-emerald-400 mb-1">AFTER</p>
                      <p className="text-[11px] text-slate-300 whitespace-pre-wrap leading-relaxed line-clamp-6">
                        {section.after}
                      </p>
                    </div>
                  </div>

                  {/* Key Changes */}
                  {section.keyChanges.length > 0 && (
                    <div className="space-y-1">
                      {section.keyChanges.map((change, i) => (
                        <p key={i} className="text-[10px] text-slate-400 flex items-start gap-1">
                          <span className="text-indigo-400 shrink-0">•</span>
                          <span>{change}</span>
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Accept/Reject Buttons */}
                  {isPending && (
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => onAcceptSection(section.key)}
                        className="h-7 text-[11px] bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        Accept
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onRejectSection(section.key)}
                        className="h-7 text-[11px] border-slate-700 text-slate-300 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30 rounded-lg flex items-center gap-1"
                      >
                        <XCircle className="w-3 h-3" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {sections.length === 0 && (
        <p className="text-xs text-slate-500 text-center py-4">No changes to review</p>
      )}

      {/* Apply All */}
      {pendingCount > 0 && (
        <Button
          type="button"
          onClick={onApplyAll}
          className="w-full h-9 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl flex items-center justify-center gap-2"
        >
          <CheckCheck className="w-3.5 h-3.5" />
          <span>Apply All Pending ({pendingCount})</span>
        </Button>
      )}
    </div>
  );
}
