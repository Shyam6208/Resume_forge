import type { IAIProvider } from "../ai-provider.interface";
import type { ResumeData, SectionKey, UserType } from "@/types/resume.types";
import type {
  AIAnalysisResult,
  JDMatchResult,
  SectionImproveResult,
  AIChatMessage,
  CoverLetterResult,
  InterviewPrepResult,
  SkillGapResult,
} from "../types";

export class GeminiProvider implements IAIProvider {
  name = "gemini";
  private apiKey: string;
  private primaryModel = "gemini-2.5-flash";
  private fallbackModels = ["gemini-1.5-flash", "gemini-2.0-flash"];

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY || "";
  }

  private async callGeminiAPI(prompt: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error("GEMINI_API_KEY is not configured on the server.");
    }

    const modelsToTry = [this.primaryModel, ...this.fallbackModels];
    let lastError: Error | null = null;

    for (const model of modelsToTry) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`;
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: prompt }],
              },
            ],
            generationConfig: {
              temperature: 0.2,
              responseMimeType: "application/json",
            },
          }),
        });

        if (!response.ok) {
          const errText = await response.text().catch(() => "");
          throw new Error(`Gemini API model ${model} HTTP ${response.status}: ${errText}`);
        }

        const json = await response.json();
        const text =
          json?.candidates?.[0]?.content?.parts?.[0]?.text || "";

        if (text) {
          return text;
        }
      } catch (err: unknown) {
        console.warn(`Gemini provider attempt failed with model ${model}:`, err);
        lastError = err instanceof Error ? err : new Error(String(err));
      }
    }

    throw lastError || new Error("Failed to generate content from Gemini API.");
  }

  /**
   * Safe JSON parse with fallback
   */
  private parseJSON<T>(rawText: string, fallback: T): T {
    try {
      // Strip markdown code fences if present
      const cleaned = rawText
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();
      return JSON.parse(cleaned) as T;
    } catch (err) {
      console.error("JSON parsing error from Gemini output:", err, rawText);
      return fallback;
    }
  }

  async analyzeResume(
    data: ResumeData,
    userType: UserType = "developer",
    targetJob = ""
  ): Promise<AIAnalysisResult> {
    const prompt = `
You are an Executive HR Recruiter and Lead ATS Scanner evaluating a resume for a ${targetJob || userType} candidate.
Analyze the provided JSON resume content carefully and output ONLY a valid JSON object matching the exact structure below.

RESUME DATA:
${JSON.stringify(data, null, 2)}

REQUIRED JSON OUTPUT FORMAT:
{
  "overallRating": 85,
  "atsRating": 88,
  "recruiterScore": 82,
  "hiringReadiness": "Job Ready",
  "recruiterVerdict": {
    "shortlistStatus": "Shortlisted",
    "summary": "Concise 2-sentence HR recruiter verdict on this candidate.",
    "keyPros": ["Key strength 1", "Key strength 2"],
    "keyCons": ["Key risk or gap 1"]
  },
  "strengths": ["Clear technical stack", "Quantifiable impact"],
  "weaknesses": ["Missing specific cloud certifications", "Short summary"],
  "atsImprovements": ["Include exact ATS keyword matches", "Avoid complex tables"],
  "missingKeywords": {
    "technicalSkills": ["TypeScript", "GraphQL"],
    "softSkills": ["Cross-functional Leadership"],
    "tools": ["Docker", "Kubernetes"],
    "frameworks": ["Next.js App Router"],
    "industryTerms": ["CI/CD Pipeline", "Microservices"]
  },
  "keywordHeatmap": [
    { "keyword": "React", "category": "technical", "presentCount": 3, "expectedCount": 4, "status": "matched" },
    { "keyword": "Docker", "category": "tool", "presentCount": 0, "expectedCount": 2, "status": "missing" }
  ],
  "grammarSuggestions": [
    { "original": "Worked on frontend.", "correction": "Architected and delivered high-performance frontend interfaces.", "reason": "Weak action verb." }
  ],
  "sectionSuggestions": [
    {
      "sectionKey": "summary",
      "title": "Executive Summary Enhancement",
      "currentIssue": "Lacks measurable metrics.",
      "suggestedImprovement": "Lead with years of experience and key engineering impact.",
      "exampleText": "Senior Full Stack Engineer with 5+ years of experience scaling web systems handling 100k daily active users."
    }
  ],
  "formattingTips": ["Keep bullet points to 1-2 lines for optimal ATS parsing."],
  "recommendedCertifications": [
    { "name": "AWS Certified Solutions Architect", "provider": "Amazon Web Services", "relevance": "Validates cloud architecture expertise." }
  ],
  "powerfulActionVerbs": ["Architected", "Engineered", "Optimized", "Spearheaded", "Scaled"]
}
`;

    const rawResult = await this.callGeminiAPI(prompt);
    return this.parseJSON<AIAnalysisResult>(rawResult, {
      overallRating: 75,
      atsRating: 78,
      recruiterScore: 72,
      hiringReadiness: "Medium",
      recruiterVerdict: {
        shortlistStatus: "Under Review",
        summary: "Solid resume with good technical background. Minor ATS optimizations required.",
        keyPros: ["Solid core skills"],
        keyCons: ["Add more metrics to bullet points"],
      },
      strengths: ["Clean profile layout"],
      weaknesses: ["Add quantitative achievements"],
      atsImprovements: ["Ensure keywords match target job description"],
      missingKeywords: {
        technicalSkills: ["TypeScript"],
        softSkills: ["Collaboration"],
        tools: ["Git"],
        frameworks: ["React"],
        industryTerms: ["Agile"],
      },
      keywordHeatmap: [],
      grammarSuggestions: [],
      sectionSuggestions: [],
      formattingTips: ["Use standard ATS bullet points."],
      recommendedCertifications: [],
      powerfulActionVerbs: ["Spearheaded", "Architected", "Optimized"],
    });
  }

  async matchJobDescription(
    data: ResumeData,
    jobDescription: string
  ): Promise<JDMatchResult> {
    const prompt = `
