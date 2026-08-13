// ============================================================
// ResumeForge — ATS Check Hook (800ms debounce)
// ============================================================

"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
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
  // Track debounced inputs to safely trigger pure ATS calculation during render
  const [debouncedInputs, setDebouncedInputs] = useState({ jd: "", resume: resumeData });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setJobDescription = useCallback((jd: string) => {
    setJobDescriptionRaw(jd);
  }, []);

  useEffect(() => {
    // Only debounce when JD has meaningful content
    if (!resumeData || jobDescription.trim().length < 50) {
      return;
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Debounce 800ms
    timerRef.current = setTimeout(() => {
      setDebouncedInputs({ jd: jobDescription, resume: resumeData });
    }, 800);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [resumeData, jobDescription]);

  const isEligible = !!resumeData && jobDescription.trim().length >= 50;
  
  // We are "analyzing" if the current inputs are eligible but haven't settled through the debounce yet
  const isAnalyzing = isEligible && (
    jobDescription !== debouncedInputs.jd || 
    resumeData !== debouncedInputs.resume
  );

  // Purely derive the ATS result based on the debounced inputs
  const atsResult = useMemo(() => {
    if (debouncedInputs.resume && debouncedInputs.jd.trim().length >= 50) {
      return analyzeATS(debouncedInputs.resume, debouncedInputs.jd);
    }
    return null;
  }, [debouncedInputs]);

  return {
    jobDescription,
    setJobDescription,
    atsResult: isEligible ? atsResult : null,
    isAnalyzing: isEligible ? isAnalyzing : false,
  };
}
