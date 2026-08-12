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
  DEFAULT_SECTION_ORDER,
  DEFAULT_THEME,
} from "@/types/resume.types";

// --- State shape ---

interface ResumeState {
  currentResume: Resume | null;
  isDirty: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
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
  updateTemplateId: (templateId: string) => void;
  addSection: (section: SectionKey) => void;
  removeSection: (section: SectionKey) => void;
  duplicateResume: () => Resume | null;
  clearResume: () => void;
  setIsSaving: (val: boolean) => void;
  setLastSaved: (date: Date) => void;
  setIsDirty: (val: boolean) => void;
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

      // Actions
      setResume: (resume) =>
        set({ currentResume: resume, isDirty: false }),

      updateSection: (section, data) => {
        const { currentResume } = get();
        if (!currentResume) return;

        set({
          currentResume: {
            ...currentResume,
            data: {
              ...currentResume.data,
              [section]: data,
            },
            updatedAt: new Date().toISOString(),
          },
          isDirty: true,
        });
      },

      updateTheme: (themePartial) => {
        const { currentResume } = get();
        if (!currentResume) return;

        set({
          currentResume: {
            ...currentResume,
            theme: { ...currentResume.theme, ...themePartial },
            updatedAt: new Date().toISOString(),
          },
          isDirty: true,
        });
      },

      updateSectionOrder: (order) => {
        const { currentResume } = get();
        if (!currentResume) return;

        set({
          currentResume: {
            ...currentResume,
            sectionOrder: order,
            updatedAt: new Date().toISOString(),
          },
          isDirty: true,
        });
      },

      updateTitle: (title) => {
        const { currentResume } = get();
        if (!currentResume) return;

        set({
          currentResume: {
            ...currentResume,
            title,
            updatedAt: new Date().toISOString(),
          },
          isDirty: true,
        });
      },

      updateTemplateId: (templateId) => {
        const { currentResume } = get();
        if (!currentResume) return;

        set({
          currentResume: {
            ...currentResume,
            templateId,
            updatedAt: new Date().toISOString(),
          },
          isDirty: true,
        });
      },

      addSection: (section) => {
        const { currentResume } = get();
        if (!currentResume) return;
        if (currentResume.sectionOrder.includes(section)) return;

        set({
          currentResume: {
            ...currentResume,
            sectionOrder: [...currentResume.sectionOrder, section],
            updatedAt: new Date().toISOString(),
          },
          isDirty: true,
        });
      },

      removeSection: (section) => {
        const { currentResume } = get();
        if (!currentResume) return;

        set({
          currentResume: {
            ...currentResume,
            sectionOrder: currentResume.sectionOrder.filter(
              (s) => s !== section
            ),
            updatedAt: new Date().toISOString(),
          },
          isDirty: true,
        });
      },

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
