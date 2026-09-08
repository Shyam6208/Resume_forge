// ============================================================
// ResumeForge — Resume Store (Zustand + Persist)
// ============================================================

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { generateUUID } from "@/utils/uuid";
import type {
  Resume,
  ResumeData,
  ResumeTheme,
  SectionKey,
} from "@/types/resume.types";

// --- State shape ---

interface ResumeState {
  currentResume: Resume | null;
  isDirty: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  temporaryImport: Resume | null;
}

// --- Actions ---

interface ResumeActions {
  setResume: (resume: Resume) => void;
  updateSection: <K extends keyof ResumeData>(
    section: K,
    data: ResumeData[K]
  ) => void;
  updateTheme: (theme: Partial<ResumeTheme>) => void;
  updateSectionOrder: (order: SectionKey[]) => void;
  updateTitle: (title: string) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateTemplateId: (templateId: string, templateConfig?: any | null) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateTemplateConfig: (config: any | null) => void;
  updateIsPublic: (isPublic: boolean) => void;
  updateSlug: (slug: string) => void;
  addSection: (section: SectionKey) => void;
  removeSection: (section: SectionKey) => void;
  removeSections: (sections: SectionKey[]) => void;
  duplicateResume: () => Resume | null;
  clearResume: () => void;
  setIsSaving: (val: boolean) => void;
  setLastSaved: (date: Date) => void;
  setIsDirty: (val: boolean) => void;
  setTemporaryImport: (resume: Resume | null) => void;
}

// --- Store ---

export const useResumeStore = create<ResumeState & ResumeActions>()(
  persist(
    (set, get) => ({
      // State
      currentResume: null,
      isDirty: false,
      isSaving: false,
      lastSaved: null,
      temporaryImport: null,

      // Actions
      setResume: (resume) =>
        set({ currentResume: resume, isDirty: false }),

      setTemporaryImport: (resume) =>
        set({ temporaryImport: resume }),

      updateSection: (section, data) =>
        set((state) => {
          if (!state.currentResume) return state;
          return {
            currentResume: {
              ...state.currentResume,
              data: {
                ...state.currentResume.data,
                [section]: data,
              },
              updatedAt: new Date().toISOString(),
            },
            isDirty: true,
          };
        }),

      updateTheme: (themePartial) =>
        set((state) => {
          if (!state.currentResume) return state;
          return {
            currentResume: {
              ...state.currentResume,
              theme: { ...state.currentResume.theme, ...themePartial },
              updatedAt: new Date().toISOString(),
            },
            isDirty: true,
          };
        }),

      updateSectionOrder: (order) =>
        set((state) => {
          if (!state.currentResume) return state;
          return {
            currentResume: {
              ...state.currentResume,
              sectionOrder: order,
              updatedAt: new Date().toISOString(),
            },
            isDirty: true,
          };
        }),

      updateTitle: (title) =>
        set((state) => {
          if (!state.currentResume) return state;
          return {
            currentResume: {
              ...state.currentResume,
              title,
              updatedAt: new Date().toISOString(),
            },
            isDirty: true,
          };
        }),

      updateTemplateId: (templateId, templateConfig) =>
        set((state) => {
          if (!state.currentResume) return state;
          return {
            currentResume: {
              ...state.currentResume,
              templateId,
              ...(templateConfig !== undefined ? { templateConfig } : {}),
              updatedAt: new Date().toISOString(),
            },
            isDirty: true,
          };
        }),

      updateTemplateConfig: (config) =>
        set((state) => {
          if (!state.currentResume) return state;
          return {
            currentResume: {
              ...state.currentResume,
              templateConfig: config,
              updatedAt: new Date().toISOString(),
            },
            isDirty: true,
          };
        }),

      updateIsPublic: (isPublic) =>
        set((state) => {
          if (!state.currentResume) return state;
          return {
            currentResume: {
              ...state.currentResume,
              isPublic,
              updatedAt: new Date().toISOString(),
            },
            isDirty: true,
          };
        }),

      updateSlug: (slug) =>
        set((state) => {
          if (!state.currentResume) return state;
          return {
            currentResume: {
              ...state.currentResume,
              slug,
              updatedAt: new Date().toISOString(),
            },
            isDirty: true,
          };
        }),

      addSection: (section) =>
        set((state) => {
          if (!state.currentResume) return state;
          if (state.currentResume.sectionOrder.includes(section)) return state;
          return {
            currentResume: {
              ...state.currentResume,
              sectionOrder: [...state.currentResume.sectionOrder, section],
              updatedAt: new Date().toISOString(),
            },
            isDirty: true,
          };
        }),

      removeSection: (section) =>
        set((state) => {
          if (!state.currentResume) return state;
          return {
            currentResume: {
              ...state.currentResume,
              sectionOrder: state.currentResume.sectionOrder.filter(
                (s) => s !== section
              ),
              updatedAt: new Date().toISOString(),
            },
            isDirty: true,
          };
        }),

      removeSections: (sections) =>
        set((state) => {
          if (!state.currentResume) return state;
          const toRemoveSet = new Set(sections);
          return {
            currentResume: {
              ...state.currentResume,
              sectionOrder: state.currentResume.sectionOrder.filter(
                (s) => !toRemoveSet.has(s)
              ),
              updatedAt: new Date().toISOString(),
            },
            isDirty: true,
          };
        }),

      duplicateResume: () => {
        const { currentResume } = get();
        if (!currentResume) return null;

        const newId = generateUUID();
        const duplicate: Resume = {
          ...currentResume,
          id: newId,
          slug: `${currentResume.slug}-copy-${newId.slice(0, 6)}`,
          title: `${currentResume.title} (Copy)`,
          downloadCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        return duplicate;
      },

      clearResume: () =>
        set({
          currentResume: null,
          isDirty: false,
          isSaving: false,
          lastSaved: null,
        }),

      setIsSaving: (val) => set({ isSaving: val }),
      setLastSaved: (date) => set({ lastSaved: date }),
      setIsDirty: (val) => set({ isDirty: val }),
    }),
    {
      name: "resumeforge-resume",
      partialize: (state) => ({
        currentResume: state.currentResume,
      }),
    }
  )
);
