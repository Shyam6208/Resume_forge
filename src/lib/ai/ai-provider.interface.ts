import type { ResumeData, SectionKey, UserType } from "@/types/resume.types";
import type { TargetRoleProfile } from "@/config/target-roles.config";
import type {
  AIAnalysisResult,
  JDMatchResult,
  SectionImproveResult,
  AIChatMessage,
  CoverLetterResult,
  InterviewPrepResult,
  SkillGapResult,
  RoleOptimizationResult,
} from "./types";

export interface IAIProvider {
  name: string;

  /**
   * Generates complete structured HR recruiter & ATS analysis of resume content
   */
  analyzeResume(
    data: ResumeData,
    userType?: UserType,
    targetJob?: string
  ): Promise<AIAnalysisResult>;

  /**
   * Matches resume content against a job description string
   */
  matchJobDescription(
    data: ResumeData,
    jobDescription: string
  ): Promise<JDMatchResult>;

  /**
   * Rewrites and improves a single section of the resume
   */
  improveSection(
    sectionKey: SectionKey,
    currentSectionData: unknown,
    userType?: UserType,
    targetJob?: string
  ): Promise<SectionImproveResult>;

  /**
   * Context-aware conversational assistant
   */
  chatWithResume(
    data: ResumeData,
    history: AIChatMessage[],
    userPrompt: string,
    userType?: UserType,
    targetJob?: string
  ): Promise<string>;

  /**
   * Generates a custom cover letter based on resume and job specs
   */
  generateCoverLetter(
    data: ResumeData,
    jobTitle: string,
    companyName: string,
    jobDescription?: string
  ): Promise<CoverLetterResult>;

  /**
   * Generates tailored interview questions and sample answers
   */
  generateInterviewPrep(
    data: ResumeData,
    targetRole?: string
  ): Promise<InterviewPrepResult>;

  /**
   * Analyzes skill gaps and outputs a learning roadmap
   */
  analyzeSkillGap(
    data: ResumeData,
    targetRole?: string
  ): Promise<SkillGapResult>;

  /**
   * Analyzes resume against a target role profile and generates
   * role-specific optimization suggestions. NEVER fabricates information.
   */
  optimizeForTargetRole(
    data: ResumeData,
    targetRoleProfile: TargetRoleProfile,
    userType?: UserType
  ): Promise<RoleOptimizationResult>;
}
