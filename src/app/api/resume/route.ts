import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { isValidUUID, generateUUID } from "@/utils/uuid";
import type { Resume, ResumeData, ResumeTheme, UserType, SectionKey } from "@/types/resume.types";
import { DEFAULT_THEME, DEFAULT_SECTION_ORDER } from "@/types/resume.types";
import { SECTION_ORDER_BY_USER_TYPE } from "@/config/sections.config";
import { normalizeTemplateData } from "@/lib/templates/normalize-template-data";

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
    const body = await request.json().catch(() => ({}));
    const {
      id: customId,
      title = "My Resume",
      userType = "developer" as UserType,
      templateId = "minimal-white",
      targetJob = "",
      sectionOrder: payloadSectionOrder,
      data: payloadData,
      theme: payloadTheme,
      templateConfig: payloadTemplateConfig,
    } = body || {};

    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    // Enforce server-side authentication for database persistence
    if (authErr || !user) {
      if (process.env.NODE_ENV === "development") {
        console.log("[DEV DIAGNOSTIC] POST /api/resume called without authenticated Supabase user.");
      }
      return NextResponse.json(
        { error: "Authentication required to save resume to database." },
        { status: 401 }
      );
    }

    const userId = user.id; // Valid PostgreSQL UUID from Supabase Auth Session
    const id = (customId && isValidUUID(customId)) ? customId : generateUUID(); // Valid PostgreSQL UUID
    const slug = `${title.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${id.slice(0, 8)}`;
    const sectionOrder: SectionKey[] =
      payloadSectionOrder || SECTION_ORDER_BY_USER_TYPE[userType as UserType] || DEFAULT_SECTION_ORDER;

    const BUILTIN_IDS = ["minimal-white", "corporate-pro", "fresher-basic", "dev-template", "modern-pro"];
    let finalTemplateConfig = payloadTemplateConfig || null;

    if (!finalTemplateConfig && templateId && !BUILTIN_IDS.includes(templateId)) {
      try {
        let dbClient;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (serviceKey && serviceKey !== "your_supabase_service_role_key_here") {
          try {
            dbClient = createAdminSupabaseClient();
          } catch {
            dbClient = supabase;
          }
        } else {
          dbClient = supabase;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: tmpl } = await (dbClient.from("resume_templates") as any)
          .select("template_config")
          .or(`id.eq.${templateId},slug.eq.${templateId}`)
          .single();
        if (tmpl?.template_config) {
          finalTemplateConfig = tmpl.template_config;
        }
      } catch {
        // ignore fallback
      }
    }

    let resumeData: ResumeData = payloadData;
    if (!resumeData && finalTemplateConfig) {
      resumeData = normalizeTemplateData(finalTemplateConfig, DEFAULT_RESUME_DATA);
    }
    if (!resumeData) {
      resumeData = DEFAULT_RESUME_DATA;
    }

    let resumeTheme: ResumeTheme = payloadTheme;
    if (!resumeTheme && finalTemplateConfig?.themeOverrides) {
      resumeTheme = {
        ...DEFAULT_THEME,
        ...finalTemplateConfig.themeOverrides,
      };
    }
    if (!resumeTheme) {
      resumeTheme = DEFAULT_THEME;
    }

    const newResume: Resume = {
      id,
      userId,
      title,
      slug,
      templateId,
      templateConfig: finalTemplateConfig,
      targetJob,
      data: resumeData,
      theme: resumeTheme,
      sectionOrder,
      isPublic: false,
      downloadCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: upsertError } = await (supabase.from("resumes") as any).upsert(
      {
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
      },
      { onConflict: "id" }
    );

    if (upsertError) {
      console.error(
        `[DEV DIAGNOSTIC] POST /api/resume Supabase upsert error for user ${userId}:`,
        upsertError
      );
      return NextResponse.json(
        { error: upsertError.message || "Database insert failed" },
        { status: 500 }
      );
    }

    if (process.env.NODE_ENV === "development") {
      console.log(
        `[DEV DIAGNOSTIC] POST /api/resume created/upserted valid UUID resume "${title}" (${id}) for owner UUID ${userId}`
      );
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
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      if (process.env.NODE_ENV === "development") {
        console.log("[DEV DIAGNOSTIC] GET /api/resume requested by unauthenticated user.");
      }
      return NextResponse.json([], { status: 200 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: rawResumes, error: queryError } = await (supabase.from("resumes") as any)
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (queryError) {
      console.error(
        `[DEV DIAGNOSTIC] GET /api/resume query error for user ${user.id}:`,
        queryError
      );
      return NextResponse.json({ error: queryError.message }, { status: 500 });
    }

    if (process.env.NODE_ENV === "development") {
      console.log(
        `[DEV DIAGNOSTIC] GET /api/resume returned ${rawResumes?.length || 0} resumes for user ${user.id}`
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resumes: Resume[] = (rawResumes || []).map((r: any) => ({
      id: r.id,
      userId: r.user_id || user.id,
      title: r.title || "My Resume",
      slug: r.slug || r.id,
      templateId: r.template_id || "minimal-white",
      data: r.data || {},
      theme: r.theme || {},
      sectionOrder: r.section_order || [],
      isPublic: r.is_public ?? false,
      targetJob: r.target_job || "",
      downloadCount: r.download_count || 0,
      createdAt: r.created_at || new Date().toISOString(),
      updatedAt: r.updated_at || new Date().toISOString(),
    }));

    return NextResponse.json(resumes, { status: 200 });
  } catch (err: unknown) {
    console.error("GET /api/resume error:", err);
    return NextResponse.json([], { status: 200 });
  }
}
