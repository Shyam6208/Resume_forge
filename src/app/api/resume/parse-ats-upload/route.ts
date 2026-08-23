import { NextResponse } from "next/server";
import { parseAndValidateATSResumeFile } from "@/lib/resume-import/ats-file-parser";

export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided. Please upload a PDF, PNG, JPG, or DOCX resume." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum allowed size is 10 MB." },
        { status: 413 }
      );
    }

    const result = await parseAndValidateATSResumeFile(file);

    if (!result.success || !result.isResume) {
      return NextResponse.json(
        {
          error:
            result.error ||
            "The uploaded file is not recognized as a resume. Please upload a valid resume document (PDF, PNG, JPG, or DOCX).",
          isResume: false,
        },
        { status: 422 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        isResume: true,
        fileName: result.fileName,
        fileType: result.fileType,
        extractedText: result.extractedText,
        wordCount: result.wordCount,
        detectedSections: result.detectedSections,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    console.error("POST /api/resume/parse-ats-upload error:", err);
    const message =
      err instanceof Error
        ? err.message
        : "An unexpected error occurred while parsing the resume file.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
