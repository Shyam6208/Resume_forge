import { NextResponse } from "next/server";
import { aiService } from "@/lib/ai/ai.service";
import { buildCacheKey, getCached, setCached } from "@/lib/ai/ai-cache";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { resumeData, targetRole, location } = body || {};

    if (!resumeData || !targetRole) {
      return NextResponse.json(
        { error: "Missing required parameters: resumeData and targetRole" },
        { status: 400 }
      );
    }

    // Server-side cache check
    const cacheKey = buildCacheKey(
      "salary-roadmap",
      JSON.stringify(resumeData),
      targetRole,
      location || "India"
    );
    const cached = getCached(cacheKey);
    if (cached) {
      return NextResponse.json(cached, { status: 200 });
    }

    const result = await aiService.estimateSalaryAndRoadmap(
      resumeData,
      targetRole,
      location || "India"
    );

    setCached(cacheKey, result);

    return NextResponse.json(result, { status: 200 });
  } catch (err: unknown) {
    console.error("POST /api/ai/salary-roadmap error:", err);
    const message = err instanceof Error ? err.message : "Failed to estimate salary";

    if (message.includes("AI usage limit reached")) {
      return NextResponse.json({ error: message }, { status: 429 });
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
