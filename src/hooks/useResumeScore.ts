// ============================================================
// ResumeForge — Resume Score Hook (memoized derived state)
// ============================================================

"use client";

import { useState, useEffect, useMemo } from "react";
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

  // Initialize with current resume data if present
  const [debouncedData, setDebouncedData] = useState(resumeData);

  useEffect(() => {
    // 500ms debounce as per GEMINI.md rule 4 (immediate reset when cleared)
    const timer = setTimeout(() => {
      setDebouncedData(resumeData);
    }, resumeData ? 500 : 0);

    return () => clearTimeout(timer);
  }, [resumeData]);

  const isCalculating = Boolean(resumeData && debouncedData !== resumeData);

  const result = useMemo<ScoreResult>(() => {
    if (!debouncedData) return EMPTY_RESULT;
    return calculateResumeScore(debouncedData, userType ?? "other");
  }, [debouncedData, userType]);

  return {
    score: result.score,
    level: result.level,
    suggestions: result.suggestions,
    isCalculating,
  };
}
