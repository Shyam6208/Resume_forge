import { NextResponse } from "next/server";
import { aiService } from "@/lib/ai/ai.service";
import { buildCacheKey, getCached, setCached } from "@/lib/ai/ai-cache";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { resumeData, jobDescription } = body || {};

    if (!resumeData || !jobDescription) {
      return NextResponse.json(
        { error: "Missing required parameters: resumeData and jobDescription" },
        { status: 400 }
      );
    }

    // Input validation — JD must be at least 30 chars
    if (typeof jobDescription !== "string" || jobDescription.trim().length < 30) {
      return NextResponse.json(
        { error: "Please enter a valid job description." },
        { status: 400 }
      );
    }

    if (jobDescription.length > 20000) {
      return NextResponse.json(
        { error: "Job description is too long to analyze." },
        { status: 400 }
      );
    }

    // Server-side cache check
    const cacheKey = buildCacheKey(
      "jd-match",
      JSON.stringify(resumeData),
      jobDescription
    );
    const cached = getCached(cacheKey);
    if (cached) {
      return NextResponse.json(cached, { status: 200 });
    }

    const matchResult = await aiService.matchJobDescription(resumeData, jobDescription);

    setCached(cacheKey, matchResult);

    return NextResponse.json(matchResult, { status: 200 });
  } catch (err: unknown) {
    console.error("POST /api/ai/jd-match error:", err);
    const message = err instanceof Error ? err.message : "Failed to match job description with AI";

    if (message.includes("AI usage limit reached")) {
      return NextResponse.json({ error: message }, { status: 429 });
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
