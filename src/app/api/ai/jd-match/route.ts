import { NextResponse } from "next/server";
import { aiService } from "@/lib/ai/ai.service";

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

    const matchResult = await aiService.matchJobDescription(resumeData, jobDescription);
    return NextResponse.json(matchResult, { status: 200 });
  } catch (err: unknown) {
    console.error("POST /api/ai/jd-match error:", err);
    const message = err instanceof Error ? err.message : "Failed to match job description with AI";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
