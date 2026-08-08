"use client";

import { useEffect } from "react";
import { useResumeStore } from "@/store/resume.store";
import { useUIStore } from "@/store/ui.store";
import { EditorToolbar } from "./EditorToolbar";
import { EditorSidebar } from "./EditorSidebar";
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
import { Edit3, Eye, BarChart3, Target } from "lucide-react";

interface EditorClientProps {
  initialResume: Resume;
}

export function EditorClient({ initialResume }: EditorClientProps) {
  const setResume = useResumeStore((s) => s.setResume);
  const mobileTab = useUIStore((s) => s.mobileTab);
  const setMobileTab = useUIStore((s) => s.setMobileTab);

  useEffect(() => {
    setResume(initialResume);
  }, [initialResume, setResume]);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-950 text-slate-100">
      {/* Sticky Toolbar */}
      <EditorToolbar />

      {/* Main Desktop & Mobile Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* DESKTOP LAYOUT (md and above) */}
        <div className="hidden md:flex w-full h-full overflow-hidden">
          {/* Left Sidebar Nav */}
          <div className="w-48 shrink-0 h-full border-r border-slate-800">
            <EditorSidebar />
          </div>

          {/* Form Panel */}
          <div className="w-96 lg:w-[420px] xl:w-[460px] shrink-0 h-full border-r border-slate-800">
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

        {/* MOBILE LAYOUT (below md) */}
        <div className="md:hidden w-full h-full flex flex-col">
          {/* Active Tab View */}
          <div className="flex-1 overflow-y-auto pb-16">
            {mobileTab === "edit" && (
              <div className="h-full flex flex-col">
                <div className="h-12 bg-slate-900 border-b border-slate-800 px-2 flex items-center overflow-x-auto shrink-0 space-x-1.5 scrollbar-none">
                  <EditorSidebar />
                </div>
                <div className="flex-1 overflow-y-auto">
                  <EditorPanel />
                </div>
              </div>
            )}

            {mobileTab === "preview" && (
              <div className="h-full">
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
          </div>

          {/* Bottom Mobile Tab Bar with 44px touch targets */}
          <div className="fixed bottom-0 left-0 right-0 h-16 bg-slate-950/95 backdrop-blur border-t border-slate-800 flex items-center justify-around z-40 px-2">
            <button
              type="button"
              onClick={() => setMobileTab("edit")}
              className={`flex-1 min-h-[44px] flex flex-col items-center justify-center gap-1 text-[11px] rounded-lg transition-colors ${
                mobileTab === "edit" ? "text-indigo-400 font-semibold bg-indigo-500/10" : "text-slate-400 hover:text-white"
              }`}
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileTab("preview")}
              className={`flex-1 min-h-[44px] flex flex-col items-center justify-center gap-1 text-[11px] rounded-lg transition-colors ${
                mobileTab === "preview" ? "text-indigo-400 font-semibold bg-indigo-500/10" : "text-slate-400 hover:text-white"
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>Preview</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileTab("score")}
              className={`flex-1 min-h-[44px] flex flex-col items-center justify-center gap-1 text-[11px] rounded-lg transition-colors ${
                mobileTab === "score" ? "text-indigo-400 font-semibold bg-indigo-500/10" : "text-slate-400 hover:text-white"
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Score</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileTab("ats")}
              className={`flex-1 min-h-[44px] flex flex-col items-center justify-center gap-1 text-[11px] rounded-lg transition-colors ${
                mobileTab === "ats" ? "text-indigo-400 font-semibold bg-indigo-500/10" : "text-slate-400 hover:text-white"
              }`}
            >
              <Target className="w-4 h-4" />
              <span>ATS</span>
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

