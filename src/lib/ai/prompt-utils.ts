// ============================================================
// ResumeForge — Prompt Utilities (Token-Optimized)
// ============================================================
//
// Utilities to create compact resume representations for Gemini prompts.
// - Strips empty arrays, null/undefined fields
// - Uses JSON.stringify() (no pretty-print) to minimize whitespace tokens
// ============================================================

import type { ResumeData } from "@/types/resume.types";

/**
 * Create a compact JSON string of the full resume for prompts.
 * Strips empty arrays, null/undefined values, and empty strings.
 */
export function compactResumeForPrompt(data: ResumeData): string {
  return JSON.stringify(stripEmpty(data));
}

/**
 * Create a compact JSON string specifically for cover letter generation.
 * Strips IDs, template settings, UI state, etc. to minimize tokens.
 */
export function compactResumeForCoverLetter(data: ResumeData): string {
  const cloned = JSON.parse(JSON.stringify(data)) as ResumeData;

  // Clean IDs and non-essential arrays
  if (cloned.experience) {
    cloned.experience.forEach(exp => { delete (exp as any).id; });
  }
  if (cloned.education) {
    cloned.education.forEach(edu => { delete (edu as any).id; });
  }
  if (cloned.projects) {
    cloned.projects.forEach(proj => { delete (proj as any).id; });
  }
  if (cloned.certifications) {
    cloned.certifications.forEach(cert => { delete (cert as any).id; });
  }

  // Omit unnecessary top-level properties
  delete (cloned as any).id;
  delete (cloned as any).userId;
  delete (cloned as any).createdAt;
  delete (cloned as any).updatedAt;
  delete (cloned as any).title;
  delete (cloned as any).themeColor;
  delete (cloned as any).layout;

  return JSON.stringify(stripEmpty(cloned));
}

/**
 * Create a compact JSON string specifically for interview prep.
 * Retains name, summary, experience, projects, skills, education, certifications.
 */
export function compactResumeForInterviewPrep(data: ResumeData): string {
  const cloned = JSON.parse(JSON.stringify(data)) as ResumeData;

  // Clean IDs
  if (cloned.experience) {
    cloned.experience.forEach(exp => { delete (exp as any).id; });
  }
  if (cloned.education) {
    cloned.education.forEach(edu => { delete (edu as any).id; });
  }
  if (cloned.projects) {
    cloned.projects.forEach(proj => { delete (proj as any).id; });
  }
  if (cloned.certifications) {
    cloned.certifications.forEach(cert => { delete (cert as any).id; });
  }

  // Pick only relevant fields for Interview Prep
  const interviewData = {
    name: cloned.personalInfo?.fullName,
    summary: cloned.summary,
    experience: cloned.experience,
    projects: cloned.projects,
    skills: cloned.skills,
    education: cloned.education,
    certifications: cloned.certifications,
  };

  return JSON.stringify(stripEmpty(interviewData));
}

/**
 * Create a compact JSON string of a single section for prompts.
 * Used by improveSection to send only the relevant data.
 */
export function compactSectionForPrompt(sectionData: unknown): string {
  return JSON.stringify(stripEmpty(sectionData));
}

/**
 * Recursively strip empty/null/undefined values from an object.
 * - Removes null, undefined
 * - Removes empty strings ""
 * - Removes empty arrays []
 * - Removes empty objects {}
 */
function stripEmpty(value: unknown): unknown {
  if (value === null || value === undefined) return undefined;
  if (typeof value === "string") return value.length > 0 ? value : undefined;
  if (typeof value === "number" || typeof value === "boolean") return value;

  if (Array.isArray(value)) {
    const filtered = value
      .map(stripEmpty)
      .filter((v) => v !== undefined);
    return filtered.length > 0 ? filtered : undefined;
  }

  if (typeof value === "object") {
    const result: Record<string, unknown> = {};
    let hasKeys = false;
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      const cleaned = stripEmpty(v);
      if (cleaned !== undefined) {
        result[k] = cleaned;
        hasKeys = true;
      }
    }
    return hasKeys ? result : undefined;
  }

  return value;
}
