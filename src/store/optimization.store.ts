// ============================================================
// ResumeForge — Optimization Store (Zustand + Persist)
// ============================================================

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ResumeData } from "@/types/resume.types";
import type { TargetRole } from "@/config/target-roles.config";
import type { RoleOptimizationResult } from "@/lib/ai/types";

// --- View State ---

export type OptimizationViewState =
  | "idle"
  | "profile"
  | "optimizing"
  | "results"
  | "review";

// --- Section Status ---

export type SectionStatus = "pending" | "accepted" | "rejected";

// --- State Shape ---

interface OptimizationState {
  selectedRole: TargetRole | null;
  optimizationResult: RoleOptimizationResult | null;
  isOptimizing: boolean;
  originalResumeData: ResumeData | null;
  sectionStatuses: Record<string, SectionStatus>;
  undoStack: ResumeData[];
  redoStack: ResumeData[];
  cache: Record<string, RoleOptimizationResult>;
  viewState: OptimizationViewState;
}

// --- Actions ---

interface OptimizationActions {
  selectRole: (role: TargetRole) => void;
  setOptimizationResult: (result: RoleOptimizationResult) => void;
  setIsOptimizing: (val: boolean) => void;
  setViewState: (state: OptimizationViewState) => void;
  snapshotOriginal: (data: ResumeData) => void;
  setSectionStatus: (key: string, status: SectionStatus) => void;
  pushUndo: (data: ResumeData) => void;
  popUndo: () => ResumeData | null;
  pushRedo: (data: ResumeData) => void;
  popRedo: () => ResumeData | null;
  clearRedoStack: () => void;
  getOriginal: () => ResumeData | null;
  getCached: (key: string) => RoleOptimizationResult | null;
  setCache: (key: string, result: RoleOptimizationResult) => void;
  clearOptimization: () => void;
  resetAll: () => void;
}

// --- Store ---

export const useOptimizationStore = create<OptimizationState & OptimizationActions>()(
  persist(
    (set, get) => ({
      // State
      selectedRole: null,
      optimizationResult: null,
      isOptimizing: false,
      originalResumeData: null,
      sectionStatuses: {},
      undoStack: [],
      redoStack: [],
      cache: {},
      viewState: "idle",

      // Actions
      selectRole: (role) =>
        set({
          selectedRole: role,
          optimizationResult: null,
          sectionStatuses: {},
          viewState: "profile",
          // Keep originalResumeData — do NOT clear it
          // Keep cache — user may switch back
        }),

      setOptimizationResult: (result) => {
        const statuses: Record<string, SectionStatus> = {};
        // Mark summary as pending if there's a suggested change
        if (result.summary?.suggested && result.summary.suggested !== result.summary.current) {
          statuses["summary"] = "pending";
        }
        // Mark skill reordering as pending
        if (result.skills?.reordered && Object.keys(result.skills.reordered).length > 0) {
          statuses["skills"] = "pending";
        }
        // Mark section changes as pending
        if (result.sectionChanges) {
          for (const change of result.sectionChanges) {
            statuses[change.sectionKey] = "pending";
          }
        }
        set({
          optimizationResult: result,
          sectionStatuses: statuses,
          viewState: "results",
        });
      },

      setIsOptimizing: (val) => set({ isOptimizing: val }),

      setViewState: (state) => set({ viewState: state }),

      snapshotOriginal: (data) => {
        const { originalResumeData } = get();
        // Only snapshot if not already set — immutable
        if (!originalResumeData) {
          set({ originalResumeData: JSON.parse(JSON.stringify(data)) as ResumeData });
        }
      },

      setSectionStatus: (key, status) => {
        const { sectionStatuses } = get();
        set({
          sectionStatuses: { ...sectionStatuses, [key]: status },
        });
      },

      pushUndo: (data) => {
        const { undoStack } = get();
        // Deep clone to prevent mutation
        const snapshot = JSON.parse(JSON.stringify(data)) as ResumeData;
        set({ undoStack: [...undoStack, snapshot] });
      },

      popUndo: () => {
        const { undoStack } = get();
        if (undoStack.length === 0) return null;
        const last = undoStack[undoStack.length - 1];
        set({ undoStack: undoStack.slice(0, -1) });
        return last;
      },

      pushRedo: (data) => {
        const { redoStack } = get();
        const snapshot = JSON.parse(JSON.stringify(data)) as ResumeData;
        set({ redoStack: [...redoStack, snapshot] });
      },

      popRedo: () => {
        const { redoStack } = get();
        if (redoStack.length === 0) return null;
        const last = redoStack[redoStack.length - 1];
        set({ redoStack: redoStack.slice(0, -1) });
        return last;
      },

      clearRedoStack: () => set({ redoStack: [] }),

      getOriginal: () => {
        const { originalResumeData } = get();
        return originalResumeData
          ? (JSON.parse(JSON.stringify(originalResumeData)) as ResumeData)
          : null;
      },

      getCached: (key) => {
        const { cache } = get();
        return cache[key] || null;
      },

      setCache: (key, result) => {
        const { cache } = get();
        set({ cache: { ...cache, [key]: result } });
      },

      clearOptimization: () =>
        set({
          optimizationResult: null,
          sectionStatuses: {},
          viewState: "idle",
          undoStack: [],
          redoStack: [],
        }),

      resetAll: () =>
        set({
          selectedRole: null,
          optimizationResult: null,
          isOptimizing: false,
          originalResumeData: null,
          sectionStatuses: {},
          undoStack: [],
          redoStack: [],
          cache: {},
          viewState: "idle",
        }),
    }),
    {
      name: "resumeforge-optimization",
      partialize: (state) => ({
        selectedRole: state.selectedRole,
        originalResumeData: state.originalResumeData,
        cache: state.cache,
      }),
    }
  )
);
