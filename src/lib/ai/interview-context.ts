import { getRoleProfile } from "@/lib/role-matching";
import { JDMatchResult } from "@/lib/ai/types";

export interface CompactRoleContext {
  title: string;
  coreSkills: string[];
  secondarySkills: string[];
  importantKeywords: string[];
  importantSections: string[];
  sectionPriority: string[];
  projectSignals: string[];
}

export interface CompactJDMatchContext {
  matchedSkills: string[];
  missingSkills: string[];
  missingKeywords: string[];
  priorityActions: string[];
}

export interface InterviewContext {
  targetRole: string;
  roleContext: CompactRoleContext;
  jdMatchContext: CompactJDMatchContext | null;
}

/**
 * Builds a deterministic, minimal interview context payload.
 */
export function buildInterviewContext(
  targetJob: string,
  jdMatchResult: JDMatchResult | null
): InterviewContext {
  // 1. Resolve role profile
  const profile = getRoleProfile(targetJob);

  // 2. Compact the role profile for AI safety/token limits
  const roleContext: CompactRoleContext = {
    title: profile.title,
    coreSkills: profile.coreSkills.slice(0, 15), // cap to avoid bloat
    secondarySkills: profile.secondarySkills.slice(0, 10),
    importantKeywords: profile.importantKeywords.slice(0, 10),
    importantSections: profile.importantSections,
    sectionPriority: profile.sectionPriority,
    projectSignals: profile.projectSignals,
  };

  // 3. Compact JD match result
  let jdMatchContext: CompactJDMatchContext | null = null;
  if (jdMatchResult) {
    jdMatchContext = {
      matchedSkills: jdMatchResult.matchedSkills,
      missingSkills: jdMatchResult.missingSkills,
      missingKeywords: jdMatchResult.missingKeywords,
      priorityActions: jdMatchResult.priorityActions,
    };
  }

  // Target role is always the exact user-entered string
  return {
    targetRole: targetJob,
    roleContext,
    jdMatchContext,
  };
}
