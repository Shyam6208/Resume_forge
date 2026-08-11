// ============================================================
// ResumeForge — Role Optimization Hook
// ============================================================

"use client";

import { useCallback, useMemo } from "react";
import { useResumeStore } from "@/store/resume.store";
import { useOptimizationStore } from "@/store/optimization.store";
import { TARGET_ROLE_MAP } from "@/config/target-roles.config";
import type { TargetRole } from "@/config/target-roles.config";
import type { ResumeData, SectionKey } from "@/types/resume.types";
import toast from "react-hot-toast";

// Simple content hash for cache key generation
function contentHash(data: ResumeData): string {
  const str = JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return Math.abs(hash).toString(36);
}

export function useRoleOptimization() {
  const currentResume = useResumeStore((s) => s.currentResume);
  const updateSection = useResumeStore((s) => s.updateSection);
  const setResume = useResumeStore((s) => s.setResume);

  const selectedRole = useOptimizationStore((s) => s.selectedRole);
  const optimizationResult = useOptimizationStore((s) => s.optimizationResult);
  const isOptimizing = useOptimizationStore((s) => s.isOptimizing);
  const viewState = useOptimizationStore((s) => s.viewState);
  const sectionStatuses = useOptimizationStore((s) => s.sectionStatuses);
  const originalResumeData = useOptimizationStore((s) => s.originalResumeData);
  const undoStack = useOptimizationStore((s) => s.undoStack);
  const redoStack = useOptimizationStore((s) => s.redoStack);

  const selectRole = useOptimizationStore((s) => s.selectRole);
  const setOptimizationResult = useOptimizationStore((s) => s.setOptimizationResult);
  const setIsOptimizing = useOptimizationStore((s) => s.setIsOptimizing);
  const setViewState = useOptimizationStore((s) => s.setViewState);
  const snapshotOriginal = useOptimizationStore((s) => s.snapshotOriginal);
  const setSectionStatus = useOptimizationStore((s) => s.setSectionStatus);
  const pushUndo = useOptimizationStore((s) => s.pushUndo);
  const popUndo = useOptimizationStore((s) => s.popUndo);
  const pushRedo = useOptimizationStore((s) => s.pushRedo);
  const popRedo = useOptimizationStore((s) => s.popRedo);
  const clearRedoStack = useOptimizationStore((s) => s.clearRedoStack);
  const getOriginal = useOptimizationStore((s) => s.getOriginal);
  const getCached = useOptimizationStore((s) => s.getCached);
  const setCache = useOptimizationStore((s) => s.setCache);
  const clearOptimization = useOptimizationStore((s) => s.clearOptimization);

  // Selected role profile
  const selectedRoleProfile = useMemo(
    () => (selectedRole ? TARGET_ROLE_MAP[selectedRole] : null),
    [selectedRole]
  );

  // Cache key
  const cacheKey = useMemo(() => {
    if (!currentResume || !selectedRole) return null;
    const hash = contentHash(currentResume.data);
    return `${currentResume.id}:${selectedRole}:${hash}`;
  }, [currentResume, selectedRole]);

  // Optimize — explicit user action only
  const optimize = useCallback(async () => {
    if (!currentResume || !selectedRole) return;

    // Check cache first
    if (cacheKey) {
      const cached = getCached(cacheKey);
      if (cached) {
        setOptimizationResult(cached);
        return;
      }
    }

    // Snapshot original before any optimization
    snapshotOriginal(currentResume.data);

    setIsOptimizing(true);
    setViewState("optimizing");

    const toastId = toast.loading("🎯 Analyzing resume for " + (selectedRoleProfile?.label || selectedRole) + "...");

    try {
      const res = await fetch("/api/ai/optimize-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeData: currentResume.data,
          targetRoleId: selectedRole,
          userType: "developer",
        }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || `AI analysis failed (HTTP ${res.status}). Please try again.`);
      }

      const result = await res.json();

      // Basic validation
      if (!result || typeof result.targetRole !== "string") {
        throw new Error("AI analysis returned an invalid response. Please try again.");
      }

      setOptimizationResult(result);

      // Cache the result
      if (cacheKey) {
        setCache(cacheKey, result);
      }

      toast.dismiss(toastId);
      toast.success("Optimization analysis complete!", { duration: 3000 });
    } catch (err: unknown) {
      console.error("Role optimization error:", err);
      const msg = err instanceof Error ? err.message : "AI analysis failed. Please try again.";
      toast.dismiss(toastId);
      toast.error(msg, { duration: 4000 });
      setViewState("profile");
    } finally {
      setIsOptimizing(false);
    }
  }, [currentResume, selectedRole, selectedRoleProfile, cacheKey, getCached, setCache, snapshotOriginal, setIsOptimizing, setViewState, setOptimizationResult]);

  // Accept a single section
  const acceptSection = useCallback(
    (sectionKey: string) => {
      if (!currentResume || !optimizationResult) return;

      // Push current state to undo stack
      pushUndo(currentResume.data);
      clearRedoStack();

      if (sectionKey === "summary" && optimizationResult.summary?.suggested) {
        updateSection("summary", optimizationResult.summary.suggested);
      } else if (sectionKey === "skills" && optimizationResult.skills?.reordered) {
        const reordered = optimizationResult.skills.reordered;
        // Map reordered categories to the Skills interface
        const newSkills: Record<string, string[]> = {};
        for (const [category, skills] of Object.entries(reordered)) {
          const key = category.toLowerCase().replace(/\s+/g, "");
          // Map common category names
          if (key.includes("front")) newSkills.frontend = skills;
          else if (key.includes("back")) newSkills.backend = skills;
          else if (key.includes("data") || key.includes("database")) newSkills.database = skills;
          else if (key.includes("cloud")) newSkills.cloud = skills;
          else if (key.includes("program")) newSkills.programming = skills;
          else if (key.includes("soft")) newSkills.softSkills = skills;
          else if (key.includes("tool")) newSkills.tools = skills;
          else if (key.includes("language")) newSkills.languages = skills;
          else newSkills.other = [...(newSkills.other || []), ...skills];
        }
        updateSection("skills", newSkills);
      } else {
        // Find section change
        const change = optimizationResult.sectionChanges?.find(
          (c) => c.sectionKey === sectionKey
        );
        if (change?.suggestedData !== undefined && change?.suggestedData !== null) {
          updateSection(sectionKey as SectionKey, change.suggestedData as ResumeData[keyof ResumeData]);
        }
      }

      setSectionStatus(sectionKey, "accepted");
      toast.success(`${sectionKey} changes applied!`, { duration: 2000 });
    },
    [currentResume, optimizationResult, pushUndo, clearRedoStack, updateSection, setSectionStatus]
  );

  // Reject a section — zero resume changes
  const rejectSection = useCallback(
    (sectionKey: string) => {
      setSectionStatus(sectionKey, "rejected");
    },
    [setSectionStatus]
  );

  // Apply all pending sections
  const applyAll = useCallback(() => {
    if (!currentResume || !optimizationResult) return;

    // Push current state to undo stack once
    pushUndo(currentResume.data);
    clearRedoStack();

    // Apply summary if pending
    if (sectionStatuses["summary"] === "pending" && optimizationResult.summary?.suggested) {
      updateSection("summary", optimizationResult.summary.suggested);
      setSectionStatus("summary", "accepted");
    }

    // Apply skills if pending
    if (sectionStatuses["skills"] === "pending" && optimizationResult.skills?.reordered) {
      const reordered = optimizationResult.skills.reordered;
      const newSkills: Record<string, string[]> = {};
      for (const [category, skills] of Object.entries(reordered)) {
        const key = category.toLowerCase().replace(/\s+/g, "");
        if (key.includes("front")) newSkills.frontend = skills;
        else if (key.includes("back")) newSkills.backend = skills;
        else if (key.includes("data") || key.includes("database")) newSkills.database = skills;
        else if (key.includes("cloud")) newSkills.cloud = skills;
        else if (key.includes("program")) newSkills.programming = skills;
        else if (key.includes("soft")) newSkills.softSkills = skills;
        else if (key.includes("tool")) newSkills.tools = skills;
        else if (key.includes("language")) newSkills.languages = skills;
        else newSkills.other = [...(newSkills.other || []), ...skills];
      }
      updateSection("skills", newSkills);
      setSectionStatus("skills", "accepted");
    }

    // Apply section changes if pending
    for (const change of optimizationResult.sectionChanges || []) {
      if (sectionStatuses[change.sectionKey] === "pending" && change.suggestedData !== undefined && change.suggestedData !== null) {
        updateSection(change.sectionKey as SectionKey, change.suggestedData as ResumeData[keyof ResumeData]);
        setSectionStatus(change.sectionKey, "accepted");
      }
    }

    toast.success("All changes applied!", { duration: 3000 });
  }, [currentResume, optimizationResult, sectionStatuses, pushUndo, clearRedoStack, updateSection, setSectionStatus]);

  // Undo
  const undo = useCallback(() => {
    if (!currentResume) return;
    const previous = popUndo();
    if (!previous) {
      toast.error("Nothing to undo");
      return;
    }
    // Push current to redo
    pushRedo(currentResume.data);
    // Restore previous
    setResume({ ...currentResume, data: previous, updatedAt: new Date().toISOString() });
    toast.success("Undo successful", { duration: 2000 });
  }, [currentResume, popUndo, pushRedo, setResume]);

  // Redo
  const redo = useCallback(() => {
    if (!currentResume) return;
    const next = popRedo();
    if (!next) {
      toast.error("Nothing to redo");
      return;
    }
    // Push current to undo
    pushUndo(currentResume.data);
    setResume({ ...currentResume, data: next, updatedAt: new Date().toISOString() });
    toast.success("Redo successful", { duration: 2000 });
  }, [currentResume, popRedo, pushUndo, setResume]);

  // Restore original
  const restoreOriginal = useCallback(() => {
    if (!currentResume) return;
    const original = getOriginal();
    if (!original) {
      toast.error("No original snapshot available");
      return;
    }
    // Push current to undo so user can redo
    pushUndo(currentResume.data);
    clearRedoStack();
    setResume({ ...currentResume, data: original, updatedAt: new Date().toISOString() });
    clearOptimization();
    toast.success("Original resume restored!", { duration: 3000 });
  }, [currentResume, getOriginal, pushUndo, clearRedoStack, setResume, clearOptimization]);

  // Change role — clears result, keeps original, does NOT call AI
  const changeRole = useCallback(
    (newRole: TargetRole) => {
      selectRole(newRole);
    },
    [selectRole]
  );

  // Derived state
  const pendingCount = useMemo(
    () => Object.values(sectionStatuses).filter((s) => s === "pending").length,
    [sectionStatuses]
  );
  const acceptedCount = useMemo(
    () => Object.values(sectionStatuses).filter((s) => s === "accepted").length,
    [sectionStatuses]
  );
  const rejectedCount = useMemo(
    () => Object.values(sectionStatuses).filter((s) => s === "rejected").length,
    [sectionStatuses]
  );

  return {
    // State
    selectedRole,
    selectedRoleProfile,
    optimizationResult,
    isOptimizing,
    viewState,
    sectionStatuses,
    hasOriginalSnapshot: !!originalResumeData,
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,
    pendingCount,
    acceptedCount,
    rejectedCount,

    // Actions
    selectRole: changeRole,
    optimize,
    acceptSection,
    rejectSection,
    applyAll,
    undo,
    redo,
    restoreOriginal,
    setViewState,
  };
}
