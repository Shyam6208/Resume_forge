import { NextResponse } from "next/server";
import { aiService } from "@/lib/ai/ai.service";
import { buildCacheKey, getCached, setCached } from "@/lib/ai/ai-cache";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { resumeData, jobTitle, companyName, jobDescription } = body || {};

    if (!resumeData || !jobTitle || !companyName) {
      return NextResponse.json(
        { error: "Missing required parameters: resumeData, jobTitle, and companyName" },
        { status: 400 }
      );
    }

    if (!jobDescription || jobDescription.trim().length < 30) {
      return NextResponse.json(
        { error: "Job description must be at least 30 characters long." },
        { status: 400 }
      );
    }

    if (jobDescription.length > 20000) {
      return NextResponse.json(
        { error: "Job description must not exceed 20,000 characters." },
        { status: 400 }
      );
    }

    // Server-side cache check
    const cacheKey = buildCacheKey(
      "cover-letter",
      JSON.stringify(resumeData),
      jobTitle,
      companyName,
      jobDescription || ""
    );
    const cached = getCached(cacheKey);
    if (cached) {
      return NextResponse.json(cached, { status: 200 });
    }

    const coverLetter = await aiService.generateCoverLetter(
      resumeData,
      jobTitle,
      companyName,
      jobDescription
    );

    setCached(cacheKey, coverLetter);

    return NextResponse.json(coverLetter, { status: 200 });
  } catch (err: unknown) {
    console.error("POST /api/ai/cover-letter error:", err);
    const message = err instanceof Error ? err.message : "Failed to generate Cover Letter with AI";

    if (message.includes("AI usage limit reached")) {
      return NextResponse.json({ error: message }, { status: 429 });
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
