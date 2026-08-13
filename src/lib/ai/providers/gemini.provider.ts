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
import { compactResumeForPrompt, compactResumeForCoverLetter, compactResumeForInterviewPrep, compactSectionForPrompt } from "../prompt-utils";

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

  async extractResumeData(text: string): Promise<ResumeData> {
    const prompt = `
You are a precise resume data extraction engine.
Extract the facts from the provided resume text into a structured JSON object.

CRITICAL RULES:
1. ONLY output valid JSON. No markdown, no explanations, no wrappers.
2. DO NOT hallucinate. Do NOT invent companies, job titles, dates, skills, metrics, or technologies not explicitly written in the resume.
3. Preserve the exact wording of bullet points and descriptions. Do NOT rewrite them.
4. Output MUST conform exactly to this TypeScript schema:

{
  "personalInfo": {
    "fullName": "string",
    "email": "string",
    "phone": "string (optional)",
    "website": "string (optional)",
    "linkedin": "string (optional)",
    "github": "string (optional)",
    "address": "string (optional)",
    "city": "string (optional)",
    "country": "string (optional)"
  },
  "summary": "string (optional)",
  "experience": [
    {
      "id": "generate a random string",
      "company": "string",
      "position": "string",
      "location": "string (optional)",
      "startDate": "string (e.g. MM/YYYY)",
      "endDate": "string (e.g. MM/YYYY, optional)",
      "isCurrentlyWorking": boolean,
      "responsibilities": ["bullet 1", "bullet 2"]
    }
  ],
  "education": [
    {
      "id": "generate a random string",
      "institution": "string",
      "degree": "string",
      "branch": "string (optional)",
      "grade": "string (optional)",
      "startDate": "string",
      "endDate": "string (optional)",
      "isCurrentlyStudying": boolean
    }
  ],
  "projects": [
    {
      "id": "generate a random string",
      "name": "string",
      "technologies": ["string"],
      "description": "string",
      "githubLink": "string (optional)",
      "liveDemo": "string (optional)",
      "startDate": "string (optional)",
      "endDate": "string (optional)"
    }
  ],
  "skills": {
    "frontend": ["string"],
    "backend": ["string"],
    "database": ["string"],
    "cloud": ["string"],
    "programming": ["string"],
    "tools": ["string"],
    "languages": ["string"],
    "other": ["string"]
  },
  "certifications": [
    {
      "id": "generate a random string",
      "name": "string",
      "organization": "string",
      "issueDate": "string"
    }
  ]
}

RESUME TEXT:
${text.substring(0, 45000)} // Ensure we don't blow up context
`;

    const rawResult = await this.callGeminiAPI(prompt, 3000); // 3k max output for complex resumes
    
    // Default fallback in case Gemini completely fails to return valid JSON
    return this.parseJSON<ResumeData>(rawResult, {
      personalInfo: { fullName: "", email: "" },
      summary: "",
      experience: [],
      education: [],
      projects: [],
      skills: {},
      certifications: [],
    });
  }

  async optimizeSectionForJob(
    sectionKey: SectionKey,
    currentSectionData: unknown,
    targetJob: string = "",
    jobDescription: string
  ): Promise<SectionImproveResult> {
    const prompt = `
You are a resume optimization assistant.
Optimize the supplied resume content for the supplied job description.

Preserve every factual claim from the original content.

Do not invent:
- skills
- technologies
- employers
- job titles
- responsibilities
- metrics
- percentages
- dates
- certifications
- achievements
- project features
- users
- revenue
- performance numbers

A requirement appearing in the job description does NOT mean the candidate has that skill.
Do not add a skill or technology merely because it appears in the JD.
You may use a JD keyword in the improved text ONLY when that skill, technology, concept, or experience is supported by the supplied original content/context.

Improve:
- clarity
- professional wording
- action verbs
- relevance
- conciseness
- ATS readability

Preserve the original factual meaning.
Return exactly one concise improved version as valid JSON.

TARGET ROLE:
${targetJob || "Not specified"}

JOB DESCRIPTION:
${jobDescription}

CURRENT CONTENT:
${JSON.stringify(currentSectionData, null, 2)}

REQUIRED JSON OUTPUT FORMAT:
{
  "sectionKey": "${sectionKey}",
  "improvedData": <same structure as CURRENT CONTENT, but optimized>,
  "keyChanges": ["List of exactly what changed (max 3)"],
  "explanation": "Brief explanation of why these optimizations improve JD alignment"
}
`;

    const rawResult = await this.callGeminiAPI(prompt, 512);

    return this.parseJSON<SectionImproveResult>(rawResult, {
      sectionKey,
      improvedData: currentSectionData,
      keyChanges: ["Could not parse optimized response safely."],
      explanation: "Optimization failed validation.",
    });
  }

  async analyzeResume(
    data: ResumeData,
    userType: UserType = "developer",
    targetJob = ""
  ): Promise<AIAnalysisResult> {
    const compactData = compactResumeForPrompt(data);
    const prompt = `
You are an Executive HR Recruiter evaluating a resume for a ${targetJob || userType} candidate.
You are analyzing the supplied resume data.

Only identify facts and issues supported by the supplied resume.

Do not invent:
- skills
- technologies
- experience
- employers
- metrics
- certifications
- education
- achievements

Do not calculate ATS scores.
Do not calculate recruiter scores.
Do not assign an overall numerical rating.

Separate observations from recommendations.
If information is missing, identify it as missing rather than inventing it.

Analyze the provided JSON resume content carefully and output ONLY a valid JSON object matching the exact structure below.

RESUME DATA:
${compactData}

REQUIRED JSON OUTPUT FORMAT:
{"strengths":["Clear technical stack","Quantifiable impact"],"weaknesses":["Missing specific cloud certifications","Short summary"],"atsImprovements":["Include exact ATS keyword matches","Avoid complex tables"],"missingKeywords":{"technicalSkills":["TypeScript","GraphQL"],"softSkills":["Cross-functional Leadership"],"tools":["Docker","Kubernetes"],"frameworks":["Next.js App Router"],"industryTerms":["CI/CD Pipeline","Microservices"]},"keywordHeatmap":[{"keyword":"React","category":"technical","presentCount":3,"expectedCount":4,"status":"matched"},{"keyword":"Docker","category":"tool","presentCount":0,"expectedCount":2,"status":"missing"}],"grammarSuggestions":[{"original":"Worked on frontend.","correction":"Architected and delivered high-performance frontend interfaces.","reason":"Weak action verb."}],"sectionSuggestions":[{"sectionKey":"summary","title":"Executive Summary Enhancement","currentIssue":"Lacks measurable metrics.","suggestedImprovement":"Lead with years of experience and key engineering impact.","exampleText":"Senior Full Stack Engineer with 5+ years of experience scaling web systems handling 100k daily active users."}],"formattingTips":["Keep bullet points to 1-2 lines for optimal ATS parsing."],"recommendedCertifications":[{"name":"AWS Certified Solutions Architect","provider":"Amazon Web Services","relevance":"Validates cloud architecture expertise."}],"powerfulActionVerbs":["Architected","Engineered","Optimized","Spearheaded","Scaled"]}
`;

    const rawResult = await this.callGeminiAPI(prompt, 2048);
    return this.parseJSON<AIAnalysisResult>(rawResult, {
      strengths: ["Clean profile layout"],
      weaknesses: ["Add quantitative achievements"],
      atsImprovements: ["Ensure keywords match target job description"],
      missingKeywords: {
        technicalSkills: [],
        softSkills: [],
        tools: [],
        frameworks: [],
        industryTerms: [],
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

Rules:
- Do not infer unsupported skills.
- Do not claim the resume contains information that is not present.
- Distinguish between "not present in the resume" and "candidate does not have the skill".
- Do not invent metrics, technologies, employers, experience, responsibilities, certifications, or achievements.
- Recommendations must be based only on the supplied resume and JD.
- Output ONLY a valid JSON object matching the exact schema.

CANDIDATE RESUME:
${compactData}

JOB DESCRIPTION:
${jobDescription}

REQUIRED JSON OUTPUT FORMAT:
{"matchedSkills":["React","Node.js"],"missingSkills":["GraphQL","Kubernetes"],"missingKeywords":["AWS"],"priorityActions":["Highlight Docker experience"],"keywordHeatmap":[{"keyword":"React","category":"technical","presentCount":4,"expectedCount":3,"status":"matched"},{"keyword":"GraphQL","category":"technical","presentCount":0,"expectedCount":2,"status":"missing"}],"tailoringAdvice":"Focus on cloud deployment."}
`;

    const rawResult = await this.callGeminiAPI(prompt, 1536);
    return this.parseJSON<JDMatchResult>(rawResult, {
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
You are a resume writing assistant for a ${targetJob || userType} position.

Improve the supplied resume content while preserving every factual claim.

Rules:
- Do not invent facts.
- Do not invent metrics.
- Do not invent technologies.
- Do not invent employers.
- Do not invent responsibilities.
- Do not add experience not present in the source.
- Preserve all factual meaning.
- Improve grammar, clarity, conciseness and professional wording.
- Use strong action verbs only when they accurately represent the source.
- Return only valid JSON matching the schema below.
- Return one improved version.

SECTION KEY: "${sectionKey}"
CURRENT SECTION DATA:
${compactSection}

REQUIRED JSON OUTPUT FORMAT:
{"sectionKey":"${sectionKey}","improvedData":<IMPROVED_DATA_SAME_STRUCTURE_AS_INPUT>,"explanation":"Concise summary of improvements made.","keyChanges":["Replaced weak action verbs with high-impact leadership verbs","Improved grammar and conciseness"]}
`;

    const rawResult = await this.callGeminiAPI(prompt, 512);
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
    const compactData = compactResumeForCoverLetter(data);
    const candidateName = data.personalInfo?.fullName || "Candidate";
    
    // Safety check - if resume is practically empty, throw error early.
    if (compactData.length < 50) {
      throw new Error("Add some resume content before generating a cover letter.");
    }
    
    const prompt = `
You are an Executive Career Coach writing a compelling, tailored Cover Letter for a candidate applying to ${companyName} as a ${jobTitle}.

CRITICAL FACTUAL SAFETY RULES:
1. ONLY use information supported by the supplied candidate resume.
2. NEVER invent skills, technologies, employers, job titles, dates, years of experience, projects, responsibilities, certifications, awards, achievements, metrics, percentages, revenue, users, or performance numbers.
3. If the Job Description mentions a requirement (e.g. AWS, Next.js) that is NOT in the resume, DO NOT claim the candidate has it. Instead, focus on the skills the candidate DOES have that are relevant.
4. If the resume has no metrics, DO NOT fabricate them.

CANDIDATE RESUME:
${compactData}

JOB DESCRIPTION:
${jobDescription || "N/A"}

REQUIRED JSON OUTPUT FORMAT:
{"subjectLine":"Application for ${jobTitle} — ${candidateName}","salutation":"Dear Hiring Manager,","openingParagraph":"Strong hook expressing enthusiasm for the ${jobTitle} role at ${companyName}...","bodyParagraphs":["Paragraph 1 detailing relevant achievements and technical experience...","Paragraph 2 demonstrating cultural fit and problem solving impact..."],"closingParagraph":"Call to action requesting an interview...","coverLetterText":"Full formatted cover letter text...","matchingHighlights":["Aligned 5+ years React experience with company tech stack"]}
`;

    const rawResult = await this.callGeminiAPI(prompt, 1024);
    return this.parseJSON<CoverLetterResult>(rawResult, {
      subjectLine: `Application for ${jobTitle} — ${candidateName}`,
      salutation: "Dear Hiring Manager,",
      openingParagraph: `I am writing to express my strong interest in the ${jobTitle} position at ${companyName}.`,
      bodyParagraphs: ["With my background, I am confident in my ability to contribute."],
      closingParagraph: "Thank you for your consideration. I look forward to speaking with you.",
      coverLetterText: `Dear Hiring Manager,\n\nI am writing to apply for ${jobTitle} at ${companyName}.\n\nSincerely,\n${candidateName}`,
      matchingHighlights: [],
    });
  }

  async generateInterviewPrep(
    data: ResumeData,
    jobDescription = "",
    jdMatchContext = ""
  ): Promise<InterviewPrepResult> {
    const compactData = compactResumeForInterviewPrep(data);
    const candidateName = data.personalInfo?.fullName || "Candidate";

    if (compactData.length < 50) {
      throw new Error("Add some resume content before preparing for your interview.");
    }

    const prompt = `
You are an expert technical recruiter and hiring manager conducting interview preparation for ${candidateName}.
Generate a concise, targeted interview preparation set.

CRITICAL FACTUAL SAFETY RULES:
1. ONLY generate questions based on the candidate's actual resume or the job description.
2. NEVER invent employers, projects, technologies, responsibilities, or metrics.
3. If the Job Description requires a skill (e.g., "TypeScript") that is NOT in the resume, DO NOT assume they know it. 
   - BAD: "Tell me about your TypeScript project."
   - GOOD: "The role requires TypeScript. How would you approach working with it given your current experience?"
4. NEVER generate a first-person fake answer pretending to be the candidate.
5. Provide a bulleted \`answerGuide\` explaining HOW to answer (e.g., "Mention your React project", "Explain your state management approach").
6. Maximize at approximately 15 questions total (4 Resume, 5 Tech, 3 Behavioral, 3 JD). Do not pad.

CANDIDATE RESUME:
${compactData}

JOB DESCRIPTION (If provided, use to contextualize Technical and Job-Specific questions):
${jobDescription || "N/A"}

JD MATCH CONTEXT (Key gaps or matches to focus on):
${jdMatchContext || "N/A"}

REQUIRED JSON OUTPUT FORMAT:
{
  "jobRole": "The inferred role title",
  "questions": [
    {
      "category": "Resume",
      "question": "Can you explain your React architecture in [Project]?",
      "whyAsked": "To verify practical experience.",
      "answerGuide": ["Explain the architecture you actually used.", "Mention a real technical challenge."]
    },
    {
      "category": "Job-Specific",
      "question": "The role requires AWS, which isn't on your resume. How would you approach learning it?",
      "whyAsked": "To evaluate adaptability and honesty.",
      "answerGuide": ["Be honest about your current level.", "Mention similar cloud experience if applicable."]
    }
  ],
  "overallTips": ["Review key metrics from your experience section", "Be honest about skills you are currently learning"]
}
`;

    const rawResult = await this.callGeminiAPI(prompt, 2048);
    return this.parseJSON<InterviewPrepResult>(rawResult, {
      jobRole: "Candidate",
      questions: [],
      overallTips: ["Review your resume bullet points and practice the STAR technique."],
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
