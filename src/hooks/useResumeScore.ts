// ============================================================
// ResumeForge — Resume Score Hook (memoized derived state)
// ============================================================

"use client";

import { useMemo } from "react";
import { useResumeStore } from "@/store/resume.store";
import { useAuthStore } from "@/store/auth.store";
import {
  calculateResumeScore,
  type ScoreResult,
  type ScoreLevel,
  type Suggestion,
} from "@/utils/score-calculator";

interface UseResumeScoreReturn {
  score: number;
  level: ScoreLevel;
  suggestions: Suggestion[];
  isCalculating: boolean;
}

const EMPTY_RESULT: ScoreResult = {
  score: 0,
  level: "beginner",
  suggestions: [],
};

export function useResumeScore(): UseResumeScoreReturn {
  const resumeData = useResumeStore((state) => state.currentResume?.data);
  const userType = useAuthStore((state) => state.userType);

  const result = useMemo<ScoreResult>(() => {
    if (!resumeData) return EMPTY_RESULT;
    return calculateResumeScore(resumeData, userType ?? "other");
  }, [resumeData, userType]);

  return {
    score: result.score,
    level: result.level,
    suggestions: result.suggestions,
    isCalculating: false,
  };
}
