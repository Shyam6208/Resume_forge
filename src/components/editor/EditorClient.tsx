"use client";

import { useEffect } from "react";
import { useResumeStore } from "@/store/resume.store";
import { useUIStore } from "@/store/ui.store";
import { EditorToolbar } from "./EditorToolbar";
import { EditorSidebar } from "./EditorSidebar";
import { MobileSectionNav } from "./MobileSectionNav";
import { EditorPanel } from "./EditorPanel";
import { PreviewPanel } from "@/components/preview/PreviewPanel";
import { ScoreSidebar } from "@/components/score/ScoreSidebar";
import { ResumeScore } from "@/components/score/ResumeScore";
import { ATSChecker } from "@/components/ats/ATSChecker";
import dynamic from "next/dynamic";

const ThemeCustomizer = dynamic(
  () => import("@/components/customizer/ThemeCustomizer").then((m) => m.ThemeCustomizer),
  { ssr: false }
);
const SummaryLibrary = dynamic(
  () => import("@/components/smart-library/SummaryLibrary").then((m) => m.SummaryLibrary),
  { ssr: false }
);
const BulletLibrary = dynamic(
  () => import("@/components/smart-library/BulletLibrary").then((m) => m.BulletLibrary),
  { ssr: false }
);
const ProjectLibrary = dynamic(
  () => import("@/components/smart-library/ProjectLibrary").then((m) => m.ProjectLibrary),
  { ssr: false }
);

