import { NextResponse } from "next/server";
import { aiService } from "@/lib/ai/ai.service";

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

    const coverLetter = await aiService.generateCoverLetter(
      resumeData,
      jobTitle,
      companyName,
      jobDescription
    );

    return NextResponse.json(coverLetter, { status: 200 });
  } catch (err: unknown) {
    console.error("POST /api/ai/cover-letter error:", err);
    const message = err instanceof Error ? err.message : "Failed to generate Cover Letter with AI";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
