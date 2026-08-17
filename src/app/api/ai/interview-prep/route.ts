import { NextResponse } from "next/server";
import { aiService } from "@/lib/ai/ai.service";
import { buildCacheKey, getCached, setCached } from "@/lib/ai/ai-cache";
import { compactResumeForInterviewPrep } from "@/lib/ai/prompt-utils";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { resumeData, jobDescription, jdMatchContext, targetRole, roleContext } = body || {};

    if (!resumeData) {
      return NextResponse.json(
        { error: "Missing required parameter: resumeData" },
        { status: 400 }
      );
    }
    
    if (!jobDescription || jobDescription.trim().length < 30) {
      return NextResponse.json(
        { error: "Add a valid job description to prepare for your interview." },
        { status: 400 }
      );
    }
    
    if (jobDescription.length > 20000) {
      return NextResponse.json(
        { error: "Job description is too long (max 20,000 characters)." },
        { status: 400 }
      );
    }

    if (targetRole && typeof targetRole !== "string") {
      return NextResponse.json({ error: "Invalid targetRole" }, { status: 400 });
    }
    if (targetRole && targetRole.length > 200) {
      return NextResponse.json({ error: "targetRole is too long" }, { status: 400 });
    }

    // Server-side cache check
    const cacheKey = buildCacheKey(
      "interview-prep",
      compactResumeForInterviewPrep(resumeData),
      targetRole?.trim().toLowerCase() || "",
      jobDescription.trim().slice(0, 1000), // hash is generated over this in buildCacheKey
      jdMatchContext ? JSON.stringify(jdMatchContext) : ""
    );
    const cached = getCached(cacheKey);
    if (cached) {
      return NextResponse.json(cached, { status: 200 });
    }

    const prepResult = await aiService.generateInterviewPrep(
      resumeData,
      jobDescription,
      jdMatchContext ? JSON.stringify(jdMatchContext) : "",
      targetRole || "",
      roleContext ? JSON.stringify(roleContext) : ""
    );

    setCached(cacheKey, prepResult);

    return NextResponse.json(prepResult, { status: 200 });
  } catch (err: unknown) {
    console.error("POST /api/ai/interview-prep error:", err);
    const message = err instanceof Error ? err.message : "Failed to generate Interview Prep questions";

    if (message.includes("AI usage limit reached")) {
      return NextResponse.json({ error: message }, { status: 429 });
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
