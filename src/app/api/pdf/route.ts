import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { generatePDF } from "@/lib/pdf";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { resumeId, resumeData, resumeTheme, templateId, templateConfig, sectionOrder, title } = body || {};

    if (!resumeId && !resumeData) {
      return NextResponse.json(
        { error: "Missing required parameter: resumeId or resumeData" },
        { status: 400 }
      );
    }

    let userId = "";
    try {
      const supabase = await createServerSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        userId = user.id;
      }
    } catch {
      // Auth check fallback if offline or guest mode
    }

    const pdfBuffer = await generatePDF(resumeId, userId, {
      data: resumeData,
      theme: resumeTheme,
      templateId,
      templateConfig,
      sectionOrder,
      title,
    });

    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="resume.pdf"',
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (err: unknown) {
    console.error("PDF generation API error:", err);
    const errorMessage = err instanceof Error ? err.message : "Failed to generate PDF";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
