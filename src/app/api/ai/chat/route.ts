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

    // Validate userPrompt is non-empty
    if (typeof userPrompt !== "string" || userPrompt.trim().length === 0) {
      return NextResponse.json(
        { error: "Please enter a question or prompt." },
        { status: 400 }
      );
    }

    // Trim history to last 6 messages on the server side to control token usage
    const trimmedHistory = Array.isArray(history) ? history.slice(-6) : [];

    const reply = await aiService.chatWithResume(
      resumeData,
      trimmedHistory,
      userPrompt,
      userType,
      targetJob
    );

    return NextResponse.json({ reply }, { status: 200 });
  } catch (err: unknown) {
    console.error("POST /api/ai/chat error:", err);
    const message = err instanceof Error ? err.message : "Failed to generate AI assistant reply";

    if (message.includes("AI usage limit reached")) {
      return NextResponse.json({ error: message }, { status: 429 });
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
