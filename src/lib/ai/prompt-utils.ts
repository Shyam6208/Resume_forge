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
