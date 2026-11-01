"use client";

import { useRoleOptimization } from "@/hooks/useRoleOptimization";
import { RoleRecommendations } from "./RoleRecommendations";
import { OptimizationDashboard } from "./OptimizationDashboard";
import { ChangePreviewPanel } from "./ChangePreviewPanel";
import { MissingSkillsPanel } from "./MissingSkillsPanel";
import { KeywordAnalysisPanel } from "./KeywordAnalysisPanel";
import { Loader2, Rocket } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

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

  // Automatically transition out of "idle" since we use the global targetJob
  useEffect(() => {
    if (viewState === "idle") {
      setViewState("profile");
    }
  }, [viewState, setViewState]);

  // State: Profile -> Role Profile View (Before optimization)
  if (viewState === "profile" || viewState === "idle") {
    return (
      <div className="space-y-4">
        <RoleRecommendations />
        <Button
          type="button"
          onClick={optimize}
          disabled={isOptimizing || !selectedRole}
          className="w-full h-10 text-xs font-extrabold bg-gradient-to-r from-cyan-500 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 rounded-xl shadow-md shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
        >
          <Rocket className="w-4 h-4 text-slate-950" />
          <span>{isOptimizing ? "Analyzing..." : "Optimize My Resume"}</span>
        </Button>
        <p className="text-[10px] text-muted-foreground text-center">
          AI will analyze your resume and suggest improvements for this role.
          Your original resume will be preserved.
        </p>
      </div>
    );
  }

  // State: Optimizing -> Loading Skeleton
  if (viewState === "optimizing" || isOptimizing) {
    return (
      <div className="py-12 px-4 text-center space-y-4 rounded-2xl bg-card/70 border border-white/[0.08] backdrop-blur-md">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-foreground">
            Analyzing Resume for {selectedRoleProfile?.title || selectedRole}...
          </h4>
          <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
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
        onReset={() => setViewState("idle")}
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
          <TabsList className="grid grid-cols-3 h-8 bg-card/80 border border-white/[0.08] p-0.5 rounded-xl mb-4">
            <TabsTrigger
              value="changes"
              className="text-[10px] font-semibold py-1 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-emerald-400 data-[state=active]:text-slate-950 data-[state=active]:font-extrabold transition-all"
            >
              Changes ({pendingCount})
            </TabsTrigger>
            <TabsTrigger
              value="skills"
              className="text-[10px] font-semibold py-1 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-emerald-400 data-[state=active]:text-slate-950 data-[state=active]:font-extrabold transition-all"
            >
              Skills Gap
            </TabsTrigger>
            <TabsTrigger
              value="keywords"
              className="text-[10px] font-semibold py-1 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-emerald-400 data-[state=active]:text-slate-950 data-[state=active]:font-extrabold transition-all"
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

  return null;
}
