import { NextResponse } from "next/server";
import { aiService } from "@/lib/ai/ai.service";
import type { InterviewAnswer } from "@/lib/ai/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      action = "evaluate",
      question,
      userAnswer,
      category = "Technical",
      targetJob = "",
      roleContext = "",
      jobDescription = "",
      resumeContext = "",
      jdMatchContext = "",
      answers = [],
    } = body || {};

    // Action 1: Generate full Readiness Report across multiple answers
    if (action === "report") {
      if (!Array.isArray(answers)) {
        return NextResponse.json(
          { error: "Invalid answers array provided for readiness report." },
          { status: 400 }
        );
      }

      const report = await aiService.generateInterviewReadinessReport(
        answers as InterviewAnswer[],
        resumeContext,
        jobDescription || jdMatchContext,
        targetJob
      );

      return NextResponse.json(report, { status: 200 });
    }

    // Action 2: Evaluate a single answer
    if (!question || typeof question !== "string") {
      return NextResponse.json(
        { error: "Missing required parameter: question" },
        { status: 400 }
      );
    }

    const safeAnswer = typeof userAnswer === "string" ? userAnswer.trim() : "";

    const evaluation = await aiService.evaluateInterviewAnswer(
      question,
      safeAnswer,
      category,
      targetJob,
      roleContext,
      jobDescription,
      resumeContext,
      jdMatchContext
    );

    return NextResponse.json(evaluation, { status: 200 });
  } catch (err: unknown) {
    console.error("POST /api/ai/interview-eval error:", err);
    const message = err instanceof Error ? err.message : "Failed to evaluate interview response";

    if (message.includes("AI usage limit reached")) {
      return NextResponse.json({ error: message }, { status: 429 });
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
