import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";

export interface ATSFileParseResult {
  success: boolean;
  isResume: boolean;
  extractedText?: string;
  fileName?: string;
  fileType?: "pdf" | "image" | "docx";
  wordCount?: number;
  detectedSections?: string[];
  error?: string;
}

const RESUME_KEYWORD_PATTERNS = [
  /\b(experience|employment|work\s+history|professional\s+experience)\b/i,
  /\b(education|academic|degree|university|college|bachelor|master|b\.tech|m\.tech|bca|mca)\b/i,
  /\b(skills|technical\s+skills|core\s+competencies|technologies)\b/i,
  /\b(projects|featured\s+projects|academic\s+projects)\b/i,
  /\b(summary|professional\s+summary|objective|about\s+me|profile)\b/i,
  /\b(certifications|certificates|licenses)\b/i,
  /\b(contact|email|phone|linkedin|github)\b/i,
];

/**
 * Checks if extracted text has strong characteristics of a resume / CV.
 */
export function validateResumeText(text: string): { isValid: boolean; matchedSections: string[]; reason?: string } {
  if (!text || text.trim().length < 120) {
    return {
      isValid: false,
      matchedSections: [],
      reason: "Document contains insufficient text to be a valid resume (minimum 120 characters required).",
    };
  }

  const clean = text.toLowerCase();
  const words = clean.match(/\b[a-z0-9+#.-]{2,}\b/g) || [];
  if (words.length < 30) {
    return {
      isValid: false,
      matchedSections: [],
      reason: "Document contains too few words to be a complete resume (minimum 30 words required).",
    };
  }

  const matchedSections: string[] = [];
  if (/\b(experience|employment|work history)\b/i.test(clean)) matchedSections.push("Experience");
  if (/\b(education|university|college|degree|bachelor|master)\b/i.test(clean)) matchedSections.push("Education");
  if (/\b(skills|technologies|proficiencies)\b/i.test(clean)) matchedSections.push("Skills");
  if (/\b(projects|built|developed|architected)\b/i.test(clean)) matchedSections.push("Projects");
  if (/\b(summary|objective|profile|about)\b/i.test(clean)) matchedSections.push("Summary");
  if (/\b(certifications|certified|certificate)\b/i.test(clean)) matchedSections.push("Certifications");
  if (/@|\b(email|phone|linkedin|github)\b/i.test(clean)) matchedSections.push("Contact Info");

  // Require at least 2 distinct resume signals
  if (matchedSections.length < 2) {
    return {
      isValid: false,
      matchedSections,
      reason: "The uploaded file does not appear to be a resume. It is missing standard resume sections (e.g. Experience, Education, Skills, or Contact details).",
    };
  }

  return {
    isValid: true,
    matchedSections,
  };
}

/**
 * Calls Gemini Vision API with inline image data to transcribe and strictly verify resume images / scanned PDFs.
 */
async function parseAndVerifyImageWithGemini(
  buffer: Buffer,
  mimeType: string
): Promise<{ isResume: boolean; extractedText?: string; detectedSections?: string[]; rejectionReason?: string }> {
  const apiKey = process.env.GEMINI_API_KEY || "";
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const base64Data = buffer.toString("base64");
  const prompt = `
You are a Strict Resume & CV Document Verification and OCR System.

Examine the provided image or document carefully and perform two strict tasks:

1. VERIFICATION:
   - Check if this image is a genuine Resume, Curriculum Vitae (CV), or Professional Candidate Profile.
   - If the image is NOT a resume (e.g., it is a photo of a person, selfie, meme, landscape, receipt, certificate, product label, invoice, screenshot of social media, code file, wallpaper, diagram, or random non-resume text):
     Return JSON with "isResume": false and a polite, helpful "rejectionReason" explaining what was detected instead.
   
2. TRANSCRIPTION:
   - If the image IS a genuine resume:
     Transcribe the full text verbatim and format it clearly with section headers (Personal Info, Summary, Work Experience, Education, Technical Skills, Projects, Certifications).
     List the detected resume sections in "detectedSections".

REQUIRED JSON OUTPUT FORMAT:
If NOT a resume:
{
  "isResume": false,
  "rejectionReason": "This image appears to be [description of what was uploaded] rather than a resume or CV. Please upload a clear photo or document of your resume."
}

If IS a resume:
{
  "isResume": true,
  "detectedSections": ["Contact Info", "Experience", "Skills", "Education"],
  "extractedText": "FULL TRANSCRIBED RESUME TEXT WITH ALL BULLETS AND DETAILS..."
}
`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType,
                data: base64Data,
              },
            },
            { text: prompt },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    throw new Error(`Gemini Vision API error (${response.status}): ${errText}`);
  }

  const json = await response.json();
  const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("No response from Gemini Vision parser.");
  }

  try {
    return JSON.parse(text);
  } catch {
    // Attempt markdown json strip
    const stripped = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
    return JSON.parse(stripped);
  }
}

/**
 * Main parser entry point: extracts text from PDF, Image, or DOCX and strictly verifies it is a resume.
 */
