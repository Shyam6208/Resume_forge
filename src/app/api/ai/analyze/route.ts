import { NextResponse } from "next/server";
import { aiService } from "@/lib/ai/ai.service";

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

    const analysis = await aiService.analyzeResume(resumeData, userType, targetJob);
    return NextResponse.json(analysis, { status: 200 });
  } catch (err: unknown) {
    console.error("POST /api/ai/analyze error:", err);
    const message = err instanceof Error ? err.message : "Failed to analyze resume with AI";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
