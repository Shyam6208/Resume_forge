import { createServerSupabaseClient } from "@/lib/supabase/server";
import { renderResumeToHtml } from "@/lib/render-html";
import type { ResumeData, ResumeTheme } from "@/types/resume.types";
import { DEFAULT_THEME } from "@/types/resume.types";

const FALLBACK_DATA: ResumeData = {
  personalInfo: {
    fullName: "John Doe",
    professionalTitle: "Full Stack Software Engineer",
    email: "john.doe@example.com",
    phone: "+1 (555) 019-2834",
    address: "New York, NY",
    linkedin: "linkedin.com/in/johndoe",
    github: "github.com/johndoe",
  },
  summary:
    "Results-driven Software Engineer with 5+ years of experience building scalable web applications with React, Next.js, and Node.js.",
  skills: {
    frontend: ["React", "Next.js", "TypeScript", "Tailwind CSS"],
    backend: ["Node.js", "Express", "Python", "PostgreSQL"],
    tools: ["Git", "Docker", "VS Code", "Vercel"],
  },
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let resumeData: ResumeData = FALLBACK_DATA;
  let resumeTheme: ResumeTheme = DEFAULT_THEME;
  let templateId = "minimal-white";
  let title = "Resume";

  try {
    const supabase = await createServerSupabaseClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: resume, error } = await (supabase.from("resumes") as any)
      .select("*")
      .eq("id", id)
      .single();

    if (resume && !error) {
      resumeData = (resume.data as unknown as ResumeData) || FALLBACK_DATA;
      resumeTheme = (resume.theme as unknown as ResumeTheme) || DEFAULT_THEME;
      templateId = resume.template_id || resume.templateId || "minimal-white";
      title = resume.title || "Resume";
    }
  } catch (err) {
    console.warn("Could not fetch resume from Supabase in render route, using fallback data:", err);
  }

  const html = await renderResumeToHtml(templateId, resumeData, resumeTheme, title);

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}