export async function parseAndValidateATSResumeFile(
  file: File
): Promise<ATSFileParseResult> {
  const fileName = file.name || "uploaded_resume";
  const lowerName = fileName.toLowerCase();
  const mimeType = file.type.toLowerCase();

  const isPdf = mimeType === "application/pdf" || lowerName.endsWith(".pdf");
  const isDocx =
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    lowerName.endsWith(".docx");
  const isImage =
    mimeType.startsWith("image/") ||
    lowerName.endsWith(".png") ||
    lowerName.endsWith(".jpg") ||
    lowerName.endsWith(".jpeg") ||
    lowerName.endsWith(".webp");

  if (!isPdf && !isDocx && !isImage) {
    return {
      success: false,
      isResume: false,
      error: "Unsupported file format. Please upload a PDF, PNG, JPG, WEBP, or DOCX resume document.",
    };
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // -------------------------------------------------------------
  // Case 1: Image File (PNG, JPG, JPEG, WEBP) -> Gemini Vision OCR
  // -------------------------------------------------------------
  if (isImage) {
    const effectiveMime = mimeType.startsWith("image/")
      ? mimeType
      : lowerName.endsWith(".png")
      ? "image/png"
      : lowerName.endsWith(".webp")
      ? "image/webp"
      : "image/jpeg";

    try {
      const visionResult = await parseAndVerifyImageWithGemini(buffer, effectiveMime);

      if (!visionResult.isResume || !visionResult.extractedText) {
        return {
          success: false,
          isResume: false,
          fileName,
          fileType: "image",
          error:
            visionResult.rejectionReason ||
            "This image is not recognized as a resume or CV. Please upload a valid resume document.",
        };
      }

      const wordCount = (visionResult.extractedText.match(/\b\w+\b/g) || []).length;

      return {
        success: true,
        isResume: true,
        fileName,
        fileType: "image",
        extractedText: visionResult.extractedText,
        wordCount,
        detectedSections: visionResult.detectedSections || ["Contact", "Experience", "Skills"],
      };
    } catch (err: unknown) {
      console.error("Gemini Vision image parse error:", err);
      return {
        success: false,
        isResume: false,
        fileName,
        fileType: "image",
        error: "Failed to read text from image. Please ensure the image is clear and well-lit.",
      };
    }
  }

  // -------------------------------------------------------------
  // Case 2: PDF Document
  // -------------------------------------------------------------
  if (isPdf) {
    let extractedText = "";

    try {
      const parser = new PDFParse({ data: buffer });
      const result = await parser.getText();
      extractedText = result?.text ?? "";
      await parser.destroy();
    } catch (pdfErr) {
      console.warn("pdf-parse extraction failed, falling back to Gemini Vision:", pdfErr);
    }

    extractedText = extractedText.replace(/\u0000/g, "").trim();

    // If PDF is scanned or image-based (less than 80 chars extracted) -> use Gemini Vision
    if (extractedText.length < 80) {
      try {
        const visionResult = await parseAndVerifyImageWithGemini(buffer, "application/pdf");
        if (!visionResult.isResume || !visionResult.extractedText) {
          return {
            success: false,
            isResume: false,
            fileName,
            fileType: "pdf",
            error:
              visionResult.rejectionReason ||
              "The uploaded PDF does not contain resume or CV content. Please upload a valid resume.",
          };
        }

        extractedText = visionResult.extractedText;
      } catch (err: unknown) {
        return {
          success: false,
          isResume: false,
          fileName,
          fileType: "pdf",
          error: "This PDF appears to be a scanned image and could not be parsed. Please upload a clear text PDF or image.",
        };
      }
    }

    // Validate extracted text structure
    const validation = validateResumeText(extractedText);
    if (!validation.isValid) {
      return {
        success: false,
        isResume: false,
        fileName,
        fileType: "pdf",
        error: validation.reason || "The uploaded document does not appear to be a resume.",
      };
    }

    const wordCount = (extractedText.match(/\b\w+\b/g) || []).length;
    return {
      success: true,
      isResume: true,
      fileName,
      fileType: "pdf",
      extractedText,
      wordCount,
      detectedSections: validation.matchedSections,
    };
  }

  // -------------------------------------------------------------
  // Case 3: DOCX Document
  // -------------------------------------------------------------
  if (isDocx) {
    try {
      const result = await mammoth.extractRawText({ buffer });
      const extractedText = (result?.value || "").replace(/\u0000/g, "").trim();

      const validation = validateResumeText(extractedText);
      if (!validation.isValid) {
        return {
          success: false,
          isResume: false,
          fileName,
          fileType: "docx",
          error: validation.reason || "The uploaded DOCX does not appear to be a resume.",
        };
      }

      const wordCount = (extractedText.match(/\b\w+\b/g) || []).length;
      return {
        success: true,
        isResume: true,
        fileName,
        fileType: "docx",
        extractedText,
        wordCount,
        detectedSections: validation.matchedSections,
      };
    } catch (err: unknown) {
      return {
        success: false,
        isResume: false,
        fileName,
        fileType: "docx",
        error: "Failed to read DOCX file. The file might be corrupted.",
      };
    }
  }

  return {
    success: false,
    isResume: false,
    error: "Unknown file type.",
  };
}
