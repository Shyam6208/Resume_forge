import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { nanoid } from "nanoid";
import type { Resume, ResumeData, ResumeTheme, UserType, SectionKey } from "@/types/resume.types";
import { DEFAULT_THEME, DEFAULT_SECTION_ORDER } from "@/types/resume.types";
import { SECTION_ORDER_BY_USER_TYPE } from "@/config/sections.config";

export const dynamic = "force-dynamic";

const DEFAULT_RESUME_DATA: ResumeData = {
  personalInfo: {
    fullName: "Alex Morgan",
    professionalTitle: "Software Developer",
    email: "alex.morgan@example.com",
    phone: "+1 (555) 234-5678",
    address: "San Francisco, CA",
    linkedin: "linkedin.com/in/alexmorgan",
    github: "github.com/alexmorgan",
  },
  summary:
    "Passionate and results-oriented professional with experience designing, developing, and deploying modern software applications.",
  experience: [
    {
      id: "exp-1",
      company: "Tech Solutions Inc",
      position: "Frontend Developer",
      location: "San Francisco, CA",
      startDate: "2022-01",
      endDate: "",
      isCurrentlyWorking: true,
      description: "Leading frontend development using Next.js and TypeScript.",
      responsibilities: [
        "Developed and maintained core web applications using React and Next.js",
        "Collaborated with UI/UX designers to implement responsive component libraries",
      ],
    },
  ],
  education: [
    {
      id: "edu-1",
      institution: "State University",
      degree: "B.S. in Computer Science",
      branch: "Computer Science",
      grade: "3.8 GPA",
      startDate: "2018-09",
      endDate: "2022-05",
      isCurrentlyStudying: false,
    },
  ],
  projects: [
    {
      id: "proj-1",
      name: "Portfolio & Resume Builder",
      technologies: ["React", "Next.js", "Tailwind CSS"],
      description: "Open-source application for building high-converting resumes.",
      highlights: ["Built with Next.js App Router and Zustand"],
    },
  ],
  skills: {
    frontend: ["React", "Next.js", "TypeScript", "Tailwind CSS"],
    backend: ["Node.js", "Express", "PostgreSQL"],
    tools: ["Git", "VS Code", "Vercel"],
  },
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title = "My Resume",
      userType = "developer" as UserType,
      templateId = "minimal-white",
      targetJob = "",
      sectionOrder: payloadSectionOrder,
      data: payloadData,
      theme: payloadTheme,
    } = body || {};

    let userId = "guest_user";
    let supabase = null;

    try {
      supabase = await createServerSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        userId = user.id;
      }
    } catch {
      // Guest or local fallback
    }

    const id = nanoid();
    const slug = `${title.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${id.slice(0, 6)}`;
    const sectionOrder: SectionKey[] =
      payloadSectionOrder || SECTION_ORDER_BY_USER_TYPE[userType as UserType] || DEFAULT_SECTION_ORDER;

    const resumeData: ResumeData = payloadData || DEFAULT_RESUME_DATA;
    const resumeTheme: ResumeTheme = payloadTheme || DEFAULT_THEME;

    const newResume: Resume = {
      id,
      userId,
      title,
      slug,
      templateId,
      targetJob,
      data: resumeData,
      theme: resumeTheme,
      sectionOrder,
      isPublic: false,
      downloadCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (supabase && userId !== "guest_user") {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from("resumes") as any).insert({
          id,
          user_id: userId,
          title,
          slug,
          template_id: templateId,
          target_job: targetJob,
          data: resumeData,
          theme: resumeTheme,
          section_order: sectionOrder,
          is_public: false,
          created_at: newResume.createdAt,
          updated_at: newResume.updatedAt,
        });
      } catch (err) {
        console.warn("Could not insert resume into Supabase, returning local resume object:", err);
      }
    }

    return NextResponse.json(newResume, { status: 201 });
  } catch (err: unknown) {
    console.error("POST /api/resume error:", err);
    const errorMessage = err instanceof Error ? err.message : "Failed to create resume";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json([], { status: 200 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: resumes } = await (supabase.from("resumes") as any)
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    return NextResponse.json(resumes || [], { status: 200 });
  } catch (err: unknown) {
    console.error("GET /api/resume error:", err);
    return NextResponse.json([], { status: 200 });
  }
}
