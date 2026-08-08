// ============================================================
// ResumeForge — Auto-Save Hook (3s debounce)
// ============================================================

"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useResumeStore } from "@/store/resume.store";
import toast from "react-hot-toast";

export function useAutoSave() {
  const currentResume = useResumeStore((s) => s.currentResume);
  const isDirty = useResumeStore((s) => s.isDirty);
  const isSaving = useResumeStore((s) => s.isSaving);
  const lastSaved = useResumeStore((s) => s.lastSaved);
  const setIsSaving = useResumeStore((s) => s.setIsSaving);
  const setLastSaved = useResumeStore((s) => s.setLastSaved);
  const setIsDirty = useResumeStore((s) => s.setIsDirty);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [localLastSaved, setLocalLastSaved] = useState<Date | null>(lastSaved);

  // --- Core save function ---
  const saveNow = useCallback(async () => {
    if (!currentResume || !isDirty) return;

    setIsSaving(true);

    try {
      const response = await fetch(`/api/resume/${currentResume.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: currentResume.title,
          template_id: currentResume.templateId,
          data: currentResume.data,
          theme: currentResume.theme,
          section_order: currentResume.sectionOrder,
          is_public: currentResume.isPublic,
          target_job: currentResume.targetJob,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Failed to save resume (HTTP ${response.status})`
        );
      }

      const now = new Date();
      setLastSaved(now);
      setLocalLastSaved(now);
      setIsDirty(false);
    } catch (err: unknown) {
      console.error("AutoSave API Error:", err);
      const message = err instanceof Error ? err.message : "Failed to save resume";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  }, [currentResume, isDirty, setIsSaving, setLastSaved, setIsDirty]);

  // --- Auto-save: 3 second debounce when isDirty ---
  useEffect(() => {
    if (!isDirty || !currentResume) return;

    timerRef.current = setTimeout(() => {
      saveNow();
    }, 3000);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isDirty, currentResume, saveNow]);

  // --- Save on beforeunload ---
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty && currentResume) {
        // Fire-and-forget save attempt using sendBeacon
        const payload = JSON.stringify({
          title: currentResume.title,
          template_id: currentResume.templateId,
          data: currentResume.data,
          theme: currentResume.theme,
          section_order: currentResume.sectionOrder,
          is_public: currentResume.isPublic,
          target_job: currentResume.targetJob,
        });

        navigator.sendBeacon(
          `/api/resume/${currentResume.id}`,
          new Blob([payload], { type: "application/json" })
        );

        e.preventDefault();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty, currentResume]);

  return {
    isSaving,
    lastSaved: localLastSaved,
    saveNow,
  };
}
