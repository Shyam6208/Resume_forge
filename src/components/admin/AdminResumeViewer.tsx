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
    <div className="min-h-screen bg-[#0B0F17] flex flex-col items-center pb-16">
      {/* Top Admin Action Bar */}
      <div className="w-full bg-[#0B0F17]/90 backdrop-blur-xl border-b border-white/[0.08] px-6 py-4 flex items-center justify-between sticky top-0 z-50 print:hidden shadow-lg">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Resumes
          </button>
          <div className="h-4 w-px bg-white/[0.1]" />
          <div>
            <h1 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span>{title}</span>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-slate-300">
                {templateName}
              </span>
              {isPublic ? (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Public
                </span>
              ) : (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white/[0.05] text-slate-400 border border-white/[0.1]">
                  Private
                </span>
              )}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Created by <span className="text-slate-200 font-semibold">{ownerName}</span> ({ownerEmail}) • {new Date(updatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 hover:opacity-90 text-slate-950 text-xs font-bold transition-all shadow-md shadow-cyan-500/20 active:scale-95"
          >
            <Printer className="w-4 h-4" />
            Print / Save PDF
          </button>
        </div>
      </div>

      {/* Legacy/Unknown Template Warning */}
      {isLegacyTemplate && (
        <div className="w-full max-w-4xl mt-6 px-4 print:hidden">
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3 text-amber-300 text-sm shadow-md">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Legacy or Unavailable Template</p>
              <p className="text-xs text-amber-200/80 mt-0.5">This resume uses an unknown template ID (&ldquo;{templateId}&rdquo;). Rendering with a safe generic fallback.</p>
            </div>
          </div>
        </div>
      )}

      {/* Document Wrapper */}
      <div className="mt-8 print:mt-0 print:bg-white w-full flex justify-center px-4">
        <div className="shadow-2xl print:shadow-none bg-white rounded-lg overflow-hidden">
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
