import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { generateDOCX } from "@/lib/docx";
import type { ResumeData, ResumeTheme } from "@/types/resume.types";
import { DEFAULT_THEME } from "@/types/resume.types";

const FALLBACK_DATA: ResumeData = {
  personalInfo: {
    fullName: "John Doe",
    professionalTitle: "Software Engineer",
    email: "john.doe@example.com",
    phone: "+1 (555) 019-2834",
  },
  summary: "Experienced software engineer with expertise in Web development.",
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { resumeId, data: payloadData, theme: payloadTheme } = body || {};

    let resumeData: ResumeData = payloadData || FALLBACK_DATA;
    let resumeTheme: ResumeTheme = payloadTheme || DEFAULT_THEME;

    if (resumeId) {
      try {
        const supabase = await createServerSupabaseClient();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: resume } = await (supabase.from("resumes") as any)
          .select("*")
          .eq("id", resumeId)
          .single();

        if (resume && resume.data) {
          resumeData = (resume.data as unknown as ResumeData) || resumeData;
          resumeTheme = (resume.theme as unknown as ResumeTheme) || resumeTheme;
        }
      } catch (err) {
        console.warn("Supabase fetch fallback in DOCX export route:", err);
      }
    }

    const docxBuffer = await generateDOCX(resumeData, resumeTheme);

    return new Response(new Uint8Array(docxBuffer), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": 'attachment; filename="resume.docx"',
        "Content-Length": docxBuffer.length.toString(),
      },
    });
  } catch (err: unknown) {
    console.error("DOCX generation API error:", err);
    const errorMessage = err instanceof Error ? err.message : "Failed to generate DOCX";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
