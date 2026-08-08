"use client";

import { useState, useCallback } from "react";
import { useResumeStore } from "@/store/resume.store";
import toast from "react-hot-toast";

interface UseDOCXExportReturn {
  isExporting: boolean;
  exportDOCX: (targetResumeId?: string) => Promise<void>;
}

export function useDOCXExport(): UseDOCXExportReturn {
  const [isExporting, setIsExporting] = useState(false);
  const currentResume = useResumeStore((s) => s.currentResume);

  const exportDOCX = useCallback(
    async (targetResumeId?: string) => {
      const resumeId = targetResumeId || currentResume?.id;

      setIsExporting(true);
      const toastId = toast.loading("Generating DOCX...");

      try {
        const response = await fetch("/api/docx", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            resumeId,
            data: currentResume?.data,
            theme: currentResume?.theme,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to generate DOCX document");
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;

        const sanitizedTitle = currentResume?.title
          ? currentResume.title.toLowerCase().replace(/[^a-z0-9]/g, "_")
          : "resume";
        link.setAttribute("download", `${sanitizedTitle}.docx`);

        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        toast.success("DOCX downloaded successfully!", { id: toastId });
      } catch (err: unknown) {
        console.error("DOCX export error:", err);
        const message = err instanceof Error ? err.message : "Failed to export DOCX";
        toast.error(message, { id: toastId });
      } finally {
        setIsExporting(false);
      }
    },
    [currentResume]
  );

  return {
    isExporting,
    exportDOCX,
  };
}
