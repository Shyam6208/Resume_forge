// ============================================================
// ResumeForge — UI Store (Zustand, no persist)
// ============================================================

import { create } from "zustand";
import type { SectionKey } from "@/types/resume.types";

// --- Types ---

export type LibraryType = "summary" | "bullets" | "skills" | "projects" | null;
export type MobileTab = "edit" | "preview" | "score" | "ats" | "optimize";

// --- State shape ---

interface UIState {
  activeSection: SectionKey | null;
  isPreviewMode: boolean;
  isCustomizerOpen: boolean;
  isLibraryOpen: boolean;
  libraryType: LibraryType;
  mobileTab: MobileTab;
}

// --- Actions ---

interface UIActions {
  setActiveSection: (section: SectionKey | null) => void;
  setIsPreviewMode: (val: boolean) => void;
  setIsCustomizerOpen: (val: boolean) => void;
  setIsLibraryOpen: (val: boolean) => void;
  setLibraryType: (type: LibraryType) => void;
  setMobileTab: (tab: MobileTab) => void;
  openLibrary: (type: LibraryType) => void;
  closeLibrary: () => void;
}

// --- Store ---

export const useUIStore = create<UIState & UIActions>()((set) => ({
  // State
  activeSection: null,
  isPreviewMode: false,
  isCustomizerOpen: false,
  isLibraryOpen: false,
  libraryType: null,
  mobileTab: "edit",

  // Actions
  setActiveSection: (section) => set({ activeSection: section }),
  setIsPreviewMode: (val) => set({ isPreviewMode: val }),
  setIsCustomizerOpen: (val) => set({ isCustomizerOpen: val }),
  setIsLibraryOpen: (val) => set({ isLibraryOpen: val }),
  setLibraryType: (type) => set({ libraryType: type }),
  setMobileTab: (tab) => set({ mobileTab: tab }),

  // Convenience actions
  openLibrary: (type) =>
    set({ isLibraryOpen: true, libraryType: type }),
  closeLibrary: () =>
    set({ isLibraryOpen: false, libraryType: null }),
}));
