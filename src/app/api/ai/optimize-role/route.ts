import { NextResponse } from "next/server";
import { aiService } from "@/lib/ai/ai.service";
import { getRoleProfile } from "@/lib/role-matching";
import { buildCacheKey, getCached, setCached } from "@/lib/ai/ai-cache";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { resumeData, targetRoleId, userType } = body || {};

    if (!resumeData) {
      return NextResponse.json(
        { error: "Missing required parameter: resumeData" },
        { status: 400 }
      );
    }

    if (!targetRoleId || typeof targetRoleId !== "string") {
      return NextResponse.json(
        { error: "Invalid or missing targetRoleId string" },
        { status: 400 }
      );
    }

    const roleProfile = getRoleProfile(targetRoleId);

    // Server-side cache check
    const cacheKey = buildCacheKey(
      "optimize-role",
      JSON.stringify(resumeData),
      targetRoleId,
      userType
    );
    const cached = getCached(cacheKey);
    if (cached) {
      return NextResponse.json(cached, { status: 200 });
    }

    const result = await aiService.optimizeForTargetRole(
      resumeData,
      roleProfile,
      userType
    );

    // Validate essential fields — use fallback from parseJSON, do NOT retry Gemini
    if (
      !result ||
      typeof result.targetRole !== "string" ||
      !Array.isArray(result.matchedSkills) ||
      !Array.isArray(result.recommendations)
    ) {
      return NextResponse.json(
        { error: "AI analysis returned an invalid response. Please try again." },
        { status: 502 }
      );
    }

    setCached(cacheKey, result);

    return NextResponse.json(result, { status: 200 });
  } catch (err: unknown) {
    console.error("POST /api/ai/optimize-role error:", err);

    if (err instanceof Error && err.message.includes("GEMINI_API_KEY")) {
      return NextResponse.json(
        { error: "AI service is not configured. Please check server settings." },
        { status: 503 }
      );
    }

    const message = err instanceof Error ? err.message : "AI analysis failed. Please try again.";

    if (message.includes("AI usage limit reached")) {
      return NextResponse.json({ error: message }, { status: 429 });
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
