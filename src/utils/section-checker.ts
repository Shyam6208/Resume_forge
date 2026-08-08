// ============================================================
// ResumeForge — Section Empty Checkers (Rule-Based, No AI)
// ============================================================

import type { ResumeData, SectionKey } from "@/types/resume.types";

// --- Individual section emptiness checkers ---

function isPersonalInfoEmpty(data: ResumeData): boolean {
  return !data.personalInfo?.fullName?.trim();
}

function isSummaryEmpty(data: ResumeData): boolean {
  return !data.summary || data.summary.trim().length < 10;
}

function isExperienceEmpty(data: ResumeData): boolean {
  if (!data.experience || data.experience.length === 0) return true;
  return data.experience.every(
    (entry) => !entry.company?.trim() && !entry.position?.trim()
  );
}

function isEducationEmpty(data: ResumeData): boolean {
  if (!data.education || data.education.length === 0) return true;
  return data.education.every((entry) => !entry.institution?.trim());
}

function isProjectsEmpty(data: ResumeData): boolean {
  if (!data.projects || data.projects.length === 0) return true;
  return data.projects.every((entry) => !entry.name?.trim());
}

function isSkillsEmpty(data: ResumeData): boolean {
  if (!data.skills) return true;
  const categories = Object.values(data.skills);
  return categories.every(
    (arr) => !arr || arr.length === 0
  );
}

function isCertificationsEmpty(data: ResumeData): boolean {
  if (!data.certifications || data.certifications.length === 0) return true;
  return data.certifications.every((entry) => !entry.name?.trim());
}

function isAchievementsEmpty(data: ResumeData): boolean {
  if (!data.achievements || data.achievements.length === 0) return true;
  return data.achievements.every((entry) => !entry.title?.trim());
}

function isLanguagesEmpty(data: ResumeData): boolean {
  if (!data.languages || data.languages.length === 0) return true;
  return data.languages.every((entry) => !entry.name?.trim());
}

function isInterestsEmpty(data: ResumeData): boolean {
  return !data.interests || data.interests.length === 0;
}

function isVolunteerEmpty(data: ResumeData): boolean {
  if (!data.volunteer || data.volunteer.length === 0) return true;
  return data.volunteer.every((entry) => !entry.organization?.trim());
}

function isPublicationsEmpty(data: ResumeData): boolean {
  if (!data.publications || data.publications.length === 0) return true;
  return data.publications.every((entry) => !entry.title?.trim());
}

function isReferencesEmpty(data: ResumeData): boolean {
  if (!data.references || data.references.length === 0) return true;
  return data.references.every((entry) => !entry.name?.trim());
}

// --- Exported checker map ---

export const isSectionEmpty: Record<
  SectionKey,
  (data: ResumeData) => boolean
> = {
  personalInfo: isPersonalInfoEmpty,
  summary: isSummaryEmpty,
  experience: isExperienceEmpty,
  education: isEducationEmpty,
  projects: isProjectsEmpty,
  skills: isSkillsEmpty,
  certifications: isCertificationsEmpty,
  achievements: isAchievementsEmpty,
  languages: isLanguagesEmpty,
  interests: isInterestsEmpty,
  volunteer: isVolunteerEmpty,
  publications: isPublicationsEmpty,
  references: isReferencesEmpty,
};

// --- Get only non-empty sections in order ---

export function getVisibleSections(
  data: ResumeData,
  order: SectionKey[]
): SectionKey[] {
  return order.filter((key) => {
    const checker = isSectionEmpty[key];
    return !checker(data);
  });
}
