import { NextResponse } from "next/server";
import { aiService } from "@/lib/ai/ai.service";
import { buildCacheKey, getCached, setCached } from "@/lib/ai/ai-cache";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { resumeData, targetRole } = body || {};

    if (!resumeData) {
      return NextResponse.json(
        { error: "Missing required parameter: resumeData" },
        { status: 400 }
      );
    }

    // Server-side cache check
    const cacheKey = buildCacheKey(
      "interview-prep",
      JSON.stringify(resumeData),
      targetRole || ""
    );
    const cached = getCached(cacheKey);
    if (cached) {
      return NextResponse.json(cached, { status: 200 });
    }

    const prepResult = await aiService.generateInterviewPrep(resumeData, targetRole);

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
