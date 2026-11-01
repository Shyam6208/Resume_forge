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
      reason: result.summary.reason || "Optimized for role relevance and key accomplishments",
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

  const getStatusBadge = (status?: SectionStatus) => {
    switch (status) {
      case "accepted":
        return (
          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            Accepted
          </span>
        );
      case "rejected":
        return (
          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
            Rejected
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
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
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={!canUndo}
            onClick={onUndo}
            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground disabled:opacity-30 rounded-lg"
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
            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground disabled:opacity-30 rounded-lg"
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
              className="h-7 px-2 text-[10px] text-muted-foreground hover:text-rose-400 rounded-lg"
              title="Restore Original Resume"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              <span>Restore</span>
            </Button>
          )}
        </div>
      </div>

      <h3 className="text-xs font-bold text-foreground">Review Changes</h3>

      {/* Section Cards */}
      <div className="space-y-2.5">
        {sections.map((section) => {
          const status = sectionStatuses[section.key];
          const isExpanded = expandedSections.has(section.key);
          const isPending = !status || status === "pending";

          return (
            <div
              key={section.key}
              className="rounded-2xl border border-white/[0.08] bg-card/70 overflow-hidden backdrop-blur-md shadow-xs transition-all"
            >
              {/* Section Header */}
              <button
                type="button"
                onClick={() => toggleExpanded(section.key)}
                className="w-full flex items-center justify-between px-3.5 py-3 hover:bg-white/[0.04] transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs font-semibold text-foreground truncate">{section.label}</span>
                  {getStatusBadge(status)}
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                )}
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="px-3.5 pb-3.5 space-y-3 border-t border-white/[0.06]">
                  {/* Reason */}
                  <p className="text-[11px] text-muted-foreground pt-2.5">{section.reason}</p>

                  {/* Before / After */}
                  <div className="space-y-2">
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                      <p className="text-[10px] font-bold text-rose-400 mb-1">BEFORE</p>
                      <p className="text-[11px] text-foreground/90 whitespace-pre-wrap leading-relaxed line-clamp-6">
                        {section.before || "(empty)"}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <p className="text-[10px] font-bold text-emerald-400 mb-1">AFTER</p>
                      <p className="text-[11px] text-foreground/90 whitespace-pre-wrap leading-relaxed line-clamp-6">
                        {section.after}
                      </p>
                    </div>
                  </div>

                  {/* Key Changes */}
                  {section.keyChanges.length > 0 && (
                    <div className="space-y-1">
                      {section.keyChanges.map((change, i) => (
                        <p key={i} className="text-[11px] text-muted-foreground flex items-start gap-1.5">
                          <span className="text-cyan-400 font-bold shrink-0">•</span>
                          <span>{change}</span>
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Accept/Reject Buttons */}
                  {isPending && (
                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => onAcceptSection(section.key)}
                        className="h-7 text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg flex items-center gap-1 shadow-xs"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Accept</span>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onRejectSection(section.key)}
                        className="h-7 text-xs border-white/[0.08] text-muted-foreground hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30 rounded-lg flex items-center gap-1"
                      >
                        <XCircle className="w-3 h-3" />
                        <span>Reject</span>
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
        <p className="text-xs text-muted-foreground text-center py-4">No changes to review</p>
      )}

      {/* Apply All */}
      {pendingCount > 0 && (
        <Button
          type="button"
          onClick={onApplyAll}
          className="w-full h-9 text-xs font-extrabold bg-gradient-to-r from-cyan-500 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-cyan-500/20"
        >
          <CheckCheck className="w-3.5 h-3.5" />
          <span>Apply All Pending ({pendingCount})</span>
        </Button>
      )}
    </div>
  );
}
