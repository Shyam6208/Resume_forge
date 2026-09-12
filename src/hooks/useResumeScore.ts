// ============================================================
// ResumeForge — Resume Score Hook (memoized derived state)
// ============================================================

"use client";

import { useState, useEffect, useRef, useMemo } from "react";
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
  const [isCalculating, setIsCalculating] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!resumeData) {
      setDebouncedData(undefined);
      setIsCalculating(false);
      return;
    }

    setIsCalculating(true);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // 500ms debounce as per GEMINI.md rule 4
    timerRef.current = setTimeout(() => {
      setDebouncedData(resumeData);
      setIsCalculating(false);
    }, 500);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [resumeData]);

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
