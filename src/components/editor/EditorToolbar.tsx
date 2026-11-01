"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useResumeStore } from "@/store/resume.store";
import { useResumeScore } from "@/hooks/useResumeScore";
import { useATSCheck } from "@/hooks/useATSCheck";
import { useAutoSave } from "@/hooks/useAutoSave";
import { useSaveImportedResume } from "@/hooks/useSaveImportedResume";
import { TEMPLATES, TemplateConfig } from "@/config/templates.config";
import { useUIStore } from "@/store/ui.store";
import { AIChatDrawer } from "@/components/ai/AIChatDrawer";
import { CoverLetterModal } from "@/components/ai/CoverLetterModal";
import { InterviewPrepModal } from "@/components/ai/InterviewPrepModal";
import { AutoTailorModal } from "@/components/ai/AutoTailorModal";
import { SharePortfolioModal } from "@/components/ai/SharePortfolioModal";
import { OutreachModal } from "@/components/ai/OutreachModal";
import { SalaryRoadmapModal } from "@/components/ai/SalaryRoadmapModal";
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
  Zap,
  Globe,
  Send,
  TrendingUp,
  Printer,
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
  const { score } = useResumeScore();
  const { atsResult } = useATSCheck();

  const { isExporting: isExportingPDF, exportPDF } = usePDFExport();
  const { isExporting: isExportingDOCX, exportDOCX } = useDOCXExport();

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(currentResume?.title || "My Resume");
  const [allTemplates, setAllTemplates] = useState<TemplateConfig[]>(TEMPLATES);

  useEffect(() => {
    fetch("/api/templates")
      .then((res) => res.json())
      .then((data) => {
        if (data.templates && Array.isArray(data.templates)) {
          setAllTemplates(data.templates);
        }
      })
      .catch(() => {});
  }, []);

  // AI Modal States
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isCoverLetterOpen, setIsCoverLetterOpen] = useState(false);
  const [isInterviewPrepOpen, setIsInterviewPrepOpen] = useState(false);
  const [isAutoTailorOpen, setIsAutoTailorOpen] = useState(false);
  const [isSharePortfolioOpen, setIsSharePortfolioOpen] = useState(false);
  const [isOutreachOpen, setIsOutreachOpen] = useState(false);
  const [isSalaryRoadmapOpen, setIsSalaryRoadmapOpen] = useState(false);

  const handleTitleSubmit = () => {
    if (titleInput.trim()) {
      updateTitle(titleInput.trim());
    }
    setIsEditingTitle(false);
  };

  // Score color helper
  const getScoreColorClass = () => {
    if (score >= 85) return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
    if (score >= 70) return "bg-cyan-500/10 text-cyan-400 border-cyan-500/30";
    if (score >= 50) return "bg-amber-500/10 text-amber-400 border-amber-500/30";
    return "bg-rose-500/10 text-rose-400 border-rose-500/30";
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
    <header className="sticky top-0 z-40 w-full h-14 bg-[#0B0F17]/95 backdrop-blur-xl border-b border-white/[0.08] px-2 sm:px-4 flex items-center justify-between text-slate-200 min-w-0 shadow-lg">
      {/* Left: Home Logo + Back + Title + Save Indicator */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 flex-1">
        <Link
          href="/"
          className="flex items-center gap-1.5 group shrink-0"
          title="Go to Home Page"
        >
          <span className="p-1 rounded-lg bg-gradient-to-tr from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30 text-cyan-400 font-extrabold text-xs group-hover:bg-cyan-500/30 transition-colors shadow-xs">
            RF
          </span>
          <span className="font-bold text-sm text-white tracking-tight hidden sm:inline">
            ResumeForge
          </span>
        </Link>

        <Link
          href="/dashboard"
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors shrink-0"
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
              className="h-7 text-xs bg-slate-900/90 border-cyan-500/40 text-white w-full focus-visible:ring-cyan-500"
            />
          ) : (
            <button
              type="button"
              onClick={() => setIsEditingTitle(true)}
              className="group flex items-center gap-1 font-semibold text-xs text-white truncate hover:text-cyan-400 transition-colors min-w-0"
            >
              <span className="truncate">{currentResume?.title || "My Resume"}</span>
              <Edit2 className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </button>
          )}
        </div>

        {/* Auto Save Status or Save Button — Desktop only */}
        {currentResume?.isTemporary ? (
          <div className="hidden md:flex items-center border-l border-white/[0.08] pl-3 shrink-0">
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
              className="h-7 text-[11px] px-3 bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 font-bold hover:opacity-90 transition-all rounded-lg shadow-sm"
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
          <div className="hidden md:flex items-center gap-1.5 text-[11px] text-slate-400 border-l border-white/[0.08] pl-3 shrink-0">
            {isSaving ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin text-cyan-400" />
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
          className={`text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 border font-bold flex items-center gap-1 sm:gap-1.5 rounded-full ${getScoreColorClass()}`}
        >
          <Sparkles className="w-3 h-3 hidden sm:block" />
          <span>{score}</span>
        </Badge>

        {/* ATS Match Badge — md+ only */}
        {atsResult && (
          <Badge
            variant="outline"
            className="text-xs px-2.5 py-0.5 border bg-cyan-500/10 text-cyan-300 border-cyan-500/30 hidden lg:flex items-center gap-1 rounded-full font-semibold"
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
          className="h-8 text-xs bg-cyan-500/10 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 hover:text-white hidden md:flex items-center gap-1.5 rounded-xl transition-all"
          title="Open AI Chat Assistant"
        >
          <Bot className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden lg:inline font-semibold">AI Chat</span>
        </Button>

        {/* AI Tools Dropdown — lg+ */}
        <Popover>
          <PopoverTrigger
            render={
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 text-xs bg-white/[0.05] border-white/[0.08] text-slate-200 hover:bg-white/[0.1] hover:text-white hidden xl:flex items-center gap-1.5 rounded-xl transition-all"
              />
            }
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold">AI Tools</span>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-52 p-2 bg-[#0B0F17]/95 border-white/[0.08] backdrop-blur-2xl text-slate-200 space-y-1 rounded-2xl shadow-2xl">
            <button
              type="button"
              onClick={() => setIsCoverLetterOpen(true)}
              className="w-full text-left p-2 rounded-xl text-xs hover:bg-white/[0.06] flex items-center gap-2 text-slate-200 transition-colors"
            >
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>Cover Letter Generator</span>
            </button>
            <button
              type="button"
              onClick={() => setIsInterviewPrepOpen(true)}
              className="w-full text-left p-2 rounded-xl text-xs hover:bg-white/[0.06] flex items-center gap-2 text-slate-200 transition-colors"
            >
              <HelpCircle className="w-4 h-4 text-emerald-400" />
              <span>Interview Prep</span>
            </button>
            <div className="h-px bg-white/[0.06] my-1" />
            <button
              type="button"
              onClick={() => setIsAutoTailorOpen(true)}
              className="w-full text-left p-2 rounded-xl text-xs hover:bg-white/[0.06] flex items-center gap-2 text-slate-200 transition-colors"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Auto-Tailor (JD)</span>
            </button>
            <button
              type="button"
              onClick={() => setIsOutreachOpen(true)}
              className="w-full text-left p-2 rounded-xl text-xs hover:bg-white/[0.06] flex items-center gap-2 text-slate-200 transition-colors"
            >
              <Send className="w-4 h-4 text-cyan-400" />
              <span>Recruiter Outreach</span>
            </button>
            <button
              type="button"
              onClick={() => setIsSalaryRoadmapOpen(true)}
              className="w-full text-left p-2 rounded-xl text-xs hover:bg-white/[0.06] flex items-center gap-2 text-slate-200 transition-colors"
            >
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Salary & Roadmap</span>
            </button>
            <button
              type="button"
              onClick={() => setIsSharePortfolioOpen(true)}
              className="w-full text-left p-2 rounded-xl text-xs hover:bg-white/[0.06] flex items-center gap-2 text-slate-200 transition-colors"
            >
              <Globe className="w-4 h-4 text-teal-400" />
              <span>Share Portfolio</span>
            </button>
          </PopoverContent>
        </Popover>

        {/* Theme Customizer — md+ */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsCustomizerOpen(true)}
          className="h-8 text-xs bg-white/[0.05] border-white/[0.08] text-slate-200 hover:bg-white/[0.1] hover:text-white hidden md:flex items-center gap-1.5 rounded-xl transition-all"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden lg:inline font-semibold">Customize</span>
        </Button>

        {/* Template Switcher — md+ */}
        <Popover>
          <PopoverTrigger
            render={
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 text-xs bg-white/[0.05] border-white/[0.08] text-slate-200 hover:bg-white/[0.1] hover:text-white hidden md:flex items-center gap-1.5 rounded-xl transition-all"
              />
            }
          >
            <Palette className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden lg:inline font-semibold">Templates</span>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-[min(16rem,calc(100vw-2rem))] p-3 bg-[#0B0F17]/95 border-white/[0.08] backdrop-blur-2xl text-slate-200 space-y-2 rounded-2xl shadow-2xl">
            <h4 className="text-xs font-bold text-white border-b border-white/[0.08] pb-1.5">
              Select Resume Template
            </h4>
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {allTemplates.map((tmpl) => (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => updateTemplateId(tmpl.id, tmpl.templateConfig || null)}
                  className={`w-full text-left p-2 rounded-xl text-xs flex items-center justify-between transition-all ${
                    currentResume?.templateId === tmpl.id
                      ? "bg-gradient-to-r from-cyan-500 to-emerald-400 text-slate-950 font-bold shadow-sm"
                      : "hover:bg-white/[0.06] text-slate-300"
                  }`}
                >
                  <span>{tmpl.name}</span>
                  <span className="text-[10px] opacity-75">ATS {tmpl.atsRating}%</span>
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
          className="h-8 text-xs bg-white/[0.05] border-white/[0.08] text-slate-200 hover:bg-white/[0.1] hover:text-white hidden xl:flex items-center gap-1.5 rounded-xl transition-all"
          title="Download clean plain-text / ASCII version for job portals"
        >
          <FileText className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-semibold">TXT</span>
        </Button>

        {/* Export DOCX — lg+ */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isExportingDOCX || isManualSaving}
          onClick={() => exportDOCX()}
          className="h-8 text-xs bg-white/[0.05] border-white/[0.08] text-slate-200 hover:bg-white/[0.1] hover:text-white hidden lg:flex items-center gap-1.5 rounded-xl transition-all"
        >
          {isExportingDOCX ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
          ) : (
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
          )}
          <span className="font-semibold">{isExportingDOCX ? "DOCX..." : "DOCX"}</span>
        </Button>

        {/* === MOBILE/TABLET OVERFLOW MENU (below md) === */}
        <Popover>
          <PopoverTrigger
            render={
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 bg-white/[0.05] border-white/[0.08] text-slate-200 hover:bg-white/[0.1] hover:text-white md:hidden flex items-center justify-center rounded-xl"
              />
            }
          >
            <MoreVertical className="w-4 h-4" />
          </PopoverTrigger>
          <PopoverContent align="end" className="w-[min(220px,calc(100vw-2rem))] p-2 bg-[#0B0F17]/95 border-white/[0.08] backdrop-blur-2xl text-slate-200 space-y-1 rounded-2xl shadow-2xl">
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
                className="w-full text-left p-2 rounded-xl text-xs hover:bg-white/[0.06] flex items-center gap-2 text-slate-200"
              >
                <Save className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{isManualSaving ? "Saving..." : "Save to My Resumes"}</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 p-2 text-xs text-slate-400">
                {isSaving ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin text-cyan-400" />
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

            <div className="h-px bg-white/[0.06] my-1" />

            <button
              type="button"
              onClick={() => setIsChatOpen(true)}
              className="w-full text-left p-2 rounded-xl text-xs hover:bg-white/[0.06] flex items-center gap-2 text-slate-200"
            >
              <Bot className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>AI Chat</span>
            </button>
            <button
              type="button"
              onClick={() => setIsCoverLetterOpen(true)}
              className="w-full text-left p-2 rounded-xl text-xs hover:bg-white/[0.06] flex items-center gap-2 text-slate-200"
            >
              <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Cover Letter Generator</span>
            </button>
            <button
              type="button"
              onClick={() => setIsInterviewPrepOpen(true)}
              className="w-full text-left p-2 rounded-xl text-xs hover:bg-white/[0.06] flex items-center gap-2 text-slate-200"
            >
              <HelpCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Interview Prep</span>
            </button>
            <button
              type="button"
              onClick={() => setIsAutoTailorOpen(true)}
              className="w-full text-left p-2 rounded-xl text-xs hover:bg-white/[0.06] flex items-center gap-2 text-slate-200"
            >
              <Zap className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Auto-Tailor (JD)</span>
            </button>
            <button
              type="button"
              onClick={() => setIsOutreachOpen(true)}
              className="w-full text-left p-2 rounded-xl text-xs hover:bg-white/[0.06] flex items-center gap-2 text-slate-200"
            >
              <Send className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Recruiter Outreach</span>
            </button>
            <button
              type="button"
              onClick={() => setIsSalaryRoadmapOpen(true)}
              className="w-full text-left p-2 rounded-xl text-xs hover:bg-white/[0.06] flex items-center gap-2 text-slate-200"
            >
              <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Salary & Roadmap</span>
            </button>
            <button
              type="button"
              onClick={() => setIsSharePortfolioOpen(true)}
              className="w-full text-left p-2 rounded-xl text-xs hover:bg-white/[0.06] flex items-center gap-2 text-slate-200"
            >
              <Globe className="w-4 h-4 text-teal-400 shrink-0" />
              <span>Share Portfolio</span>
            </button>

            <div className="h-px bg-white/[0.06] my-1" />

            <button
              type="button"
              onClick={() => setIsCustomizerOpen(true)}
              className="w-full text-left p-2 rounded-xl text-xs hover:bg-white/[0.06] flex items-center gap-2 text-slate-200"
            >
              <SlidersHorizontal className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Customize Theme</span>
            </button>

            <div className="h-px bg-white/[0.06] my-1" />

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
              className="w-full text-left p-2 rounded-xl text-xs hover:bg-white/[0.06] flex items-center gap-2 text-slate-200"
            >
              <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Download Plain Text (.txt)</span>
            </button>

            <button
              type="button"
              disabled={isExportingDOCX || isManualSaving}
              onClick={() => exportDOCX()}
              className="w-full text-left p-2 rounded-xl text-xs hover:bg-white/[0.06] flex items-center gap-2 text-slate-200 disabled:opacity-50"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{isExportingDOCX ? "Exporting DOCX..." : "Download DOCX"}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                toast("Opening instant PDF / Print dialog...", { icon: "🖨️", duration: 1500 });
                setTimeout(() => window.print(), 150);
              }}
              className="w-full text-left p-2 rounded-xl text-xs hover:bg-white/[0.06] flex items-center gap-2 text-slate-200"
            >
              <Printer className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Quick Print / Instant PDF</span>
            </button>
          </PopoverContent>
        </Popover>

        {/* Export PDF (Primary) — Always visible */}
        <Button
          type="button"
          size="sm"
          disabled={isExportingPDF || isManualSaving}
          onClick={handlePDFExport}
          className="h-8 text-xs bg-gradient-to-r from-cyan-400 to-emerald-400 hover:opacity-90 text-slate-950 font-bold rounded-xl shadow-md shadow-cyan-500/20 flex items-center gap-1 sm:gap-1.5 transition-all active:scale-95"
        >
          {isExportingPDF || (isManualSaving && currentResume?.isTemporary) ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-950" />
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
      <AutoTailorModal isOpen={isAutoTailorOpen} onClose={() => setIsAutoTailorOpen(false)} />
      <SharePortfolioModal isOpen={isSharePortfolioOpen} onClose={() => setIsSharePortfolioOpen(false)} />
      <OutreachModal isOpen={isOutreachOpen} onClose={() => setIsOutreachOpen(false)} />
      <SalaryRoadmapModal isOpen={isSalaryRoadmapOpen} onClose={() => setIsSalaryRoadmapOpen(false)} />
    </header>
  );
}
