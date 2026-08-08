import { NextResponse } from "next/server";
import { aiService } from "@/lib/ai/ai.service";

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

    const gapResult = await aiService.analyzeSkillGap(resumeData, targetRole);
    return NextResponse.json(gapResult, { status: 200 });
  } catch (err: unknown) {
    console.error("POST /api/ai/skill-gap error:", err);
    const message = err instanceof Error ? err.message : "Failed to analyze skill gaps";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
