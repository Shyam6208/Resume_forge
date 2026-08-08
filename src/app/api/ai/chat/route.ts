import { NextResponse } from "next/server";
import { aiService } from "@/lib/ai/ai.service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { resumeData, history = [], userPrompt, userType, targetJob } = body || {};

    if (!resumeData || !userPrompt) {
      return NextResponse.json(
        { error: "Missing required parameters: resumeData and userPrompt" },
        { status: 400 }
      );
    }

    const reply = await aiService.chatWithResume(
      resumeData,
      history,
      userPrompt,
      userType,
      targetJob
    );

    return NextResponse.json({ reply }, { status: 200 });
  } catch (err: unknown) {
    console.error("POST /api/ai/chat error:", err);
    const message = err instanceof Error ? err.message : "Failed to generate AI assistant reply";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
