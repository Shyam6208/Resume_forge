import { NextResponse } from "next/server";
import { aiService } from "@/lib/ai/ai.service";
import { buildCacheKey, getCached, setCached } from "@/lib/ai/ai-cache";

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

    // Input validation — reject empty/trivial section data
    const dataStr = JSON.stringify(currentSectionData);
    if (!currentSectionData || dataStr === "null" || dataStr === "{}" || dataStr === "[]" || dataStr === '""' || dataStr.length < 10) {
      return NextResponse.json(
        { error: "Please add content to this section before improving with AI." },
        { status: 400 }
      );
    }

    // Server-side cache check
    const cacheKey = buildCacheKey(
      "improve-section",
      sectionKey,
      dataStr,
      userType,
      targetJob
    );
    const cached = getCached(cacheKey);
    if (cached) {
      return NextResponse.json(cached, { status: 200 });
    }

    const improvedResult = await aiService.improveSection(
      sectionKey,
      currentSectionData,
      userType,
      targetJob
    );

    setCached(cacheKey, improvedResult);

    return NextResponse.json(improvedResult, { status: 200 });
  } catch (err: unknown) {
    console.error("POST /api/ai/improve-section error:", err);
    const message = err instanceof Error ? err.message : "Failed to improve section with AI";

    if (message.includes("AI usage limit reached")) {
      return NextResponse.json({ error: message }, { status: 429 });
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
