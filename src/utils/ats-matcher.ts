// ============================================================
// ResumeForge — ATS Keyword Matcher (Rule-Based, No AI)
// ============================================================

import type { ResumeData } from "@/types/resume.types";

// --- Types ---

export type ATSScore = "excellent" | "good" | "average" | "poor";

export interface ATSResult {
  matchPercentage: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  repeatedKeywords: string[];
  totalJobKeywords: number;
  score: ATSScore;
}

// --- Stop words to remove ---

const STOP_WORDS = new Set([
  "the", "and", "or", "in", "at", "for", "with",
  "a", "an", "is", "are", "was", "were", "be", "been", "to", "of", "that",
  "this", "have", "has", "had", "will", "would", "could", "should", "may",
  "can", "do", "did", "does", "not", "but", "if", "on", "by", "from", "as",
  "it", "its", "we", "our", "your", "their", "they", "he", "she", "you", "i",
  "me", "my", "us", "him", "her", "his", "hers", "than", "then", "when",
  "where", "which", "who", "what", "how", "all", "both", "each", "more",
  "most", "other", "some", "such", "into", "through", "during", "before",
  "after", "above", "below", "between", "out", "up", "down", "about",
]);

// --- Helpers ---

function extractKeywords(text: string): string[] {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s\-+#.]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length >= 3 && !STOP_WORDS.has(word));

  return [...new Set(words)];
}

function extractAllWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s\-+#.]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length >= 3 && !STOP_WORDS.has(word));
}

function buildResumeText(data: ResumeData): string {
  const parts: string[] = [];

  // Summary
  if (data.summary) {
    parts.push(data.summary);
  }

  // All skill categories
  if (data.skills) {
    for (const arr of Object.values(data.skills)) {
      if (arr && arr.length > 0) {
        parts.push(arr.join(" "));
      }
    }
  }

  // Experience responsibilities
  if (data.experience) {
    for (const entry of data.experience) {
      if (entry.responsibilities.length > 0) {
        parts.push(entry.responsibilities.join(" "));
      }
      if (entry.description) {
        parts.push(entry.description);
      }
      if (entry.position) {
        parts.push(entry.position);
      }
    }
  }

  // Project descriptions
  if (data.projects) {
    for (const project of data.projects) {
      if (project.description) {
        parts.push(project.description);
      }
      if (project.technologies.length > 0) {
        parts.push(project.technologies.join(" "));
      }
      if (project.highlights && project.highlights.length > 0) {
        parts.push(project.highlights.join(" "));
      }
    }
  }

  // Certification names
  if (data.certifications) {
    for (const cert of data.certifications) {
      if (cert.name) {
        parts.push(cert.name);
      }
    }
  }

  return parts.join(" ");
}

function getATSScoreLabel(percentage: number): ATSScore {
  if (percentage >= 80) return "excellent";
  if (percentage >= 60) return "good";
  if (percentage >= 40) return "average";
  return "poor";
}

// --- Main analyzer ---

export function analyzeATS(
  resumeData: ResumeData,
  jobDescription: string
): ATSResult {
  // 1. Extract unique keywords from JD
  const jobKeywords = extractKeywords(jobDescription);

  if (jobKeywords.length === 0) {
    return {
      matchPercentage: 0,
      matchedKeywords: [],
      missingKeywords: [],
      repeatedKeywords: [],
      totalJobKeywords: 0,
      score: "poor",
    };
  }

  // 2. Build resume text and extract keywords
  const resumeText = buildResumeText(resumeData);
  const resumeKeywords = new Set(extractKeywords(resumeText));

  // 3. Find matched keywords
  const matchedKeywords = jobKeywords.filter((keyword) =>
    resumeKeywords.has(keyword)
  );

  // 4. Find missing keywords
  const missingKeywords = jobKeywords.filter(
    (keyword) => !resumeKeywords.has(keyword)
  );

  // 5. Find repeated keywords (appearing 4+ times in resume text)
  const allResumeWords = extractAllWords(resumeText);
  const wordFrequency = new Map<string, number>();
  for (const word of allResumeWords) {
    wordFrequency.set(word, (wordFrequency.get(word) ?? 0) + 1);
  }
  const repeatedKeywords: string[] = [];
  for (const [word, count] of wordFrequency) {
    if (count >= 4) {
      repeatedKeywords.push(word);
    }
  }

  // 6. Calculate match percentage
  const matchPercentage = Math.round(
    (matchedKeywords.length / jobKeywords.length) * 100
  );

  // 7. Determine score label
  const score = getATSScoreLabel(matchPercentage);

  return {
    matchPercentage,
    matchedKeywords,
    missingKeywords,
    repeatedKeywords,
    totalJobKeywords: jobKeywords.length,
    score,
  };
}
