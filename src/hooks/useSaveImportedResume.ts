"use client";

import { useState, useCallback } from "react";
import { useResumeStore } from "@/store/resume.store";
import toast from "react-hot-toast";

export function useSaveImportedResume() {
  const [isSaving, setIsSaving] = useState(false);
  const currentResume = useResumeStore((s) => s.currentResume);
  const setResume = useResumeStore((s) => s.setResume);
  const setTemporaryImport = useResumeStore((s) => s.setTemporaryImport);
  const setIsDirty = useResumeStore((s) => s.setIsDirty);
  const setLastSaved = useResumeStore((s) => s.setLastSaved);

  const saveResume = useCallback(async (): Promise<boolean> => {
    if (!currentResume || !currentResume.isTemporary) {
      return true; // Already saved or not temporary
    }

    if (isSaving) {
      return false; // Prevent duplicate saves
    }

    setIsSaving(true);
    let success = false;

    try {
      const payload = {
        id: currentResume.id,
        title: currentResume.title,
        templateId: currentResume.templateId,
        targetJob: currentResume.targetJob || "",
        data: currentResume.data,
        theme: currentResume.theme,
        sectionOrder: currentResume.sectionOrder,
        isPublic: currentResume.isPublic ?? false,
      };

      const res = await fetch("/api/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to save resume");
      }

      const savedResult = await res.json();
      
      // Update state to persistent
      const persistentResume = {
        ...currentResume,
        id: savedResult.id || currentResume.id, // Prefer server ID if returned
        isTemporary: false,
        updatedAt: savedResult.updatedAt || new Date().toISOString(),
      };

      setResume(persistentResume);
      setTemporaryImport(null);
      setIsDirty(false);
      setLastSaved(new Date());

      success = true;
    } catch (error) {
      console.error("Failed to save imported resume:", error);
      toast.error("Couldn't save your resume. Please try again.");
      success = false;
    } finally {
      setIsSaving(false);
    }

    return success;
  }, [currentResume, isSaving, setResume, setTemporaryImport, setIsDirty, setLastSaved]);

  return { saveResume, isSaving };
}
