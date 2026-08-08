// ============================================================
// ResumeForge — Resume Score Calculator (Rule-Based, No AI)
// ============================================================

import type { ResumeData, UserType } from "@/types/resume.types";

// --- Types ---

export interface Suggestion {
  type: "critical" | "important" | "tip";
  message: string;
  section: string;
  points: number;
}

export type ScoreLevel =
  | "top-candidate"
  | "interview-ready"
  | "job-ready"
  | "developing"
  | "beginner";

export interface ScoreResult {
  score: number;
  level: ScoreLevel;
  suggestions: Suggestion[];
}

// --- Helpers ---

function getScoreLevel(score: number): ScoreLevel {
  if (score >= 90) return "top-candidate";
  if (score >= 75) return "interview-ready";
  if (score >= 60) return "job-ready";
  if (score >= 45) return "developing";
  return "beginner";
}

function getTotalSkillsCount(data: ResumeData): number {
  if (!data.skills) return 0;
  return Object.values(data.skills).reduce(
    (total, arr) => total + (arr?.length ?? 0),
    0
  );
}

// --- Main calculator ---

export function calculateResumeScore(
  data: ResumeData,
  userType: UserType
): ScoreResult {
  let score = 100;
  const suggestions: Suggestion[] = [];

  function deduct(
    points: number,
    type: Suggestion["type"],
    message: string,
    section: string
  ) {
    score -= points;
    suggestions.push({ type, message, section, points });
  }

  // ==========================================================
  // COMMON — all user types
  // ==========================================================

  if (!data.personalInfo?.email?.trim()) {
    deduct(10, "critical", "Add your email address — recruiters need it to contact you.", "personalInfo");
  }

  if (!data.personalInfo?.phone?.trim()) {
    deduct(5, "important", "Add a phone number for direct contact.", "personalInfo");
  }

  const summaryLen = data.summary?.trim().length ?? 0;
  if (summaryLen < 50) {
    deduct(8, "important", "Write a professional summary of at least 50 characters.", "summary");
  }

  if (summaryLen > 500) {
    deduct(2, "tip", "Keep summary concise — aim for 150-300 characters.", "summary");
  }

  if (!data.personalInfo?.profilePhoto) {
    deduct(3, "tip", "Add a professional profile photo.", "personalInfo");
  }

  if (!data.personalInfo?.linkedin?.trim()) {
    deduct(3, "tip", "Add your LinkedIn profile URL.", "personalInfo");
  }

  // ==========================================================
  // FRESHER / STUDENT
  // ==========================================================

  const isFresher = userType === "fresher" || userType === "student";

  if (isFresher) {
    // No penalty for missing experience — rule #6

    if (!data.projects || data.projects.length === 0) {
      deduct(
        20,
        "critical",
        "Add college/personal projects — most important for freshers!",
        "projects"
      );
    }

    if (!data.education || data.education.length === 0) {
      deduct(15, "critical", "Add your education details.", "education");
    }

    if (getTotalSkillsCount(data) < 5) {
      deduct(10, "important", "Add at least 5 skills to showcase your abilities.", "skills");
    }

    if (!data.certifications || data.certifications.length === 0) {
      deduct(5, "tip", "Add Coursera/Udemy certificates to stand out.", "certifications");
    }
  }

  // ==========================================================
  // DEVELOPER / DESIGNER
  // ==========================================================

  const isDeveloperDesigner =
    userType === "developer" || userType === "designer";

  if (isDeveloperDesigner) {
    const hasExperience =
      data.experience && data.experience.length > 0;
    const hasProjects = data.projects && data.projects.length > 0;

    if (!hasExperience && !hasProjects) {
      deduct(
        20,
        "critical",
        "Add work experience or projects to demonstrate your skills.",
        "experience"
      );
    } else if (!hasExperience && hasProjects) {
      deduct(5, "tip", "Add internships if any — even short ones count.", "experience");
    }

    if (getTotalSkillsCount(data) < 8) {
      deduct(8, "important", "Add at least 8 skills to match job requirements.", "skills");
    }

    if (!data.personalInfo?.github?.trim()) {
      deduct(3, "tip", "Add your GitHub profile URL.", "personalInfo");
    }
  }

  // ==========================================================
  // EXPERIENCED / MANAGER / TEACHER
  // ==========================================================

  const isSenior =
    userType === "experienced" ||
    userType === "manager" ||
    userType === "teacher";

  if (isSenior) {
    if (!data.experience || data.experience.length === 0) {
      deduct(20, "critical", "Add your work experience — essential for your profile.", "experience");
    } else {
      if (data.experience.length < 2) {
        deduct(
          5,
          "important",
          "Add more work experience entries to show career progression.",
          "experience"
        );
      }

      for (const entry of data.experience) {
        if (entry.responsibilities.length < 2) {
          deduct(
            3,
            "important",
            `Add more responsibilities for "${entry.position || entry.company || "your role"}" — at least 2 bullet points.`,
            "experience"
          );
        }
      }
    }

    if (!data.certifications || data.certifications.length === 0) {
      deduct(3, "tip", "Add professional certifications to strengthen your profile.", "certifications");
    }
  }

  // ==========================================================
  // FREELANCER / OTHER — apply a mix of common checks
  // ==========================================================

  const isOther = userType === "freelancer" || userType === "other";

  if (isOther) {
    const hasExperience =
      data.experience && data.experience.length > 0;
    const hasProjects = data.projects && data.projects.length > 0;

    if (!hasExperience && !hasProjects) {
      deduct(
        15,
        "critical",
        "Add experience or projects to showcase your work.",
        "experience"
      );
    }

    if (getTotalSkillsCount(data) < 5) {
      deduct(8, "important", "Add at least 5 skills.", "skills");
    }
  }

  // Clamp score to 0-100
  score = Math.max(0, Math.min(100, score));

  // Sort suggestions: critical first, then important, then tip
  const priorityOrder: Record<Suggestion["type"], number> = {
    critical: 0,
    important: 1,
    tip: 2,
  };
  suggestions.sort((a, b) => priorityOrder[a.type] - priorityOrder[b.type]);

  return {
    score,
    level: getScoreLevel(score),
    suggestions,
  };
}