import type { Resume } from "@/types/resume.types";
import { Edit3, Eye, BarChart3, Target, Crosshair, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const RoleOptimizerPanel = dynamic(
  () => import("@/components/optimizer/RoleOptimizerPanel").then((m) => m.RoleOptimizerPanel),
  { ssr: false }
);

interface EditorClientProps {
  initialResume: Resume & { isNotFound?: boolean };
}

export function EditorClient({ initialResume }: EditorClientProps) {
  const setResume = useResumeStore((s) => s.setResume);
  const temporaryImport = useResumeStore((s) => s.temporaryImport);
  const setTemporaryImport = useResumeStore((s) => s.setTemporaryImport);
  const mobileTab = useUIStore((s) => s.mobileTab);
  const setMobileTab = useUIStore((s) => s.setMobileTab);

  const isExpiredSession = initialResume.isNotFound && (!temporaryImport || temporaryImport.id !== initialResume.id);

  useEffect(() => {
    if (isExpiredSession) return;
    
    if (temporaryImport && temporaryImport.id === initialResume.id) {
      setResume(temporaryImport);
    } else {
      setResume(initialResume);
    }
  }, [initialResume, setResume, temporaryImport, isExpiredSession]);

  if (isExpiredSession) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-950 text-slate-100 p-6 text-center space-y-6">
        <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center text-rose-500 mb-2">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl sm:text-2xl font-bold text-white">Imported resume session expired</h1>
          <p className="text-slate-400 max-w-md mx-auto text-sm">
            The temporary import session for this resume is no longer available. Please import your resume again.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 pt-4 w-full sm:w-auto">
          <Link href="/dashboard">
            <Button variant="outline" className="h-11 px-6 rounded-xl border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 w-full sm:w-auto">
              Back to Dashboard
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button className="h-11 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium w-full sm:w-auto">
              Import Resume
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-950 text-slate-100">
      {/* Sticky Toolbar */}
      <EditorToolbar />

      {/* Main Desktop & Mobile Workspace */}
      <div className="flex-1 flex overflow-hidden relative min-w-0">
        {/* DESKTOP LAYOUT (lg and above — 3-pane with sidebar) */}
        <div className="hidden lg:flex w-full h-full overflow-hidden">
          {/* Left Sidebar Nav */}
          <div className="w-48 shrink-0 h-full border-r border-slate-800">
            <EditorSidebar />
          </div>

          {/* Form Panel */}
          <div className="w-[380px] xl:w-[420px] 2xl:w-[460px] shrink-0 h-full border-r border-slate-800">
            <EditorPanel />
          </div>

          {/* Live Preview Panel */}
          <div className="flex-1 h-full min-w-0">
            <PreviewPanel />
          </div>

          {/* Right Floating / Collapsible Analytics & ATS Sidebar */}
          <div className="shrink-0 h-full">
            <ScoreSidebar />
          </div>
        </div>

        {/* TABLET LAYOUT (md to lg — 2-pane: sidebar+form, no preview) */}
        <div className="hidden md:flex lg:hidden w-full h-full overflow-hidden">
          {/* Left Sidebar Nav */}
          <div className="w-44 shrink-0 h-full border-r border-slate-800">
            <EditorSidebar />
          </div>

          {/* Form Panel — takes remaining space */}
          <div className="flex-1 h-full min-w-0">
            <EditorPanel />
          </div>
        </div>

        {/* MOBILE LAYOUT (below md) */}
        <div className="md:hidden w-full h-full flex flex-col min-w-0">
          {/* Active Tab View */}
          <div className="flex-1 overflow-y-auto pb-16 min-w-0">
            {mobileTab === "edit" && (
              <div className="h-full flex flex-col min-w-0">
                {/* Horizontal section pill nav — purpose-built for mobile */}
                <div className="bg-slate-900 border-b border-slate-800 shrink-0">
                  <MobileSectionNav />
                </div>
                <div className="flex-1 overflow-y-auto min-w-0">
                  <EditorPanel />
                </div>
              </div>
            )}

            {mobileTab === "preview" && (
              <div className="h-full min-w-0">
                <PreviewPanel />
              </div>
            )}

            {mobileTab === "score" && (
              <div className="p-4 bg-slate-900 min-h-full">
                <ResumeScore />
              </div>
            )}

            {mobileTab === "ats" && (
              <div className="p-4 bg-slate-900 min-h-full">
                <ATSChecker />
              </div>
            )}

            {mobileTab === "optimize" && (
              <div className="p-4 bg-slate-900 min-h-full">
                <RoleOptimizerPanel />
              </div>
            )}
          </div>

          {/* Bottom Mobile Tab Bar with 44px touch targets */}
          <div className="fixed bottom-0 left-0 right-0 h-14 sm:h-16 bg-slate-950/95 backdrop-blur border-t border-slate-800 flex items-center justify-around z-40 px-1 gap-0.5 pb-[env(safe-area-inset-bottom)]">
            <button
              type="button"
              onClick={() => setMobileTab("edit")}
              className={`flex-1 min-h-[44px] min-w-0 flex flex-col items-center justify-center gap-0.5 text-[10px] sm:text-[11px] rounded-lg transition-colors px-1 ${
                mobileTab === "edit" ? "text-indigo-400 font-semibold bg-indigo-500/10" : "text-slate-400 hover:text-white"
              }`}
            >
              <Edit3 className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Edit</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileTab("preview")}
              className={`flex-1 min-h-[44px] min-w-0 flex flex-col items-center justify-center gap-0.5 text-[10px] sm:text-[11px] rounded-lg transition-colors px-1 ${
                mobileTab === "preview" ? "text-indigo-400 font-semibold bg-indigo-500/10" : "text-slate-400 hover:text-white"
              }`}
            >
              <Eye className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Preview</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileTab("score")}
              className={`flex-1 min-h-[44px] min-w-0 flex flex-col items-center justify-center gap-0.5 text-[10px] sm:text-[11px] rounded-lg transition-colors px-1 ${
                mobileTab === "score" ? "text-indigo-400 font-semibold bg-indigo-500/10" : "text-slate-400 hover:text-white"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Score</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileTab("ats")}
              className={`flex-1 min-h-[44px] min-w-0 flex flex-col items-center justify-center gap-0.5 text-[10px] sm:text-[11px] rounded-lg transition-colors px-1 ${
                mobileTab === "ats" ? "text-indigo-400 font-semibold bg-indigo-500/10" : "text-slate-400 hover:text-white"
              }`}
            >
              <Target className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">ATS</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileTab("optimize")}
              className={`flex-1 min-h-[44px] min-w-0 flex flex-col items-center justify-center gap-0.5 text-[10px] sm:text-[11px] rounded-lg transition-colors px-1 ${
                mobileTab === "optimize" ? "text-indigo-400 font-semibold bg-indigo-500/10" : "text-slate-400 hover:text-white"
              }`}
            >
              <Crosshair className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="truncate">Optimize</span>
            </button>
          </div>
        </div>
      </div>

      {/* Theme & Layout Customizer Drawer */}
      <ThemeCustomizer />

      {/* Smart Content Library Drawers & Modals */}
      <SummaryLibrary />
      <BulletLibrary />
      <ProjectLibrary />
    </div>
  );
}