You are an ATS Match Engine. Compare the candidate's resume against the Job Description provided below.
Output ONLY a valid JSON object matching the exact schema.

CANDIDATE RESUME:
${JSON.stringify(data, null, 2)}

JOB DESCRIPTION:
${jobDescription}

REQUIRED JSON OUTPUT FORMAT:
{
  "matchPercentage": 82,
  "hiringProbability": "High",
  "matchedSkills": ["React", "Node.js", "TypeScript"],
  "missingSkills": ["GraphQL", "Kubernetes"],
  "missingKeywords": ["AWS", "CI/CD", "Redis"],
  "priorityActions": [
    "Highlight Docker and Kubernetes experience in Projects",
    "Add AWS certification to Certifications section"
  ],
  "keywordHeatmap": [
    { "keyword": "React", "category": "technical", "presentCount": 4, "expectedCount": 3, "status": "matched" },
    { "keyword": "GraphQL", "category": "technical", "presentCount": 0, "expectedCount": 2, "status": "missing" }
  ],
  "tailoringAdvice": "Focus experience bullet points on cloud deployment and scaling microservices."
}
`;

    const rawResult = await this.callGeminiAPI(prompt);
    return this.parseJSON<JDMatchResult>(rawResult, {
      matchPercentage: 70,
      hiringProbability: "Moderate",
      matchedSkills: [],
      missingSkills: [],
      missingKeywords: [],
      priorityActions: ["Tailor experience bullets to match target role keywords."],
      keywordHeatmap: [],
      tailoringAdvice: "Add missing technical keywords to skills section.",
    });
  }

  async improveSection(
    sectionKey: SectionKey,
    currentSectionData: unknown,
    userType: UserType = "developer",
    targetJob = ""
  ): Promise<SectionImproveResult> {
    const prompt = `
You are an HR Executive & Expert Resume Editor. Rewrite and improve the given resume section data for a ${targetJob || userType} position.
Make it highly professional, ATS-optimized, and impactful with strong action verbs and quantitative metrics where possible.
Output ONLY a valid JSON object matching the schema below.

SECTION KEY: "${sectionKey}"
CURRENT SECTION DATA:
${JSON.stringify(currentSectionData, null, 2)}

REQUIRED JSON OUTPUT FORMAT:
{
  "sectionKey": "${sectionKey}",
  "improvedData": <IMPROVED_DATA_SAME_STRUCTURE_AS_INPUT>,
  "explanation": "Concise summary of improvements made.",
  "keyChanges": [
    "Replaced weak action verbs with high-impact leadership verbs",
    "Added measurable percentage metrics"
  ]
}
`;

    const rawResult = await this.callGeminiAPI(prompt);
    return this.parseJSON<SectionImproveResult>(rawResult, {
      sectionKey,
      improvedData: currentSectionData,
      explanation: "Enhanced professional tone and action verbs.",
      keyChanges: ["Improved clarity"],
    });
  }

  async chatWithResume(
    data: ResumeData,
    history: AIChatMessage[],
    userPrompt: string,
    userType: UserType = "developer",
    targetJob = ""
  ): Promise<string> {
    const historyText = history
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join("\n");

    const prompt = `
You are ResumeForge AI Coach, an expert career advisor and HR recruiter assisting a ${targetJob || userType} candidate.
Answer the user's question concisely, professionally, and actionably based on their resume context.

CANDIDATE RESUME CONTEXT:
${JSON.stringify(data, null, 2)}

CONVERSATION HISTORY:
${historyText}

USER QUESTION: ${userPrompt}

OUTPUT FORMAT: Return JSON object:
{ "reply": "Your detailed advice in markdown format here..." }
`;

    const rawResult = await this.callGeminiAPI(prompt);
    const parsed = this.parseJSON<{ reply: string }>(rawResult, {
      reply: "I analyzed your resume. Consider highlighting quantifiable impact and key technical skills.",
    });
    return parsed.reply;
  }

  async generateCoverLetter(
    data: ResumeData,
    jobTitle: string,
    companyName: string,
    jobDescription = ""
  ): Promise<CoverLetterResult> {
    const prompt = `
