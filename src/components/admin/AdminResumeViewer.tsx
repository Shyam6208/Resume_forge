"use client";

import { ResumeData, ResumeTheme } from "@/types/resume.types";
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
  templateConfig
}: AdminResumeViewerProps) {
  const router = useRouter();

  const templateName = TEMPLATES.find((t) => t.id === templateId)?.name || templateId;
  const isLegacyTemplate = !TEMPLATES.find((t) => t.id === templateId) && !templateConfig;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center pb-12">
      {/* Admin Context Bar (Hidden on print) */}
      <div className="w-full bg-slate-900 border-b border-slate-800 print:hidden sticky top-0 z-50">
        <div className="max-w-[210mm] mx-auto px-4 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/admin/resumes")}
              className="p-2 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-colors"
              title="Back to Resumes"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-white truncate max-w-[200px]">{title}</h1>
                <span className="px-2 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/20 text-[10px] font-bold text-rose-400 flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3" />
                  READ ONLY
                </span>
                {isPublic && (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400">
                    Public
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-2 mt-1">
                <span className="truncate max-w-[150px]">{ownerName} ({ownerEmail})</span>
                <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                <span>{templateName}</span>
                {targetJob && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                    <span className="truncate max-w-[120px]">{targetJob}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-xs">
            <div className="flex flex-col items-end">
              <span className="text-slate-500">Downloads: <span className="text-slate-300 font-bold">{downloadCount}</span></span>
              <span className="text-slate-500">Updated: <span className="text-slate-300">{new Date(updatedAt).toLocaleDateString()}</span></span>
            </div>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
          </div>
        </div>
      </div>

      {isLegacyTemplate && (
        <div className="max-w-[210mm] w-full mt-6 mb-2 px-4 print:hidden">
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-200 text-sm flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-bold">Legacy or Unavailable Template</p>
              <p className="text-xs text-amber-200/80 mt-0.5">This resume uses an unknown template ID ("{templateId}"). Rendering with a safe generic fallback.</p>
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
          />
        </div>
      </div>
    </div>
  );
}
