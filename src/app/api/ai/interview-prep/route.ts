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

    const prepResult = await aiService.generateInterviewPrep(resumeData, targetRole);
    return NextResponse.json(prepResult, { status: 200 });
  } catch (err: unknown) {
    console.error("POST /api/ai/interview-prep error:", err);
    const message = err instanceof Error ? err.message : "Failed to generate Interview Prep questions";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
