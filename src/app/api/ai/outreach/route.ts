import { NextResponse } from "next/server";
import { aiService } from "@/lib/ai/ai.service";
import { buildCacheKey, getCached, setCached } from "@/lib/ai/ai-cache";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { resumeData, targetRole, companyName, recruiterName, context } = body || {};

    if (!resumeData || !targetRole || !companyName) {
      return NextResponse.json(
        { error: "Missing required parameters: resumeData, targetRole, and companyName" },
        { status: 400 }
      );
    }

    // Server-side cache check
    const cacheKey = buildCacheKey(
      "outreach",
      JSON.stringify(resumeData),
      targetRole,
      companyName,
      recruiterName || ""
    );
    const cached = getCached(cacheKey);
    if (cached) {
      return NextResponse.json(cached, { status: 200 });
    }

    const result = await aiService.generateRecruiterOutreach(
      resumeData,
      targetRole,
      companyName,
      recruiterName || "",
      context || ""
    );

    setCached(cacheKey, result);

    return NextResponse.json(result, { status: 200 });
  } catch (err: unknown) {
    console.error("POST /api/ai/outreach error:", err);
    const message = err instanceof Error ? err.message : "Failed to generate outreach messages";

    if (message.includes("AI usage limit reached")) {
      return NextResponse.json({ error: message }, { status: 429 });
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
