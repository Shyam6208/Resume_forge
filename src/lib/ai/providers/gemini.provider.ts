import type { IAIProvider } from "../ai-provider.interface";
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
} from "../types";
import { compactResumeForPrompt, compactSectionForPrompt } from "../prompt-utils";

// ============================================================
// Gemini Provider — Token-Optimized for Free Tier
// ============================================================

/** Check if an HTTP error indicates quota/rate limiting (non-retryable). */
function isQuotaError(status: number, body: string): boolean {
  if (status === 429 || status === 403) return true;
  const lower = body.toLowerCase();
  return (
    lower.includes("quota") ||
    lower.includes("rate limit") ||
    lower.includes("resource_exhausted")
  );
}

export class GeminiProvider implements IAIProvider {
  name = "gemini";
  private apiKey: string;
  private primaryModel = "gemini-2.5-flash";
  private fallbackModels = ["gemini-1.5-flash", "gemini-2.0-flash"];

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY || "";
  }

  private async callGeminiAPI(
    prompt: string,
    maxOutputTokens: number = 2048
  ): Promise<string> {
    if (!this.apiKey) {
      throw new Error("GEMINI_API_KEY is not configured on the server.");
    }

    const startTime = Date.now();
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
              maxOutputTokens,
              responseMimeType: "application/json",
            },
          }),
        });

        if (!response.ok) {
          const errText = await response.text().catch(() => "");

          // Quota/rate-limit errors — do NOT cascade to fallback models
          if (isQuotaError(response.status, errText)) {
            throw new Error(
              "AI usage limit reached. Please try again later."
            );
          }

          // Transient 5xx — retry once with same model before trying next
          if (response.status >= 500 && response.status < 600) {
            await new Promise((r) => setTimeout(r, 1000));
            const retryResponse = await fetch(url, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                  temperature: 0.2,
                  maxOutputTokens,
                  responseMimeType: "application/json",
                },
              }),
            });

            if (retryResponse.ok) {
              const retryJson = await retryResponse.json();
              const retryText =
                retryJson?.candidates?.[0]?.content?.parts?.[0]?.text || "";
              if (retryText) {
                this.logRequest("gemini-call", startTime, prompt.length, retryText.length);
                return retryText;
              }
            }
          }

          throw new Error(
            `Gemini API model ${model} HTTP ${response.status}: ${errText}`
          );
        }

        const json = await response.json();
        const text =
          json?.candidates?.[0]?.content?.parts?.[0]?.text || "";

        if (text) {
          this.logRequest("gemini-call", startTime, prompt.length, text.length);
          return text;
        }
      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error(String(err));

        // If it's a quota error, stop immediately — don't try other models
        if (error.message.includes("AI usage limit reached")) {
          throw error;
        }

        console.warn(
          `Gemini provider attempt failed with model ${model}:`,
          error.message
        );
        lastError = error;
      }
    }

    throw lastError || new Error("Failed to generate content from Gemini API.");
  }

  /**
   * Dev-only request monitoring — never logs API keys or sensitive data.
   */
  private logRequest(
    operation: string,
    startTime: number,
    inputChars: number,
    outputChars: number
  ): void {
    if (process.env.NODE_ENV === "development") {
      console.log(
        `[AI Monitor] ${operation} | ${Date.now() - startTime}ms | in:~${inputChars}ch | out:~${outputChars}ch`
      );
    }
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
    const compactData = compactResumeForPrompt(data);
    const prompt = `
You are an Executive HR Recruiter and Lead ATS Scanner evaluating a resume for a ${targetJob || userType} candidate.
Analyze the provided JSON resume content carefully and output ONLY a valid JSON object matching the exact structure below.

RESUME DATA:
${compactData}

REQUIRED JSON OUTPUT FORMAT:
{"overallRating":85,"atsRating":88,"recruiterScore":82,"hiringReadiness":"Job Ready","recruiterVerdict":{"shortlistStatus":"Shortlisted","summary":"Concise 2-sentence HR recruiter verdict on this candidate.","keyPros":["Key strength 1","Key strength 2"],"keyCons":["Key risk or gap 1"]},"strengths":["Clear technical stack","Quantifiable impact"],"weaknesses":["Missing specific cloud certifications","Short summary"],"atsImprovements":["Include exact ATS keyword matches","Avoid complex tables"],"missingKeywords":{"technicalSkills":["TypeScript","GraphQL"],"softSkills":["Cross-functional Leadership"],"tools":["Docker","Kubernetes"],"frameworks":["Next.js App Router"],"industryTerms":["CI/CD Pipeline","Microservices"]},"keywordHeatmap":[{"keyword":"React","category":"technical","presentCount":3,"expectedCount":4,"status":"matched"},{"keyword":"Docker","category":"tool","presentCount":0,"expectedCount":2,"status":"missing"}],"grammarSuggestions":[{"original":"Worked on frontend.","correction":"Architected and delivered high-performance frontend interfaces.","reason":"Weak action verb."}],"sectionSuggestions":[{"sectionKey":"summary","title":"Executive Summary Enhancement","currentIssue":"Lacks measurable metrics.","suggestedImprovement":"Lead with years of experience and key engineering impact.","exampleText":"Senior Full Stack Engineer with 5+ years of experience scaling web systems handling 100k daily active users."}],"formattingTips":["Keep bullet points to 1-2 lines for optimal ATS parsing."],"recommendedCertifications":[{"name":"AWS Certified Solutions Architect","provider":"Amazon Web Services","relevance":"Validates cloud architecture expertise."}],"powerfulActionVerbs":["Architected","Engineered","Optimized","Spearheaded","Scaled"]}
`;

    const rawResult = await this.callGeminiAPI(prompt, 2048);
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
    const compactData = compactResumeForPrompt(data);
    const prompt = `
You are an ATS Match Engine. Compare the candidate's resume against the Job Description provided below.
Output ONLY a valid JSON object matching the exact schema.

CANDIDATE RESUME:
${compactData}

JOB DESCRIPTION:
${jobDescription}

REQUIRED JSON OUTPUT FORMAT:
{"matchPercentage":82,"hiringProbability":"High","matchedSkills":["React","Node.js","TypeScript"],"missingSkills":["GraphQL","Kubernetes"],"missingKeywords":["AWS","CI/CD","Redis"],"priorityActions":["Highlight Docker and Kubernetes experience in Projects","Add AWS certification to Certifications section"],"keywordHeatmap":[{"keyword":"React","category":"technical","presentCount":4,"expectedCount":3,"status":"matched"},{"keyword":"GraphQL","category":"technical","presentCount":0,"expectedCount":2,"status":"missing"}],"tailoringAdvice":"Focus experience bullet points on cloud deployment and scaling microservices."}
`;

    const rawResult = await this.callGeminiAPI(prompt, 1024);
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
    // Send ONLY the relevant section — not the entire resume
    const compactSection = compactSectionForPrompt(currentSectionData);
    const prompt = `
You are an HR Executive & Expert Resume Editor. Rewrite and improve the given resume section data for a ${targetJob || userType} position.
Make it highly professional, ATS-optimized, and impactful with strong action verbs and quantitative metrics where possible.
NEVER invent metrics, percentages, revenue, users, or achievements not present in the original data.
Output ONLY a valid JSON object matching the schema below.

SECTION KEY: "${sectionKey}"
CURRENT SECTION DATA:
${compactSection}

REQUIRED JSON OUTPUT FORMAT:
{"sectionKey":"${sectionKey}","improvedData":<IMPROVED_DATA_SAME_STRUCTURE_AS_INPUT>,"explanation":"Concise summary of improvements made.","keyChanges":["Replaced weak action verbs with high-impact leadership verbs","Added measurable percentage metrics"]}
`;

    const rawResult = await this.callGeminiAPI(prompt, 768);
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
    // Trim history to last 6 messages to control token growth
    const trimmedHistory = history.slice(-6);
    const historyText = trimmedHistory
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join("\n");

    const compactData = compactResumeForPrompt(data);
    const prompt = `
You are ResumeForge AI Coach, an expert career advisor and HR recruiter assisting a ${targetJob || userType} candidate.
Answer the user's question concisely, professionally, and actionably based on their resume context.

CANDIDATE RESUME CONTEXT:
${compactData}

CONVERSATION HISTORY:
${historyText}

USER QUESTION: ${userPrompt}

OUTPUT FORMAT: Return JSON object:
{"reply":"Your detailed advice in markdown format here..."}
`;

    const rawResult = await this.callGeminiAPI(prompt, 768);
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
    const compactData = compactResumeForPrompt(data);
    const candidateName = data.personalInfo?.fullName || "Candidate";
    const prompt = `
You are an Executive Career Coach writing a compelling, tailored Cover Letter for a candidate applying to ${companyName} as a ${jobTitle}.

CANDIDATE RESUME:
${compactData}

JOB DESCRIPTION (IF PROVIDED):
${jobDescription || "N/A"}

REQUIRED JSON OUTPUT FORMAT:
{"subjectLine":"Application for ${jobTitle} — ${candidateName}","salutation":"Dear Hiring Manager,","openingParagraph":"Strong hook expressing enthusiasm for the ${jobTitle} role at ${companyName}...","bodyParagraphs":["Paragraph 1 detailing relevant achievements and technical experience...","Paragraph 2 demonstrating cultural fit and problem solving impact..."],"closingParagraph":"Call to action requesting an interview...","coverLetterText":"Full formatted cover letter text...","matchingHighlights":["Aligned 5+ years React experience with company tech stack"]}
`;

    const rawResult = await this.callGeminiAPI(prompt, 1024);
    return this.parseJSON<CoverLetterResult>(rawResult, {
      subjectLine: `Application for ${jobTitle} — ${candidateName}`,
      salutation: "Dear Hiring Team,",
      openingParagraph: `I am writing to express my strong interest in the ${jobTitle} position at ${companyName}.`,
      bodyParagraphs: ["With my background in software engineering, I am confident in my ability to contribute."],
      closingParagraph: "Thank you for your consideration. I look forward to speaking with you.",
      coverLetterText: `Dear Hiring Team,\n\nI am writing to apply for ${jobTitle} at ${companyName}.\n\nSincerely,\n${candidateName}`,
      matchingHighlights: [],
    });
  }

  async generateInterviewPrep(
    data: ResumeData,
    targetRole = ""
  ): Promise<InterviewPrepResult> {
    const compactData = compactResumeForPrompt(data);
    const prompt = `
Generate role-specific interview preparation questions and sample answers for a candidate with this resume.
Target Role: ${targetRole || "Software Developer"}

RESUME:
${compactData}

REQUIRED JSON OUTPUT FORMAT:
{"jobRole":"${targetRole || "Software Engineer"}","questions":[{"category":"Technical","question":"How do you optimize state management in Next.js applications?","whyAsked":"Tests practical architectural understanding.","suggestedAnswer":"Explain store slice selectors, memoization, and server/client boundary separation.","keyPhrasesToInclude":["Selector slices","Memoization","Hydration"]},{"category":"Behavioral","question":"Describe a project deadline crunch and how you prioritized tasks.","whyAsked":"Evaluates stress handling and communication.","suggestedAnswer":"Use the STAR method (Situation, Task, Action, Result)...","keyPhrasesToInclude":["Prioritization","Stakeholder communication"]}],"overallTips":["Review key metrics from your experience section","Practice explaining system trade-offs"]}
`;

    const rawResult = await this.callGeminiAPI(prompt, 1536);
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
    const compactData = compactResumeForPrompt(data);
    const prompt = `
Analyze the candidate's resume against current industry standard requirements for a ${targetRole || "Senior Developer"} role.
Output skill gaps, learning roadmap, and certification recommendations.

RESUME:
${compactData}

REQUIRED JSON OUTPUT FORMAT:
{"targetRole":"${targetRole || "Senior Developer"}","currentMatchPercentage":75,"skillGaps":[{"skill":"Cloud System Architecture","importance":"Critical","category":"DevOps / Infrastructure","learningRoadmap":["Week 1-2: AWS Core Services","Week 3-4: Terraform & IAM"],"recommendedCertifications":["AWS Certified Solutions Architect"]}],"actionPlan":["Focus on building 1 cloud-native project","Get AWS Developer certification"]}
`;

    const rawResult = await this.callGeminiAPI(prompt, 1024);
    return this.parseJSON<SkillGapResult>(rawResult, {
      targetRole: targetRole || "Software Developer",
      currentMatchPercentage: 70,
      skillGaps: [],
      actionPlan: ["Expand technical portfolio with target stack projects."],
    });
  }

  async optimizeForTargetRole(
    data: ResumeData,
    targetRoleProfile: TargetRoleProfile,
    userType: UserType = "developer"
  ): Promise<RoleOptimizationResult> {
    const compactData = compactResumeForPrompt(data);
    const prompt = `
You are an Expert Resume Optimizer and ATS Specialist.

Your task is to analyze the candidate's resume and generate role-specific optimization suggestions for a "${targetRoleProfile.label}" position.

=== ABSOLUTE RULES (NEVER VIOLATE) ===
1. NEVER fabricate, invent, or assume ANY information not present in the resume.
2. NEVER invent companies, job titles, degrees, certifications, projects, technologies, metrics, achievements, or employment dates.
3. NEVER add technologies the candidate has not listed or described using.
4. You may ONLY rewrite, reorganize, and enhance information that already exists.
5. Missing skills must be returned in the "missingSkills" array as SUGGESTIONS ONLY.
6. Do NOT estimate or generate ATS scores — leave scoring to the existing system.
7. If a field has no content to improve, return the current value unchanged.

=== TARGET ROLE PROFILE ===
Role: ${targetRoleProfile.label}
Core Skills Expected: ${targetRoleProfile.coreSkills.join(", ")}
Secondary Skills: ${targetRoleProfile.secondarySkills.join(", ")}
Important Keywords: ${targetRoleProfile.importantKeywords.join(", ")}
Important Sections: ${targetRoleProfile.importantSections.join(", ")}

=== CANDIDATE RESUME DATA ===
${compactData}

=== REQUIRED JSON OUTPUT FORMAT ===
{"targetRole":"${targetRoleProfile.label}","overallAssessment":"2-3 sentence assessment of how well this resume fits the target role","matchedSkills":["skills from the resume that match the target role"],"relevantProjects":["project names from the resume relevant to this role"],"relevantExperience":["job titles/companies from the resume relevant to this role"],"summary":{"current":"the candidate's current summary text (or empty string if none)","suggested":"an improved role-specific summary using ONLY verified candidate info","reason":"why the improvement helps for this role"},"skills":{"existing":["all skills currently in the resume"],"reordered":{"Frontend":["React","JavaScript"],"Backend":["Node.js"],"Database":["MongoDB"],"Tools":["Git"]},"suggested":[{"skill":"Docker","reason":"Essential for modern ${targetRoleProfile.label} deployment workflows","learningPriority":"high","commonUseCase":"Containerizing applications for consistent deployment"}]},"sectionChanges":[{"sectionKey":"experience","label":"Work Experience","currentData":null,"suggestedData":null,"reason":"Why this section should be improved","keyChanges":["Changed weak verbs to action verbs","Highlighted relevant technologies"]}],"keywords":{"highPriority":["keywords critical for this role"],"mediumPriority":["helpful keywords"],"lowPriority":["nice-to-have keywords"]},"missingSkills":[{"skill":"AWS","reason":"Cloud skills are expected for ${targetRoleProfile.label} roles","learningPriority":"medium","commonUseCase":"Deploying and managing cloud infrastructure"}],"recommendations":["Actionable recommendation 1","Actionable recommendation 2"]}

For sectionChanges:
- Include entries ONLY for sections that actually need improvement.
- "currentData" must be the EXACT current data from the resume for that section.
- "suggestedData" must be the improved version in the SAME structure as currentData.
- For experience entries: improve bullet points with action verbs and highlight relevant tech. Do NOT change company names, job titles, or dates.
- For project entries: improve descriptions to emphasize problem/solution/tech. Do NOT change project names or invent features.
- Only include sections where you can make meaningful improvements.
`;

    const rawResult = await this.callGeminiAPI(prompt, 2048);
    return this.parseJSON<RoleOptimizationResult>(rawResult, {
      targetRole: targetRoleProfile.label,
      overallAssessment: "Resume analysis completed. Review the suggestions below.",
      matchedSkills: [],
      relevantProjects: [],
      relevantExperience: [],
      summary: {
        current: data.summary || "",
        suggested: data.summary || "",
        reason: "No changes suggested.",
      },
      skills: {
        existing: [],
        reordered: {},
        suggested: [],
      },
      sectionChanges: [],
      keywords: {
        highPriority: [],
        mediumPriority: [],
        lowPriority: [],
      },
      missingSkills: [],
      recommendations: ["Review your resume and ensure all relevant skills are listed."],
    });
  }
}
