"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { ResumeScore } from "./ResumeScore";
import { ATSChecker } from "../ats/ATSChecker";
import { AICoachPanel } from "../ai/AICoachPanel";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BarChart3, Target, Bot, Crosshair, PanelRightClose, PanelRightOpen, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// Lazy-load the RoleOptimizerPanel to keep initial bundle lean
const RoleOptimizerPanel = dynamic(
  () => import("../optimizer/RoleOptimizerPanel").then((m) => m.RoleOptimizerPanel),
  {
    loading: () => (
      <div className="p-8 text-center space-y-2">
        <Loader2 className="w-6 h-6 text-indigo-400 animate-spin mx-auto" />
        <p className="text-xs text-slate-400">Loading Optimizer...</p>
      </div>
    ),
    ssr: false,
  }
);

interface ScoreSidebarProps {
  className?: string;
  defaultTab?: "score" | "ats" | "ai" | "optimize";
}

export function ScoreSidebar({ className = "", defaultTab = "score" }: ScoreSidebarProps) {
  const [activeTab, setActiveTab] = useState<"score" | "ats" | "ai" | "optimize">(defaultTab);
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (isCollapsed) {
    return (
      <div className={`relative ${className}`}>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsCollapsed(false)}
          className="h-10 bg-slate-900 border border-slate-800 text-slate-200 hover:bg-slate-800 hover:text-white shadow-lg flex items-center gap-2 px-3 rounded-l-xl border-r-0"
          title="Expand Analytics & AI Coach Panel"
        >
          <PanelRightOpen className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-semibold hidden lg:inline">Score & AI Coach</span>
        </Button>
      </div>
    );
  }

  return (
    <aside
      className={`w-full max-w-sm h-full bg-slate-900 border-l border-slate-800 flex flex-col overflow-hidden text-slate-100 ${className}`}
    >
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as "score" | "ats" | "ai" | "optimize")}
        className="flex-1 flex flex-col h-full overflow-hidden"
      >
        {/* Header & Tabs bar */}
        <div className="p-3 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between gap-2 shrink-0">
          <TabsList className="grid grid-cols-4 flex-1 h-9 bg-slate-900 border border-slate-800 p-1 rounded-lg">
            <TabsTrigger
              value="score"
              className="text-[10px] sm:text-[11px] font-semibold py-1 px-1 data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all flex items-center justify-center gap-1"
            >
              <BarChart3 className="w-3 h-3 shrink-0" />
              <span className="truncate">Score</span>
            </TabsTrigger>
            <TabsTrigger
              value="ats"
              className="text-[10px] sm:text-[11px] font-semibold py-1 px-1 data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all flex items-center justify-center gap-1"
            >
              <Target className="w-3 h-3 shrink-0" />
              <span className="truncate">ATS</span>
            </TabsTrigger>
            <TabsTrigger
              value="ai"
              className="text-[10px] sm:text-[11px] font-semibold py-1 px-1 data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all flex items-center justify-center gap-1"
            >
              <Bot className="w-3 h-3 text-amber-400 shrink-0" />
              <span className="truncate">Coach</span>
            </TabsTrigger>
            <TabsTrigger
              value="optimize"
              className="text-[10px] sm:text-[11px] font-semibold py-1 px-1 data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all flex items-center justify-center gap-1"
            >
              <Crosshair className="w-3 h-3 text-cyan-400 shrink-0" />
              <span className="truncate">Optimize</span>
            </TabsTrigger>
          </TabsList>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(true)}
            className="w-8 h-8 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg shrink-0"
            title="Collapse Sidebar"
          >
            <PanelRightClose className="w-4 h-4" />
          </Button>
        </div>

        {/* Tab contents */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          <TabsContent value="score" className="mt-0 focus-visible:outline-none">
            {activeTab === "score" && <ResumeScore />}
          </TabsContent>

          <TabsContent value="ats" className="mt-0 focus-visible:outline-none">
            {activeTab === "ats" && <ATSChecker />}
          </TabsContent>

          <TabsContent value="ai" className="mt-0 focus-visible:outline-none">
            {activeTab === "ai" && <AICoachPanel />}
          </TabsContent>

          <TabsContent value="optimize" className="mt-0 focus-visible:outline-none">
            {activeTab === "optimize" && <RoleOptimizerPanel />}
          </TabsContent>
        </div>
      </Tabs>
    </aside>
  );
}

