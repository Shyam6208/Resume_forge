import { NextResponse } from "next/server";
import { aiService } from "@/lib/ai/ai.service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sectionKey, currentSectionData, userType, targetJob } = body || {};

    if (!sectionKey || currentSectionData === undefined) {
      return NextResponse.json(
        { error: "Missing required parameters: sectionKey and currentSectionData" },
        { status: 400 }
      );
    }

    const improvedResult = await aiService.improveSection(
      sectionKey,
      currentSectionData,
      userType,
      targetJob
    );

    return NextResponse.json(improvedResult, { status: 200 });
  } catch (err: unknown) {
    console.error("POST /api/ai/improve-section error:", err);
    const message = err instanceof Error ? err.message : "Failed to improve section with AI";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
