"use client";

import { useState } from "react";
import Link from "next/link";
import { useResumeStore } from "@/store/resume.store";
import { useResumeScore } from "@/hooks/useResumeScore";
import { useATSCheck } from "@/hooks/useATSCheck";
import { useAutoSave } from "@/hooks/useAutoSave";
import { useSaveImportedResume } from "@/hooks/useSaveImportedResume";
import { TEMPLATES } from "@/config/templates.config";
import { useUIStore } from "@/store/ui.store";
import { AIChatDrawer } from "@/components/ai/AIChatDrawer";
import { CoverLetterModal } from "@/components/ai/CoverLetterModal";
import { InterviewPrepModal } from "@/components/ai/InterviewPrepModal";
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileText,
  Loader2,
  Palette,
  SlidersHorizontal,
  Sparkles,
  Target,
  Edit2,
  Bot,
  HelpCircle,
  MoreVertical,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";

import { usePDFExport } from "@/hooks/usePDFExport";
import { useDOCXExport } from "@/hooks/useDOCXExport";
import { downloadPlainTextResume } from "@/utils/text-exporter";

export function EditorToolbar() {
  const currentResume = useResumeStore((s) => s.currentResume);
  const updateTitle = useResumeStore((s) => s.updateTitle);
  const updateTemplateId = useResumeStore((s) => s.updateTemplateId);
  const setIsCustomizerOpen = useUIStore((s) => s.setIsCustomizerOpen);

  const { isSaving, lastSaved } = useAutoSave();
  const { saveResume, isSaving: isManualSaving } = useSaveImportedResume();
  const { score, level } = useResumeScore();
  const { atsResult } = useATSCheck();

  const { isExporting: isExportingPDF, exportPDF } = usePDFExport();
  const { isExporting: isExportingDOCX, exportDOCX } = useDOCXExport();

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(currentResume?.title || "My Resume");

  // AI Modal States
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isCoverLetterOpen, setIsCoverLetterOpen] = useState(false);
  const [isInterviewPrepOpen, setIsInterviewPrepOpen] = useState(false);

  const handleTitleSubmit = () => {
    if (titleInput.trim()) {
      updateTitle(titleInput.trim());
    }
    setIsEditingTitle(false);
  };

  // Score color helper
  const getScoreColorClass = () => {
    if (score >= 85) return "bg-emerald-500/20 text-emerald-400 border-emerald-500/40";
    if (score >= 70) return "bg-blue-500/20 text-blue-400 border-blue-500/40";
    if (score >= 50) return "bg-amber-500/20 text-amber-400 border-amber-500/40";
    return "bg-rose-500/20 text-rose-400 border-rose-500/40";
  };

  const handlePDFExport = async () => {
    if (currentResume?.isTemporary) {
      const toastId = toast.loading("Saving resume...");
      const success = await saveResume();
      toast.dismiss(toastId);
      if (success) {
        exportPDF();
      }
    } else {
      exportPDF();
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full h-14 bg-slate-950 border-b border-slate-800 px-2 sm:px-4 flex items-center justify-between text-slate-200 min-w-0">
      {/* Left: Home Logo + Back + Title + Save Indicator */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 flex-1">
        <Link
          href="/"
          className="flex items-center gap-1.5 group shrink-0"
          title="Go to Home Page"
        >
          <span className="p-1 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 font-bold text-xs group-hover:bg-indigo-600/30 transition-colors">
            RF
          </span>
          <span className="font-extrabold text-sm text-white tracking-tight hidden sm:inline">
            ResumeForge
          </span>
        </Link>

        <Link
          href="/dashboard"
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
          title="Back to Dashboard"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>

        {/* Resume Title */}
        <div className="flex items-center gap-1.5 min-w-0 flex-1 max-w-[140px] sm:max-w-[250px] md:max-w-[300px]">
          {isEditingTitle ? (
            <Input
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={(e) => e.key === "Enter" && handleTitleSubmit()}
              autoFocus
              className="h-7 text-xs bg-slate-900 border-slate-700 text-white w-full"
            />
          ) : (
            <button
              type="button"
              onClick={() => setIsEditingTitle(true)}
              className="group flex items-center gap-1 font-semibold text-xs text-white truncate hover:text-indigo-400 transition-colors min-w-0"
            >
              <span className="truncate">{currentResume?.title || "My Resume"}</span>
              <Edit2 className="w-3 h-3 text-slate-500 group-hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </button>
          )}
        </div>

        {/* Auto Save Status or Save Button — Desktop only */}
        {currentResume?.isTemporary ? (
          <div className="hidden md:flex items-center border-l border-slate-800 pl-3 shrink-0">
            <Button
              type="button"
              size="sm"
              disabled={isManualSaving || isExportingPDF || isExportingDOCX}
              onClick={async () => {
                const toastId = toast.loading("Saving to your dashboard...");
                const success = await saveResume();
                toast.dismiss(toastId);
                if (success) {
                  toast.success("Resume saved successfully!");
                }
              }}
              className="h-7 text-[11px] px-3 bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
            >
              {isManualSaving ? (
                <>
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save to My Resumes"
              )}
            </Button>
          </div>
        ) : (
          <div className="hidden md:flex items-center gap-1.5 text-[11px] text-slate-400 border-l border-slate-800 pl-3 shrink-0">
            {isSaving ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin text-indigo-400" />
                <span>Saving...</span>
              </>
            ) : lastSaved ? (
              <>
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Saved</span>
              </>
            ) : (
              <span>Ready</span>
            )}
          </div>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {/* Resume Score Badge — Always visible */}
        <Badge
          variant="outline"
          className={`text-[10px] sm:text-xs px-1.5 sm:px-2.5 py-0.5 border font-semibold flex items-center gap-1 sm:gap-1.5 ${getScoreColorClass()}`}
        >
          <Sparkles className="w-3 h-3 hidden sm:block" />
          <span>{score}</span>
        </Badge>

        {/* ATS Match Badge — md+ only */}
        {atsResult && (
          <Badge
            variant="outline"
            className="text-xs px-2 py-0.5 border bg-indigo-500/20 text-indigo-300 border-indigo-500/40 hidden lg:flex items-center gap-1"
          >
            <Target className="w-3 h-3" />
            <span>ATS: {atsResult.matchPercentage}%</span>
          </Badge>
        )}

        {/* === DESKTOP ACTIONS (lg+) === */}

        {/* AI Assistant Chat Trigger — md+ */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsChatOpen(true)}
          className="h-8 text-xs bg-indigo-950/50 border-indigo-500/40 text-indigo-300 hover:bg-indigo-600 hover:text-white hidden md:flex items-center gap-1"
          title="Open AI Chat Assistant"
        >
          <Bot className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden lg:inline">AI Chat</span>
        </Button>

        {/* AI Tools Dropdown — lg+ */}
        <Popover>
          <PopoverTrigger
            render={
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 text-xs bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white hidden xl:flex items-center gap-1"
              />
            }
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>AI Tools</span>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-48 p-2 bg-slate-900 border-slate-800 text-slate-200 space-y-1">
            <button
              type="button"
              onClick={() => setIsCoverLetterOpen(true)}
              className="w-full text-left p-2 rounded-lg text-xs hover:bg-slate-800 flex items-center gap-2 text-slate-200"
            >
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>Cover Letter Generator</span>
            </button>
            <button
              type="button"
              onClick={() => setIsInterviewPrepOpen(true)}
              className="w-full text-left p-2 rounded-lg text-xs hover:bg-slate-800 flex items-center gap-2 text-slate-200"
            >
              <HelpCircle className="w-4 h-4 text-emerald-400" />
              <span>Interview Prep</span>
            </button>
          </PopoverContent>
        </Popover>

        {/* Theme Customizer — md+ */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsCustomizerOpen(true)}
          className="h-8 text-xs bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white hidden md:flex items-center gap-1"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden lg:inline">Customize</span>
        </Button>

        {/* Template Switcher — md+ */}
        <Popover>
          <PopoverTrigger
            render={
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 text-xs bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white hidden md:flex items-center gap-1"
              />
            }
          >
            <Palette className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden lg:inline">Templates</span>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-[min(16rem,calc(100vw-2rem))] p-3 bg-slate-900 border-slate-800 text-slate-200 space-y-2">
            <h4 className="text-xs font-bold text-white border-b border-slate-800 pb-1.5">
              Select Resume Template
            </h4>
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => updateTemplateId(tmpl.id)}
                  className={`w-full text-left p-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                    currentResume?.templateId === tmpl.id
                      ? "bg-indigo-600 text-white font-medium"
                      : "hover:bg-slate-800 text-slate-300"
                  }`}
                >
                  <span>{tmpl.name}</span>
                  <span className="text-[10px] opacity-70">ATS {tmpl.atsRating}%</span>
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Export Plain Text (TXT) — xl+ */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            if (currentResume?.data) {
              downloadPlainTextResume(
                currentResume.data,
                currentResume.title || "Resume",
                currentResume.sectionOrder
              );
              toast.success("Plain text resume downloaded!");
            }
          }}
          className="h-8 text-xs bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white hidden xl:flex items-center gap-1.5"
          title="Download clean plain-text / ASCII version for job portals"
        >
          <FileText className="w-3.5 h-3.5 text-cyan-400" />
          <span>TXT</span>
        </Button>

        {/* Export DOCX — lg+ */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isExportingDOCX || isManualSaving}
          onClick={() => exportDOCX()}
          className="h-8 text-xs bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white hidden lg:flex items-center gap-1.5"
        >
          {isExportingDOCX ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
          ) : (
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
          )}
          <span>{isExportingDOCX ? "DOCX..." : "DOCX"}</span>
        </Button>

        {/* === MOBILE/TABLET OVERFLOW MENU (below md) === */}
        <Popover>
          <PopoverTrigger
            render={
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white md:hidden flex items-center justify-center"
              />
            }
          >
            <MoreVertical className="w-4 h-4" />
          </PopoverTrigger>
          <PopoverContent align="end" className="w-[min(220px,calc(100vw-2rem))] p-2 bg-slate-900 border-slate-800 text-slate-200 space-y-1">
            {/* Save status on mobile */}
            {currentResume?.isTemporary ? (
              <button
                type="button"
                onClick={async () => {
                  const toastId = toast.loading("Saving to your dashboard...");
                  const success = await saveResume();
                  toast.dismiss(toastId);
                  if (success) toast.success("Resume saved successfully!");
                }}
                disabled={isManualSaving}
                className="w-full text-left p-2 rounded-lg text-xs hover:bg-slate-800 flex items-center gap-2 text-slate-200"
              >
                <Save className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{isManualSaving ? "Saving..." : "Save to My Resumes"}</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 p-2 text-xs text-slate-400">
                {isSaving ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin text-indigo-400" />
                    <span>Saving...</span>
                  </>
                ) : lastSaved ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>Auto-saved</span>
                  </>
                ) : (
                  <span>Ready</span>
                )}
              </div>
            )}

            <div className="h-px bg-slate-800 my-1" />

            <button
              type="button"
              onClick={() => setIsChatOpen(true)}
              className="w-full text-left p-2 rounded-lg text-xs hover:bg-slate-800 flex items-center gap-2 text-slate-200"
            >
              <Bot className="w-4 h-4 text-amber-400 shrink-0" />
              <span>AI Chat</span>
            </button>
            <button
              type="button"
              onClick={() => setIsCoverLetterOpen(true)}
              className="w-full text-left p-2 rounded-lg text-xs hover:bg-slate-800 flex items-center gap-2 text-slate-200"
            >
              <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Cover Letter Generator</span>
            </button>
            <button
              type="button"
              onClick={() => setIsInterviewPrepOpen(true)}
              className="w-full text-left p-2 rounded-lg text-xs hover:bg-slate-800 flex items-center gap-2 text-slate-200"
            >
              <HelpCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Interview Prep</span>
            </button>

            <div className="h-px bg-slate-800 my-1" />

            <button
              type="button"
              onClick={() => setIsCustomizerOpen(true)}
              className="w-full text-left p-2 rounded-lg text-xs hover:bg-slate-800 flex items-center gap-2 text-slate-200"
            >
              <SlidersHorizontal className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Customize Theme</span>
            </button>

            <div className="h-px bg-slate-800 my-1" />

            <button
              type="button"
              onClick={() => {
                if (currentResume?.data) {
                  downloadPlainTextResume(
                    currentResume.data,
                    currentResume.title || "Resume",
                    currentResume.sectionOrder
                  );
                  toast.success("Plain text resume downloaded!");
                }
              }}
              className="w-full text-left p-2 rounded-lg text-xs hover:bg-slate-800 flex items-center gap-2 text-slate-200"
            >
              <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Download Plain Text (.txt)</span>
            </button>

            <button
              type="button"
              disabled={isExportingDOCX || isManualSaving}
              onClick={() => exportDOCX()}
              className="w-full text-left p-2 rounded-lg text-xs hover:bg-slate-800 flex items-center gap-2 text-slate-200 disabled:opacity-50"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{isExportingDOCX ? "Exporting DOCX..." : "Download DOCX"}</span>
            </button>
          </PopoverContent>
        </Popover>

        {/* Export PDF (Primary) — Always visible */}
        <Button
          type="button"
          size="sm"
          disabled={isExportingPDF || isManualSaving}
          onClick={handlePDFExport}
          className="h-8 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-sm flex items-center gap-1 sm:gap-1.5"
        >
          {isExportingPDF || (isManualSaving && currentResume?.isTemporary) ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
          ) : (
            <Download className="w-3.5 h-3.5" />
          )}
          <span className="hidden sm:inline">
            {currentResume?.isTemporary
              ? "Save & PDF"
              : isExportingPDF
              ? "PDF..."
              : "PDF"}
          </span>
          <span className="sm:hidden">
            {isExportingPDF ? "..." : "PDF"}
          </span>
        </Button>
      </div>

      {/* AI Modals */}
      <AIChatDrawer isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      <CoverLetterModal isOpen={isCoverLetterOpen} onClose={() => setIsCoverLetterOpen(false)} />
      <InterviewPrepModal isOpen={isInterviewPrepOpen} onClose={() => setIsInterviewPrepOpen(false)} />
    </header>
  );
}
