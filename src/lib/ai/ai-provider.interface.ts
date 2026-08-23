import type { ResumeData, SectionKey, UserType } from "@/types/resume.types";
import type { RoleProfile } from "@/config/roleIntelligence";
import type {
  AIAnalysisResult,
  JDMatchResult,
  SectionImproveResult,
  AIChatMessage,
  CoverLetterResult,
  InterviewPrepResult,
  AnswerEvaluation,
  InterviewAnswer,
  ReadinessReportResult,
  SkillGapResult,
  RoleOptimizationResult,
  AutoTailorResult,
  OutreachResult,
  SalaryEstimateResult,
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
   * Extracts raw resume text into structured ResumeData JSON
   */
  extractResumeData(text: string): Promise<ResumeData>;

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
   * Optimizes a single section of the resume for a specific job description
   */
  optimizeSectionForJob(
    sectionKey: SectionKey,
    currentSectionData: unknown,
    targetJob?: string,
    jobDescription?: string
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
    jobDescription?: string,
    jdMatchContext?: string,
    targetRole?: string,
    roleContext?: string
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
    targetRoleProfile: RoleProfile,
    userType?: UserType
  ): Promise<RoleOptimizationResult>;

  /**
   * Evaluates a single mock interview answer against a question.
   */
  evaluateInterviewAnswer(
    question: string,
    userAnswer: string,
    category: string,
    targetJob?: string,
    roleContext?: string,
    jobDescription?: string,
    resumeContext?: string,
    jdMatchContext?: string
  ): Promise<AnswerEvaluation>;

  /**
   * Generates a final readiness report summarizing all mock interview answers.
   */
  generateInterviewReadinessReport(
    answers: InterviewAnswer[],
    resumeContext?: string,
    jdContext?: string,
    targetRole?: string
  ): Promise<ReadinessReportResult>;

  /**
   * Auto-tailors resume content to match a specific job description.
   * Rewrites bullets, injects ATS keywords, and estimates score change.
   */
  autoTailorResume(
    data: ResumeData,
    jobDescription: string,
    targetRole?: string
  ): Promise<AutoTailorResult>;

  /**
   * Generates recruiter outreach messages: LinkedIn InMail, Cold Email, Follow-Up Email.
   */
  generateRecruiterOutreach(
    data: ResumeData,
    targetRole: string,
    companyName: string,
    recruiterName?: string,
    context?: string
  ): Promise<OutreachResult>;

  /**
   * Estimates salary range and generates a 6-month career growth roadmap.
   */
  estimateSalaryAndRoadmap(
    data: ResumeData,
    targetRole: string,
    location?: string
  ): Promise<SalaryEstimateResult>;
}
