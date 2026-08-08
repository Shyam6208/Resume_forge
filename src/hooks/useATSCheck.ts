// ============================================================
// ResumeForge — ATS Check Hook (800ms debounce)
// ============================================================

"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useResumeStore } from "@/store/resume.store";
import { analyzeATS, type ATSResult } from "@/utils/ats-matcher";

interface UseATSCheckReturn {
  jobDescription: string;
  setJobDescription: (jd: string) => void;
  atsResult: ATSResult | null;
  isAnalyzing: boolean;
}

export function useATSCheck(): UseATSCheckReturn {
  const resumeData = useResumeStore((state) => state.currentResume?.data);

  const [jobDescription, setJobDescriptionRaw] = useState("");
  const [atsResult, setAtsResult] = useState<ATSResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setJobDescription = useCallback((jd: string) => {
    setJobDescriptionRaw(jd);
  }, []);

  useEffect(() => {
    // Only analyze when JD has meaningful content
    if (!resumeData || jobDescription.trim().length < 50) {
      if (atsResult !== null) {
        setAtsResult(null);
        setIsAnalyzing(false);
      }
      return;
    }

    // Clear previous debounce timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    setIsAnalyzing(true);

    // Debounce 800ms
    timerRef.current = setTimeout(() => {
      const result = analyzeATS(resumeData, jobDescription);
      setAtsResult(result);
      setIsAnalyzing(false);
    }, 800);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [resumeData, jobDescription]);

  return {
    jobDescription,
    setJobDescription,
    atsResult,
    isAnalyzing,
  };
}
