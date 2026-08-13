import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";
import { parseResumeTextDeterministically } from "@/lib/resume-import/parser";
import { aiService } from "@/lib/ai/ai.service";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_TEXT_LENGTH = 50000; // 50,000 characters limit

export async function POST(request: Request) {
  try {
    console.log("[resume/import] STEP 1: request received");

    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[resume/import] STEP 2: auth validated");

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Server-side validation
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large. Maximum size is 5 MB." }, { status: 413 });
    }

    const isPdf = file.type === "application/pdf" || file.name.endsWith(".pdf");
    const isDocx =
      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.name.endsWith(".docx");

    if (!isPdf && !isDocx) {
      return NextResponse.json({ error: "Unsupported file type. Please upload a PDF or DOCX." }, { status: 415 });
    }

    console.log("[resume/import] STEP 3: file validated, type:", isPdf ? "pdf" : "docx", "size:", file.size);

    // Buffer the file in memory completely securely.
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    let extractedText = "";

    console.log("[resume/import] STEP 4: buffer created, length:", buffer.length);

    if (isPdf) {
      // Validate PDF magic bytes before attempting to parse
      const magic = buffer.subarray(0, 5).toString("ascii");
      if (magic !== "%PDF-") {
        console.error("[resume/import] Invalid PDF magic bytes:", magic);
        return NextResponse.json(
          { error: "Invalid PDF file." },
          { status: 400 }
        );
      }

      console.log("[resume/import] STEP 5: magic bytes valid, starting PDF parse");

      const parser = new PDFParse({ data: buffer });
      try {
        const result = await parser.getText();
        extractedText = result.text ?? "";
        console.log("[resume/import] STEP 6: PDF parsing completed, chars:", extractedText.length);
      } catch (error) {
        console.error("[resume/import] PDF extraction failed:", error instanceof Error ? error.message : "Unknown error");
        return NextResponse.json(
          { error: "Failed to read PDF. Please make sure the PDF is valid and try again." },
          { status: 400 }
        );
      } finally {
        await parser.destroy();
      }
    } else if (isDocx) {
      try {
        console.log("[resume/import] STEP 5: starting DOCX parse");
        const result = await mammoth.extractRawText({ buffer });
        extractedText = result.value || "";
        console.log("[resume/import] STEP 6: DOCX parsing completed, chars:", extractedText.length);
      } catch (error) {
        return NextResponse.json(
          { error: "Failed to read DOCX. The file might be corrupted." },
          { status: 400 }
        );
      }
    }

    // Clean and normalize text
    extractedText = extractedText.replace(/\u0000/g, "");
    extractedText = extractedText.replace(/\r\n/g, "\n");
    extractedText = extractedText.replace(/\n{3,}/g, "\n\n");
    extractedText = extractedText.trim();

    // Check for Scanned / Empty PDFs
    if (extractedText.length < 50) {
      if (isPdf) {
        return NextResponse.json(
          { error: "This PDF appears to be scanned or image-based. Please upload a text-based PDF or DOCX." },
          { status: 422 }
        );
      } else {
        return NextResponse.json(
          { error: "Couldn't extract readable text from this document. The file might be empty." },
          { status: 422 }
        );
      }
    }

    // Check for Size Limits to prevent malicious huge text extraction
    if (extractedText.length > MAX_TEXT_LENGTH) {
      return NextResponse.json(
        { error: "Document is too large to process." },
        { status: 413 }
      );
    }

    console.log("[resume/import] STEP 7: text cleanup done, final chars:", extractedText.length);

    // Step 3 Parsing
    const { resumeData, metadata } = parseResumeTextDeterministically(extractedText);
    let finalResumeData = resumeData;
    let geminiCalls = 0;

    console.log("[resume/import] STEP 8: deterministic parser completed");

    // Evaluate confidence
    const c = metadata.confidence;
    const isAmbiguous = c.personalInfo === "LOW" || c.experience === "LOW" || c.education === "LOW";

    console.log("[resume/import] STEP 9: confidence eval:", JSON.stringify(c), "isAmbiguous:", isAmbiguous);

    if (isAmbiguous) {
       try {
          console.log("[resume/import] STEP 9a: Gemini fallback starting");
          const geminiData = await aiService.extractResumeData(extractedText);
          
          finalResumeData = {
             personalInfo: geminiData.personalInfo || resumeData.personalInfo,
             summary: geminiData.summary || resumeData.summary,
             experience: geminiData.experience && geminiData.experience.length > 0 ? geminiData.experience : resumeData.experience,
             education: geminiData.education && geminiData.education.length > 0 ? geminiData.education : resumeData.education,
             projects: geminiData.projects && geminiData.projects.length > 0 ? geminiData.projects : resumeData.projects,
             skills: geminiData.skills || resumeData.skills,
             certifications: geminiData.certifications && geminiData.certifications.length > 0 ? geminiData.certifications : resumeData.certifications,
          };
          
          geminiCalls = 1;
          console.log("[resume/import] STEP 9b: Gemini fallback completed");
       } catch (aiError) {
          console.error("[resume/import] Gemini fallback failed:", aiError instanceof Error ? aiError.message : String(aiError));
          metadata.warnings.push("AI parsing failed. Check imported data carefully.");
       }
    }

    console.log("[resume/import] STEP 10: building response");

    return NextResponse.json({
      success: true,
      fileType: isPdf ? "pdf" : "docx",
      fileName: file.name,
      resumeData: finalResumeData,
      metadata,
      _debug: { geminiCalls }
    });

  } catch (error) {
    console.error("[resume/import] UNHANDLED ERROR");
    console.error("name:", error instanceof Error ? error.name : "Unknown");
    console.error("message:", error instanceof Error ? error.message : String(error));
    console.error("stack:", error instanceof Error ? error.stack : undefined);
    return NextResponse.json(
      { error: "An unexpected error occurred while processing the document." },
      { status: 500 }
    );
  }
}
