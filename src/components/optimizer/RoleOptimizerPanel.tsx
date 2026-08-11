"use client";

import { useRoleOptimization } from "@/hooks/useRoleOptimization";
import { TargetRoleSelector } from "./TargetRoleSelector";
import { RoleProfileView } from "./RoleProfileView";
import { OptimizationDashboard } from "./OptimizationDashboard";
import { ChangePreviewPanel } from "./ChangePreviewPanel";
import { MissingSkillsPanel } from "./MissingSkillsPanel";
import { KeywordAnalysisPanel } from "./KeywordAnalysisPanel";
import { Loader2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState } from "react";

export function RoleOptimizerPanel() {
  const {
    selectedRole,
    selectedRoleProfile,
    optimizationResult,
    isOptimizing,
    viewState,
    sectionStatuses,
    hasOriginalSnapshot,
    canUndo,
    canRedo,
    pendingCount,
    selectRole,
    optimize,
    acceptSection,
    rejectSection,
    applyAll,
    undo,
    redo,
    restoreOriginal,
    setViewState,
  } = useRoleOptimization();

  const [activeReviewTab, setActiveReviewTab] = useState<"changes" | "skills" | "keywords">("changes");

  // State: Idle -> Selector
  if (viewState === "idle" || !selectedRoleProfile) {
    return <TargetRoleSelector selectedRole={selectedRole} onSelect={selectRole} />;
  }

  // State: Profile -> Role Profile View (Before optimization)
  if (viewState === "profile") {
    return (
      <RoleProfileView
        profile={selectedRoleProfile}
        isOptimizing={isOptimizing}
        onOptimize={optimize}
        onBack={() => setViewState("idle")}
      />
    );
  }

  // State: Optimizing -> Loading Skeleton
  if (viewState === "optimizing" || isOptimizing) {
    return (
      <div className="py-12 px-4 text-center space-y-4 rounded-xl bg-slate-950/60 border border-slate-800">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-white">
            Analyzing Resume for {selectedRoleProfile.label}...
          </h4>
          <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
            Comparing resume experience & skills against role requirements without fabricating information.
          </p>
        </div>
      </div>
    );
  }

  // State: Results -> Optimization Dashboard
  if (viewState === "results" && optimizationResult) {
    return (
      <OptimizationDashboard
        result={optimizationResult}
        pendingCount={pendingCount}
        onReviewChanges={() => setViewState("review")}
        onChangeRole={() => setViewState("idle")}
      />
    );
  }

  // State: Review -> Change Preview + Missing Skills + Keyword Analysis
  if (viewState === "review" && optimizationResult) {
    return (
      <div className="space-y-4">
        {/* Navigation Tabs for Review Subviews */}
        <Tabs
          value={activeReviewTab}
          onValueChange={(v) => setActiveReviewTab(v as "changes" | "skills" | "keywords")}
          className="w-full"
        >
          <TabsList className="grid grid-cols-3 h-8 bg-slate-950 border border-slate-800 p-0.5 rounded-lg mb-4">
            <TabsTrigger
              value="changes"
              className="text-[10px] font-semibold py-1 data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all"
            >
              Changes ({pendingCount})
            </TabsTrigger>
            <TabsTrigger
              value="skills"
              className="text-[10px] font-semibold py-1 data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all"
            >
              Skills Gap
            </TabsTrigger>
            <TabsTrigger
              value="keywords"
              className="text-[10px] font-semibold py-1 data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all"
            >
              Keywords
            </TabsTrigger>
          </TabsList>

          <TabsContent value="changes" className="mt-0 focus-visible:outline-none">
            <ChangePreviewPanel
              result={optimizationResult}
              sectionStatuses={sectionStatuses}
              canUndo={canUndo}
              canRedo={canRedo}
              hasOriginalSnapshot={hasOriginalSnapshot}
              onAcceptSection={acceptSection}
              onRejectSection={rejectSection}
              onApplyAll={applyAll}
              onUndo={undo}
              onRedo={redo}
              onRestoreOriginal={restoreOriginal}
              onBack={() => setViewState("results")}
            />
          </TabsContent>

          <TabsContent value="skills" className="mt-0 focus-visible:outline-none">
            <MissingSkillsPanel
              matchedSkills={optimizationResult.matchedSkills}
              missingSkills={optimizationResult.missingSkills}
            />
          </TabsContent>

          <TabsContent value="keywords" className="mt-0 focus-visible:outline-none">
            <KeywordAnalysisPanel keywords={optimizationResult.keywords} />
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return <TargetRoleSelector selectedRole={selectedRole} onSelect={selectRole} />;
}
