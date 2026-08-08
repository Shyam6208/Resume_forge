import type { ResumeData, SectionKey } from "@/types/resume.types";

export interface CategorizedKeywords {
  technicalSkills: string[];
  softSkills: string[];
  tools: string[];
  frameworks: string[];
  industryTerms: string[];
}

export interface SectionSuggestion {
  sectionKey: SectionKey;
  title: string;
  currentIssue: string;
  suggestedImprovement: string;
  exampleText: string;
}

export interface KeywordHeatmapItem {
  keyword: string;
  category: "technical" | "soft" | "tool" | "framework" | "industry";
  presentCount: number;
  expectedCount: number;
  status: "matched" | "partial" | "missing";
}

export interface AIAnalysisResult {
  overallRating: number;
  atsRating: number;
  recruiterScore: number;
  hiringReadiness: "Low" | "Medium" | "High" | "Job Ready";
  recruiterVerdict: {
    shortlistStatus: "Shortlisted" | "Under Review" | "Rejected";
    summary: string;
    keyPros: string[];
    keyCons: string[];
  };
  strengths: string[];
  weaknesses: string[];
  atsImprovements: string[];
  missingKeywords: CategorizedKeywords;
  keywordHeatmap: KeywordHeatmapItem[];
  grammarSuggestions: Array<{
    original: string;
    correction: string;
    reason: string;
  }>;
  sectionSuggestions: SectionSuggestion[];
  formattingTips: string[];
  recommendedCertifications: Array<{
    name: string;
    provider: string;
    relevance: string;
  }>;
  powerfulActionVerbs: string[];
}

export interface JDMatchResult {
  matchPercentage: number;
  hiringProbability: "High" | "Moderate" | "Low";
  matchedSkills: string[];
  missingSkills: string[];
  missingKeywords: string[];
  priorityActions: string[];
  keywordHeatmap: KeywordHeatmapItem[];
  tailoringAdvice: string;
}

export interface SectionImproveResult {
  sectionKey: SectionKey;
  improvedData: unknown;
  explanation: string;
  keyChanges: string[];
}

export interface AIChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface CoverLetterResult {
  coverLetterText: string;
  subjectLine: string;
  salutation: string;
  openingParagraph: string;
  bodyParagraphs: string[];
  closingParagraph: string;
  matchingHighlights: string[];
}

export interface InterviewQuestion {
  category: "Technical" | "Behavioral" | "HR" | "Project-Based";
  question: string;
  whyAsked: string;
  suggestedAnswer: string;
  keyPhrasesToInclude: string[];
}

export interface InterviewPrepResult {
  jobRole: string;
  questions: InterviewQuestion[];
  overallTips: string[];
}

export interface SkillGapItem {
  skill: string;
  importance: "Critical" | "High" | "Medium";
  category: string;
  learningRoadmap: string[];
  recommendedCertifications: string[];
}

export interface SkillGapResult {
  targetRole: string;
  currentMatchPercentage: number;
  skillGaps: SkillGapItem[];
  actionPlan: string[];
}
