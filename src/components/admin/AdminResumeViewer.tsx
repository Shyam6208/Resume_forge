"use client";

import { ResumeData, ResumeTheme, SectionKey } from "@/types/resume.types";
import { PreviewRenderer } from "@/components/preview/PreviewRenderer";
import { TEMPLATES } from "@/config/templates.config";
import { ArrowLeft, Printer, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { DynamicTemplateConfig } from "@/lib/templates/template-validator";

interface AdminResumeViewerProps {
  resumeId: string;
  title: string;
  templateId: string;
  data: ResumeData;
  theme: ResumeTheme;
  isPublic: boolean;
  downloadCount: number;
  createdAt: string;
  updatedAt: string;
  targetJob?: string | null;
  ownerName: string;
  ownerEmail: string;
  templateConfig?: DynamicTemplateConfig | null;
  sectionOrder?: SectionKey[];
}

export function AdminResumeViewer({
  title,
  templateId,
  data,
  theme,
  isPublic,
  downloadCount,
  createdAt,
  updatedAt,
  targetJob,
  ownerName,
  ownerEmail,
  templateConfig,
  sectionOrder,
}: AdminResumeViewerProps) {
  const router = useRouter();

  const templateName = TEMPLATES.find((t) => t.id === templateId)?.name || templateId;
  const isLegacyTemplate = !TEMPLATES.find((t) => t.id === templateId) && !templateConfig;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center pb-12">
      {/* Top Admin Action Bar */}
      <div className="w-full bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-50 print:hidden shadow-md">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Resumes
          </button>
          <div className="h-4 w-px bg-slate-800" />
          <div>
            <h1 className="text-base font-bold text-slate-100 flex items-center gap-2">
              {title}
              <span className="text-xs font-normal px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                {templateName}
              </span>
              {isPublic ? (
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Public
                </span>
              ) : (
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                  Private
                </span>
              )}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Created by <span className="text-slate-200 font-medium">{ownerName}</span> ({ownerEmail}) • {new Date(updatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors shadow-xs"
          >
            <Printer className="w-4 h-4" />
            Print / Save PDF
          </button>
        </div>
      </div>

      {/* Legacy/Unknown Template Warning */}
      {isLegacyTemplate && (
        <div className="w-full max-w-4xl mt-6 px-4 print:hidden">
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3 text-amber-300 text-sm">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Legacy or Unavailable Template</p>
              <p className="text-xs text-amber-200/80 mt-0.5">This resume uses an unknown template ID (&ldquo;{templateId}&rdquo;). Rendering with a safe generic fallback.</p>
            </div>
          </div>
        </div>
      )}

      {/* Document Wrapper */}
      <div className="mt-8 print:mt-0 print:bg-white w-full flex justify-center">
        <div className="shadow-2xl print:shadow-none bg-white">
          <PreviewRenderer
            data={data}
            theme={theme}
            templateId={templateId}
            templateConfig={templateConfig}
            sectionOrder={sectionOrder}
          />
        </div>
      </div>
    </div>
  );
}
