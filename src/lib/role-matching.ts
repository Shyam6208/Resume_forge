import { ROLE_PROFILES, RoleProfile, DEFAULT_SECTION_PRIORITY } from "@/config/roleIntelligence";
import type { ResumeData, SectionKey, UserType } from "@/types/resume.types";

export interface LocalRelevanceResult {
  targetJob: string;
  resolvedProfile: RoleProfile;
  matchedSkills: string[];
  missingRecommendedSkills: string[];
  rankedSkills: { skill: string; rank: "core" | "secondary" | "weak" }[];
  rankedProjects: { id: string; name: string; relevanceScore: number }[];
  sectionPriority: SectionKey[];
}

/**
 * Resolves a free-text target job string to the closest RoleProfile.
 */
export function getRoleProfile(targetJob: string): RoleProfile {
  if (!targetJob || targetJob.trim() === "") {
    return ROLE_PROFILES.find(p => p.id === "software-engineer") || ROLE_PROFILES[0];
  }

  const normalizedTarget = targetJob.toLowerCase().trim();

  // 1. Exact title match
  let match = ROLE_PROFILES.find(p => p.title.toLowerCase() === normalizedTarget);
  if (match) return match;

  // 2. Exact alias match
  match = ROLE_PROFILES.find(p => p.aliases.some(a => a.toLowerCase() === normalizedTarget));
  if (match) return match;

  // 3. Keyword / partial match logic
  const STOP_WORDS = new Set([
    "and", "the", "for", "with", "of", "in", "to", "a", "an",
    "senior", "junior", "lead", "principal", "associate", "staff", "chief"
  ]);

  // Safely tokenize while keeping meaningful acronyms (e.g., ai, ml, qa, ui, ux, bi, it, hr, ar, vr)
  // Split by spaces, hyphens, and slashes. Replace them with space first.
  const rawTokens = normalizedTarget.replace(/[\/\-\\]/g, " ").split(/\s+/);
  
  const tokens = rawTokens
    .map(t => t.trim().replace(/[.,;:!?()]/g, "")) // Remove punctuation from edges
    .filter(t => t.length > 0 && !STOP_WORDS.has(t));

  let bestMatch = ROLE_PROFILES[0];
  let highestScore = -1;

  for (const profile of ROLE_PROFILES) {
    let score = 0;
    
    // Check tokens
    const titleString = profile.title.toLowerCase();
    const titleTokens = titleString.replace(/[\/\-\\]/g, " ").split(/\s+/).map(t => t.replace(/[.,;:!?()]/g, ""));

    for (const token of tokens) {
      // Title matching (exact token gets +3, partial substring gets +1)
      if (titleTokens.includes(token)) {
        score += 3;
      } else if (titleString.includes(token)) {
        score += 1;
      }

      // Check aliases
      if (profile.aliases.some(a => a.toLowerCase().includes(token))) score += 2;
      
      // Check keywords
      if (profile.importantKeywords.some(k => k.toLowerCase().includes(token))) score += 1;
      
      // Check core skills (helps domains like Cloud or Security pick up relevant tech signals)
      if (profile.coreSkills.some(s => s.toLowerCase().includes(token))) score += 2;
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = profile;
    }
  }

  // Fallback to general business if score is really low and nothing else matches well
  if (highestScore === 0) {
    const fallback = ROLE_PROFILES.find(p => p.id === "general-business");
    if (fallback) return fallback;
  }

  return bestMatch;
}

/**
 * Analyzes existing user data against the resolved role profile.
 */
export function analyzeLocalRelevance(
  resumeData: ResumeData,
  targetJob: string,
  userType: UserType = "developer"
): LocalRelevanceResult {
  const profile = getRoleProfile(targetJob);

  // 1. Extract existing skills
  const existingSkills: string[] = [];
  if (resumeData.skills) {
    Object.values(resumeData.skills).forEach(skillArray => {
      if (Array.isArray(skillArray)) {
        existingSkills.push(...skillArray.map(s => s.trim()));
      }
    });
  }

  const normalizedExisting = existingSkills.map(s => s.toLowerCase());

  // 2. Match Skills
  const matchedSkills: string[] = [];
  const missingRecommendedSkills: string[] = [];
  const rankedSkills: { skill: string; rank: "core" | "secondary" | "weak" }[] = [];

  // Core skills
  profile.coreSkills.forEach(core => {
    if (normalizedExisting.includes(core.toLowerCase())) {
      matchedSkills.push(core);
      rankedSkills.push({ skill: core, rank: "core" });
    } else {
      missingRecommendedSkills.push(core);
    }
  });

  // Secondary skills
  profile.secondarySkills.forEach(sec => {
    if (normalizedExisting.includes(sec.toLowerCase())) {
      matchedSkills.push(sec);
      rankedSkills.push({ skill: sec, rank: "secondary" });
    } else {
      missingRecommendedSkills.push(sec);
    }
  });

  // Weak/Other skills in resume that don't directly match the profile but exist
  existingSkills.forEach(es => {
    if (!matchedSkills.some(ms => ms.toLowerCase() === es.toLowerCase())) {
      rankedSkills.push({ skill: es, rank: "weak" });
    }
  });

  // 3. Rank Projects
  const rankedProjects = (resumeData.projects || []).map(project => {
    let score = 0;
    const searchString = `${project.name} ${project.description} ${project.technologies.join(" ")}`.toLowerCase();
    
    // Check signals
    profile.projectSignals.forEach(signal => {
      if (searchString.includes(signal.toLowerCase())) score += 2;
    });

    profile.coreSkills.forEach(skill => {
      if (searchString.includes(skill.toLowerCase())) score += 3;
    });

    profile.importantKeywords.forEach(keyword => {
      if (searchString.includes(keyword.toLowerCase())) score += 1;
    });

    return {
      id: project.id,
      name: project.name,
      relevanceScore: score
    };
  }).sort((a, b) => b.relevanceScore - a.relevanceScore);

  // 4. Determine Section Priority
  let finalPriority = [...profile.sectionPriority];
  
  // If user is a student/fresher, education and projects should be higher
  if (userType === "student") {
    // Reorder: Move education and projects up, experience down
    const newOrder: SectionKey[] = ["personalInfo", "summary", "education", "projects", "skills"];
    
    // Add the rest in their original order, skipping what we already added
    finalPriority.forEach(key => {
      if (!newOrder.includes(key)) {
        newOrder.push(key);
      }
    });
    finalPriority = newOrder;
  }

  // Ensure all keys from DEFAULT_SECTION_PRIORITY are present
  DEFAULT_SECTION_PRIORITY.forEach(key => {
    if (!finalPriority.includes(key)) {
      finalPriority.push(key);
    }
  });

  return {
    targetJob, // preserve original
    resolvedProfile: profile,
    matchedSkills,
    missingRecommendedSkills: missingRecommendedSkills.slice(0, 5), // Only top 5 to avoid overwhelming
    rankedSkills,
    rankedProjects,
    sectionPriority: finalPriority
  };
}
