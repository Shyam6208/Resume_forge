"use client";

import { useState, useCallback } from "react";
import { useResumeStore } from "@/store/resume.store";
import toast from "react-hot-toast";

interface UsePDFExportReturn {
  isExporting: boolean;
  exportPDF: (targetResumeId?: string) => Promise<void>;
}

export function usePDFExport(): UsePDFExportReturn {
  const [isExporting, setIsExporting] = useState(false);
  const currentResume = useResumeStore((s) => s.currentResume);

  const exportPDF = useCallback(
    async (targetResumeId?: string) => {
      const resumeId = targetResumeId || currentResume?.id;

      if (!resumeId) {
        toast.error("No resume available for export");
        return;
      }

      setIsExporting(true);
      const toastId = toast.loading("Generating PDF...");

      try {
        const response = await fetch("/api/pdf", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            resumeId,
            resumeData: currentResume?.data,
            resumeTheme: currentResume?.theme,
            templateId: currentResume?.templateId,
            title: currentResume?.title,
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

        const sanitizedTitle = currentResume?.title
          ? currentResume.title.toLowerCase().replace(/[^a-z0-9]/g, "_")
          : "resume";
        link.setAttribute("download", `${sanitizedTitle}.pdf`);

        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        toast.dismiss(toastId);
        toast.success("PDF downloaded successfully!", { duration: 3000 });
      } catch (err: unknown) {
        console.warn("Server PDF export failed, attempting browser print fallback:", err);

        // Fallback: Client-side print-to-pdf window
        try {
          if (currentResume) {
            const printWindow = window.open("", "_blank");
            if (printWindow) {
              const { renderResumeToHtml } = await import("@/lib/render-html");
              const html = await renderResumeToHtml(
                currentResume.templateId,
                currentResume.data,
                currentResume.theme,
                currentResume.title
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

        const message = err instanceof Error ? err.message : "Failed to export PDF";
        toast.dismiss(toastId);
        toast.error(message, { duration: 4000 });
      } finally {
        setIsExporting(false);
      }
    },
    [currentResume]
  );

  return {
    isExporting,
    exportPDF,
  };
}
