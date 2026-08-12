import { NextResponse } from "next/server";
import { aiService } from "@/lib/ai/ai.service";
import { buildCacheKey, getCached, setCached } from "@/lib/ai/ai-cache";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { resumeData, userType, targetJob } = body || {};

    if (!resumeData) {
      return NextResponse.json(
        { error: "Missing required parameter: resumeData" },
        { status: 400 }
      );
    }

    // Input validation — reject if resume has no meaningful content
    const hasContent =
      resumeData.summary ||
      (resumeData.experience && resumeData.experience.length > 0) ||
      (resumeData.projects && resumeData.projects.length > 0) ||
      (resumeData.skills && Object.keys(resumeData.skills).length > 0);

    if (!hasContent) {
      return NextResponse.json(
        { error: "Please add some content to your resume before analyzing." },
        { status: 400 }
      );
    }

    // Server-side cache check
    const cacheKey = buildCacheKey(
      "analyze",
      JSON.stringify(resumeData),
      userType,
      targetJob
    );
    const cached = getCached(cacheKey);
    if (cached) {
      return NextResponse.json(cached, { status: 200 });
    }

    const analysis = await aiService.analyzeResume(resumeData, userType, targetJob);

    // Cache the result
    setCached(cacheKey, analysis);

    return NextResponse.json(analysis, { status: 200 });
  } catch (err: unknown) {
    console.error("POST /api/ai/analyze error:", err);
    const message = err instanceof Error ? err.message : "Failed to analyze resume with AI";

    // Quota/rate-limit detection
    if (message.includes("AI usage limit reached")) {
      return NextResponse.json({ error: message }, { status: 429 });
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
