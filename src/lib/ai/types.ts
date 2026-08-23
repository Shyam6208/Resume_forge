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
  id?: string;
  category: "Resume" | "Technical" | "Behavioral" | "Job-Specific";
  question: string;
  whyAsked: string;
  answerGuide: string[];
}

export interface InterviewPrepResult {
  jobRole: string;
  questions: InterviewQuestion[];
  overallTips: string[];
}

export interface AnswerEvaluation {
  score: number;
  strengths: string[];
  improvements: string[];
  missingElements: string[];
  unsupportedClaims: string[];
  followUpQuestion?: string;
}

export interface InterviewAnswer {
  questionId: string;
  userAnswer: string;
  evaluation: AnswerEvaluation | null;
  skipped: boolean;
}

export interface ReadinessReportResult {
  overallScore: number;
  categoryScores: Record<string, number>;
  keyStrengths: string[];
  criticalGaps: string[];
  repeatedMistakes: string[];
  actionablePlan: string[];
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

// ============================================================
// Role Optimization Types
// ============================================================

export interface OptimizationSectionChange {
  sectionKey: SectionKey;
  label: string;
  currentData: unknown;
  suggestedData: unknown;
  reason: string;
  keyChanges: string[];
}

export interface SuggestedSkill {
  skill: string;
  reason: string;
  learningPriority: "high" | "medium" | "low";
  commonUseCase: string;
}

export interface KeywordAnalysis {
  highPriority: string[];
  mediumPriority: string[];
  lowPriority: string[];
}

export interface RoleOptimizationResult {
  targetRole: string;
  overallAssessment: string;
  matchedSkills: string[];
  relevantProjects: string[];
  relevantExperience: string[];
  summary: {
    current: string;
    suggested: string;
    reason: string;
  };
  skills: {
    existing: string[];
    reordered: Record<string, string[]>;
    suggested: SuggestedSkill[];
  };
  sectionChanges: OptimizationSectionChange[];
  keywords: KeywordAnalysis;
  missingSkills: SuggestedSkill[];
  recommendations: string[];
}

// ============================================================
// Auto-Tailor Types
// ============================================================

export interface TailoredExperience {
  company: string;
  position: string;
  originalBullets: string[];
  tailoredBullets: string[];
  injectedKeywords: string[];
}

export interface TailoredProject {
  name: string;
  originalDescription: string;
  tailoredDescription: string;
  originalHighlights: string[];
  tailoredHighlights: string[];
  injectedKeywords: string[];
}

export interface AutoTailorResult {
  originalSummary: string;
  tailoredSummary: string;
  tailoredExperience: TailoredExperience[];
  tailoredProjects: TailoredProject[];
  tailoredSkills: Record<string, string[]>;
  keywordInjections: string[];
  atsScoreBefore: number;
  atsScoreAfter: number;
  changesSummary: string[];
}

// ============================================================
// Recruiter Outreach Types
// ============================================================

export interface OutreachMessage {
  subject: string;
  body: string;
  tone: "professional" | "friendly" | "formal";
}

export interface OutreachResult {
  linkedinInMail: OutreachMessage;
  coldEmail: OutreachMessage;
  followUpEmail: OutreachMessage;
  targetRole: string;
  companyName: string;
}

// ============================================================
// Salary Estimator & Career Roadmap Types
// ============================================================

export interface SalaryRange {
  currency: string;
  min: number;
  mid: number;
  max: number;
  label: string;
}

export interface RoadmapSkill {
  skill: string;
  priority: "critical" | "high" | "medium";
  timeframe: string;
  currentLevel: string;
  targetLevel: string;
  resources: string[];
}

export interface SalaryEstimateResult {
  role: string;
  location: string;
  experienceLevel: string;
  salaryRangeINR: SalaryRange;
  salaryRangeUSD: SalaryRange;
  competitiveAdvantages: string[];
  marketInsights: string[];
  growthRoadmap: RoadmapSkill[];
  nextPromotion: {
    targetRole: string;
    timeframe: string;
    requiredSkills: string[];
  };
}
