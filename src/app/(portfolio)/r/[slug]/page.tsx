import type { Metadata } from "next";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import type { ResumeData } from "@/types/resume.types";
import { PortfolioLiveClient } from "@/components/portfolio/PortfolioLiveClient";

export const dynamic = "force-dynamic";

interface PortfolioPageProps {
  params: Promise<{ slug: string }>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getPublicResume(slugOrId: string): Promise<any | null> {
  try {
    const supabase = createAdminSupabaseClient();

    // 1. Direct lookup by slug
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: bySlug } = await (supabase.from("resumes") as any)
      .select("*")
      .eq("slug", slugOrId)
      .maybeSingle();

    if (bySlug && bySlug.is_public) {
      return bySlug;
    }

    // 2. If slugOrId is a valid UUID, query by id
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);
    if (isUUID) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: byId } = await (supabase.from("resumes") as any)
        .select("*")
        .eq("id", slugOrId)
        .maybeSingle();

      if (byId && byId.is_public) {
        return byId;
      }
    }

    // 3. Fallback: match by 8-char id suffix (e.g. rohan-patel-...-2a827e98)
    const suffix = slugOrId.split("-").pop();
    if (suffix && suffix.length === 8) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: bySuffix } = await (supabase.from("resumes") as any)
        .select("*")
        .ilike("id", `${suffix}%`)
        .maybeSingle();

      if (bySuffix && bySuffix.is_public) {
        return bySuffix;
      }
    }

    return null;
  } catch (err) {
    console.error("getPublicResume error:", err);
    return null;
  }
}

export async function generateMetadata({ params }: PortfolioPageProps): Promise<Metadata> {
  const { slug } = await params;
  const resume = await getPublicResume(slug);

  if (!resume) {
    return { title: "Resume Not Found — ResumeForge" };
  }

  const data = (resume.data || {}) as ResumeData;
  const name = data.personalInfo?.fullName || "Professional";
  const title = data.personalInfo?.professionalTitle || resume.target_job || "Portfolio";

  return {
    title: `${name} — ${title} | Live Portfolio`,
    description: data.summary?.substring(0, 160) || `${name}'s live interactive portfolio and verified resume.`,
    openGraph: {
      title: `${name} — ${title}`,
      description: data.summary?.substring(0, 160) || `View ${name}'s verified real-time resume.`,
      type: "profile",
    },
  };
}

export default async function PortfolioPage({ params }: PortfolioPageProps) {
  const { slug } = await params;
  const resume = await getPublicResume(slug);

  if (!resume) {
    notFound();
  }

  return (
    <PortfolioLiveClient
      initialResume={{
        id: resume.id,
        slug: resume.slug || resume.id,
        title: resume.title || "My Resume",
        data: (resume.data || {}) as ResumeData,
        target_job: resume.target_job || "",
        updated_at: resume.updated_at || new Date().toISOString(),
      }}
    />
  );
}