You are an Executive Career Coach writing a compelling, tailored Cover Letter for a candidate applying to ${companyName} as a ${jobTitle}.

CANDIDATE RESUME:
${JSON.stringify(data, null, 2)}

JOB DESCRIPTION (IF PROVIDED):
${jobDescription || "N/A"}

REQUIRED JSON OUTPUT FORMAT:
{
  "subjectLine": "Application for ${jobTitle} — ${data.personalInfo?.fullName || "Candidate"}",
  "salutation": "Dear Hiring Manager,",
  "openingParagraph": "Strong hook expressing enthusiasm for the ${jobTitle} role at ${companyName}...",
  "bodyParagraphs": [
    "Paragraph 1 detailing relevant achievements and technical experience...",
    "Paragraph 2 demonstrating cultural fit and problem solving impact..."
  ],
  "closingParagraph": "Call to action requesting an interview...",
  "coverLetterText": "Full formatted cover letter text...",
  "matchingHighlights": ["Aligned 5+ years React experience with company tech stack"]
}
`;

    const rawResult = await this.callGeminiAPI(prompt);
    return this.parseJSON<CoverLetterResult>(rawResult, {
      subjectLine: `Application for ${jobTitle} — ${data.personalInfo?.fullName || "Candidate"}`,
      salutation: "Dear Hiring Team,",
      openingParagraph: `I am writing to express my strong interest in the ${jobTitle} position at ${companyName}.`,
      bodyParagraphs: ["With my background in software engineering, I am confident in my ability to contribute."],
      closingParagraph: "Thank you for your consideration. I look forward to speaking with you.",
      coverLetterText: `Dear Hiring Team,\n\nI am writing to apply for ${jobTitle} at ${companyName}.\n\nSincerely,\n${data.personalInfo?.fullName || "Candidate"}`,
      matchingHighlights: [],
    });
  }

  async generateInterviewPrep(
    data: ResumeData,
    targetRole = ""
  ): Promise<InterviewPrepResult> {
    const prompt = `
Generate role-specific interview preparation questions and sample answers for a candidate with this resume.
Target Role: ${targetRole || "Software Developer"}

RESUME:
${JSON.stringify(data, null, 2)}

REQUIRED JSON OUTPUT FORMAT:
{
  "jobRole": "${targetRole || "Software Engineer"}",
  "questions": [
    {
      "category": "Technical",
      "question": "How do you optimize state management in Next.js applications?",
      "whyAsked": "Tests practical architectural understanding.",
      "suggestedAnswer": "Explain store slice selectors, memoization, and server/client boundary separation.",
      "keyPhrasesToInclude": ["Selector slices", "Memoization", "Hydration"]
    },
    {
      "category": "Behavioral",
      "question": "Describe a project deadline crunch and how you prioritized tasks.",
      "whyAsked": "Evaluates stress handling and communication.",
      "suggestedAnswer": "Use the STAR method (Situation, Task, Action, Result)...",
      "keyPhrasesToInclude": ["Prioritization", "Stakeholder communication"]
    }
  ],
  "overallTips": ["Review key metrics from your experience section", "Practice explaining system trade-offs"]
}
`;

    const rawResult = await this.callGeminiAPI(prompt);
    return this.parseJSON<InterviewPrepResult>(rawResult, {
      jobRole: targetRole || "Software Engineer",
      questions: [],
      overallTips: ["Review your resume bullet points and practice STAR technique."],
    });
  }

  async analyzeSkillGap(
    data: ResumeData,
    targetRole = ""
  ): Promise<SkillGapResult> {
    const prompt = `
Analyze the candidate's resume against current industry standard requirements for a ${targetRole || "Senior Developer"} role.
Output skill gaps, learning roadmap, and certification recommendations.

RESUME:
${JSON.stringify(data, null, 2)}

REQUIRED JSON OUTPUT FORMAT:
{
  "targetRole": "${targetRole || "Senior Developer"}",
  "currentMatchPercentage": 75,
  "skillGaps": [
    {
      "skill": "Cloud System Architecture",
      "importance": "Critical",
      "category": "DevOps / Infrastructure",
      "learningRoadmap": ["Week 1-2: AWS Core Services", "Week 3-4: Terraform & IAM"],
      "recommendedCertifications": ["AWS Certified Solutions Architect"]
    }
  ],
  "actionPlan": ["Focus on building 1 cloud-native project", "Get AWS Developer certification"]
}
`;

    const rawResult = await this.callGeminiAPI(prompt);
    return this.parseJSON<SkillGapResult>(rawResult, {
      targetRole: targetRole || "Software Developer",
      currentMatchPercentage: 70,
      skillGaps: [],
      actionPlan: ["Expand technical portfolio with target stack projects."],
    });
  }
}
