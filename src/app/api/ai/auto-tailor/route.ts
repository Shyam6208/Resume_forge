import { NextResponse } from "next/server";
import { aiService } from "@/lib/ai/ai.service";
import { buildCacheKey, getCached, setCached } from "@/lib/ai/ai-cache";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { resumeData, jobDescription, targetRole } = body || {};

    if (!resumeData || !jobDescription) {
      return NextResponse.json(
        { error: "Missing required parameters: resumeData and jobDescription" },
        { status: 400 }
      );
    }

    if (typeof jobDescription !== "string" || jobDescription.trim().length < 30) {
      return NextResponse.json(
        { error: "Job description must be at least 30 characters long." },
        { status: 400 }
      );
    }

    // Server-side cache check
    const cacheKey = buildCacheKey(
      "auto-tailor",
      JSON.stringify(resumeData),
      jobDescription,
      targetRole || ""
    );
    const cached = getCached(cacheKey);
    if (cached) {
      return NextResponse.json(cached, { status: 200 });
    }

    const result = await aiService.autoTailorResume(
      resumeData,
      jobDescription,
      targetRole || ""
    );

    setCached(cacheKey, result);

    return NextResponse.json(result, { status: 200 });
  } catch (err: unknown) {
    console.error("POST /api/ai/auto-tailor error:", err);
    const message = err instanceof Error ? err.message : "Failed to auto-tailor resume";

    if (message.includes("AI usage limit reached")) {
      return NextResponse.json({ error: message }, { status: 429 });
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
