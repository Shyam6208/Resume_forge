import type { Metadata } from "next";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { EditorClient } from "@/components/editor/EditorClient";
import type { Resume, ResumeData, ResumeTheme } from "@/types/resume.types";
import { DEFAULT_THEME, DEFAULT_SECTION_ORDER } from "@/types/resume.types";

export const dynamic = "force-dynamic";

interface EditorPageProps {
  params: Promise<{
    resumeId: string;
  }>;
}

export const metadata: Metadata = {
  title: "Resume Editor — ResumeForge",
  description: "Edit, format, analyze, and export your resume in real time.",
};

// Fallback default resume data template
const DEFAULT_RESUME_DATA: ResumeData = {
  personalInfo: {
    fullName: "Alex Morgan",
    professionalTitle: "Full Stack Engineer",
    email: "alex.morgan@example.com",
    phone: "+1 (555) 234-5678",
    city: "San Francisco",
    country: "United States",
    website: "https://alexmorgan.dev",
    github: "github.com/alexmorgan",
    linkedin: "linkedin.com/in/alexmorgan",
  },
  summary:
    "Results-driven Full Stack Software Engineer with 4+ years of experience architecting high-throughput web applications using React, Next.js, Node.js, and PostgreSQL. Reduced server response latency by 40% and improved Core Web Vitals to 95+.",
  experience: [
    {
      id: "exp-1",
      company: "TechFlow Systems",
      position: "Senior Full Stack Engineer",
      location: "San Francisco, CA",
      startDate: "2022-03",
      isCurrentlyWorking: true,
      responsibilities: [
        "Architected microservice backend using Node.js and PostgreSQL, serving over 150k daily active users with 99.95% uptime.",
        "Engineered responsive React component library with Tailwind CSS, reducing front-end bundle size by 30%.",
        "Automated CI/CD deployment pipelines using GitHub Actions and Docker, reducing release cycle time from 2 days to 15 minutes.",
      ],
    },
  ],
  education: [
    {
      id: "edu-1",
      institution: "University of California, Berkeley",
      degree: "Bachelor of Science",
      branch: "Computer Science",
      grade: "3.8 / 4.0",
      startDate: "2018-08",
      endDate: "2022-05",
      isCurrentlyStudying: false,
    },
  ],
  projects: [
    {
      id: "proj-1",
      name: "ResumeForge App",
      technologies: ["Next.js 15", "TypeScript", "Tailwind CSS", "Zustand"],
      description:
        "Built a free, professional resume builder with live A4 preview, rule-based ATS analysis, and instant PDF export.",
      githubLink: "github.com/alexmorgan/resumeforge",
      liveDemo: "https://resumeforge.vercel.app",
    },
  ],
  skills: {
    frontend: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Redux"],
    backend: ["Node.js", "Express", "PostgreSQL", "REST APIs", "GraphQL"],
    tools: ["Git", "Docker", "VS Code", "Vercel", "Jest"],
  },
};

// Fallback demo resume object for testing / guest editing
const DEMO_RESUME: Resume = {
  id: "test",
  userId: "demo-user",
  title: "Software Engineer Resume",
  slug: "software-engineer-resume",
  templateId: "minimal-white",
  data: DEFAULT_RESUME_DATA,
  theme: DEFAULT_THEME,
  sectionOrder: DEFAULT_SECTION_ORDER,
  isPublic: false,
  downloadCount: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Merge untrusted DB data with default fallbacks to prevent undefined property crashes
function mergeSafeResumeData(raw: unknown): ResumeData {
  if (!raw || typeof raw !== "object") return DEFAULT_RESUME_DATA;

  const data = raw as Partial<ResumeData>;

  return {
    ...DEFAULT_RESUME_DATA,
    ...data,
    personalInfo: {
      ...DEFAULT_RESUME_DATA.personalInfo,
      ...(data.personalInfo || {}),
    },
    skills: {
      ...DEFAULT_RESUME_DATA.skills,
      ...(data.skills || {}),
    },
    experience: Array.isArray(data.experience) ? data.experience : DEFAULT_RESUME_DATA.experience,
    education: Array.isArray(data.education) ? data.education : DEFAULT_RESUME_DATA.education,
    projects: Array.isArray(data.projects) ? data.projects : DEFAULT_RESUME_DATA.projects,
  };
}

export default async function EditorPage({ params }: EditorPageProps) {
  const resolvedParams = await params;
  const { resumeId } = resolvedParams;

  // Allow "test" or "demo" route for instant preview
  if (resumeId === "test" || resumeId === "demo") {
    return <EditorClient initialResume={DEMO_RESUME} />;
  }

  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return <EditorClient initialResume={{ ...DEMO_RESUME, id: resumeId }} />;
    }

    // Query resume from database
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: dbResume, error } = await (supabase.from("resumes") as any)
      .select("*")
      .eq("id", resumeId)
      .eq("user_id", user.id)
      .single();

    if (error || !dbResume) {
      console.warn("Resume not found in Supabase DB for user, using fallback initial object:", error);
      return <EditorClient initialResume={{ ...DEMO_RESUME, id: resumeId, userId: user.id }} />;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const row = dbResume as Record<string, any>;

    const resume: Resume = {
      id: row.id || resumeId,
      userId: row.user_id || user.id,
      title: row.title || "My Resume",
      slug: row.slug || resumeId,
      templateId: row.template_id || "minimal-white",
      data: mergeSafeResumeData(row.data),
      theme: (row.theme as ResumeTheme) || DEFAULT_THEME,
      sectionOrder: Array.isArray(row.section_order) && row.section_order.length > 0 ? row.section_order : DEFAULT_SECTION_ORDER,
      isPublic: row.is_public ?? false,
      targetJob: row.target_job ?? undefined,
      downloadCount: row.download_count ?? 0,
      createdAt: row.created_at || new Date().toISOString(),
      updatedAt: row.updated_at || new Date().toISOString(),
    };

    return <EditorClient initialResume={resume} />;
  } catch (err) {
    console.error("Editor page server error:", err);
    return <EditorClient initialResume={{ ...DEMO_RESUME, id: resumeId }} />;
  }
}
