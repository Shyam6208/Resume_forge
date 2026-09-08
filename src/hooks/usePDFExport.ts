"use client";

import { useState, useCallback } from "react";
import { useResumeStore } from "@/store/resume.store";
import toast from "react-hot-toast";

interface UsePDFExportReturn {
  isExporting: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  exportPDF: (targetResumeOverride?: any) => Promise<void>;
}

export function usePDFExport(): UsePDFExportReturn {
  const [isExporting, setIsExporting] = useState(false);
  const currentResume = useResumeStore((s) => s.currentResume);
  const setResume = useResumeStore((s) => s.setResume);
  const setIsDirty = useResumeStore((s) => s.setIsDirty);
  const setLastSaved = useResumeStore((s) => s.setLastSaved);

  const exportPDF = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (targetResumeOverride?: any) => {
      const resumeToExport = targetResumeOverride || currentResume;

      if (!resumeToExport) {
        toast.error("No resume available for export");
        return;
      }

      if (resumeToExport.isTemporary) {
        toast.error("Save this resume to your dashboard before downloading.");
        return;
      }

      setIsExporting(true);
      const toastId = toast.loading("Saving resume & generating PDF...");

      try {
        // STEP 1: Auto-persist current structured resume data to Supabase (NO PDF file storage)
        let activeResumeId = resumeToExport.id;
        const { isValidUUID, generateUUID } = await import("@/utils/uuid");
        const validId = isValidUUID(activeResumeId) ? activeResumeId : generateUUID();

        const savePayload = {
          id: validId,
          title: resumeToExport.title || "My Resume",
          templateId: resumeToExport.templateId || "minimal-white",
          templateConfig: resumeToExport.templateConfig || null,
          targetJob: resumeToExport.targetJob || "",
          data: resumeToExport.data || {},
          theme: resumeToExport.theme || {},
          sectionOrder: resumeToExport.sectionOrder || [],
          isPublic: resumeToExport.isPublic ?? false,
        };

        const saveRes = await fetch("/api/resume", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(savePayload),
        });

        if (saveRes.ok) {
          const savedResult = await saveRes.json();
          if (savedResult && savedResult.id) {
            activeResumeId = savedResult.id;
            // Update editor store with persisted UUID & clear dirty flag
            if (!targetResumeOverride && currentResume) {
              setResume({
                ...currentResume,
                id: savedResult.id,
                userId: savedResult.userId || currentResume.userId,
                updatedAt: savedResult.updatedAt || new Date().toISOString(),
              });
              setIsDirty(false);
              setLastSaved(new Date());
            }
          }
        } else {
          const errData = await saveRes.json().catch(() => ({}));
          throw new Error("SAVE_FAILED: " + (errData.error || "Couldn't save your resume. Please try again."));
        }

        // STEP 2: Generate PDF dynamically in memory (0 Gemini calls, 0 PDF storage)
        const response = await fetch("/api/pdf", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            resumeId: activeResumeId,
            resumeData: resumeToExport.data,
            resumeTheme: resumeToExport.theme,
            templateId: resumeToExport.templateId,
            templateConfig: resumeToExport.templateConfig || null,
            sectionOrder: resumeToExport.sectionOrder || [],
            title: resumeToExport.title,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to generate PDF document");
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;

        const sanitizedTitle = (resumeToExport.title || "resume")
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "_");
        link.setAttribute("download", `${sanitizedTitle}.pdf`);

        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        toast.dismiss(toastId);
        toast.success("Resume saved & PDF downloaded!", { duration: 3000 });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to export PDF";
        
        // If the error was a database save failure, halt everything immediately!
        if (message.startsWith("SAVE_FAILED: ")) {
          toast.dismiss(toastId);
          toast.error(message.replace("SAVE_FAILED: ", ""), { duration: 4000 });
          setIsExporting(false);
          return;
        }

        console.warn("Server PDF export failed, attempting browser print fallback:", err);

        // Fallback: Client-side print-to-pdf window
        try {
          if (resumeToExport) {
            const printWindow = window.open("", "_blank");
            if (printWindow) {
              const { renderResumeToHtml } = await import("@/lib/render-html");
              const html = await renderResumeToHtml(
                resumeToExport.templateId,
                resumeToExport.data,
                resumeToExport.theme,
                resumeToExport.title,
                resumeToExport.templateConfig || null,
                resumeToExport.sectionOrder || []
              );
              printWindow.document.write(html);
              printWindow.document.close();

              setTimeout(() => {
                printWindow.focus();
                printWindow.print();
              }, 500);

              toast.dismiss(toastId);
              toast.success("Opened print window — Save as PDF!", { duration: 3000 });
              return;
            }
          }
        } catch (fallbackErr) {
          console.error("Client PDF fallback error:", fallbackErr);
        }

        toast.dismiss(toastId);
        toast.error(message, { duration: 4000 });
      } finally {
        setIsExporting(false);
      }
    },
    [currentResume, setResume, setIsDirty, setLastSaved]
  );

  return {
    isExporting,
    exportPDF,
  };
}
