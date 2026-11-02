import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Lock, ArrowLeft } from "lucide-react";
import type { ResumeData } from "@/types/resume.types";
import { PortfolioLiveClient } from "@/components/portfolio/PortfolioLiveClient";
import type { Database } from "@/types/database.types";

export const dynamic = "force-dynamic";

interface PortfolioPageProps {
  params: Promise<{ slug: string }>;
}

interface PublicResumeResult {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resume: any | null;
  isPrivate?: boolean;
}

/**
 * Returns a Supabase client suitable for fetching public resumes.
 * Uses service role key if available (server-side), or falls back to anon key.
 */
function getSupabaseClient() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://xgzipfxdscuhubczqlil.supabase.co";

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (serviceKey && serviceKey !== "your_supabase_service_role_key_here") {
    try {
      return createClient<Database>(url, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
    } catch (e) {
      console.warn("Could not create admin Supabase client, using public client:", e);
    }
  }

  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    "sb_publishable_TyWTrgOT74ppfpcVBD6gew_bzQeYVoO";

  return createClient<Database>(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getPublicResume(slugOrId: string): Promise<PublicResumeResult> {
  try {
    const supabase = getSupabaseClient();
    const cleanSlug = decodeURIComponent(slugOrId).trim();

    // 1. Direct lookup by exact slug
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let { data: row } = await (supabase.from("resumes") as any)
      .select("*")
      .eq("slug", cleanSlug)
      .maybeSingle();

    // 2. Case-insensitive slug lookup
    if (!row) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: ilikeRow } = await (supabase.from("resumes") as any)
        .select("*")
        .ilike("slug", cleanSlug)
        .maybeSingle();
      row = ilikeRow;
    }

    // 3. If cleanSlug is a valid UUID, query by id
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanSlug);
    if (!row && isUUID) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: byId } = await (supabase.from("resumes") as any)
        .select("*")
        .eq("id", cleanSlug)
        .maybeSingle();
      row = byId;
    }

    // 4. Fallback: match by 8-char id suffix (e.g. rohan-patel-...-2a827e98)
    if (!row) {
      const suffix = cleanSlug.split("-").pop();
      if (suffix && suffix.length === 8 && /^[0-9a-f]{8}$/i.test(suffix)) {
        // Query slug ending with suffix (do not use ilike on UUID column "id")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: bySuffix } = await (supabase.from("resumes") as any)
          .select("*")
          .ilike("slug", `%${suffix}%`)
          .maybeSingle();
        row = bySuffix;
      }
    }

    if (!row) {
      return { resume: null };
    }

    if (!row.is_public) {
      return { resume: null, isPrivate: true };
    }

    return { resume: row };
  } catch (err) {
    console.error("getPublicResume error:", err);
    return { resume: null };
  }
}

export async function generateMetadata({ params }: PortfolioPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getPublicResume(slug);
  const resume = result.resume;

  if (!resume) {
    if (result.isPrivate) {
      return { title: "Private Portfolio — ResumeForge" };
    }
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
  const result = await getPublicResume(slug);

  // If the resume exists in DB but is set to private
  if (result.isPrivate) {
    return (
      <div className="min-h-screen bg-[#0B0F17] text-slate-200 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full p-8 rounded-3xl bg-card/85 backdrop-blur-xl border border-white/[0.08] shadow-2xl space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-black text-white tracking-tight">
              This Portfolio is Private
            </h1>
            <p className="text-xs text-muted-foreground leading-relaxed">
              The owner of this resume has currently set its visibility to private. If you are the owner, open this resume in the editor and enable <strong>Public Portfolio</strong> in the Share menu.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-400 text-slate-950 text-xs font-bold shadow-lg shadow-cyan-500/20 hover:opacity-95 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go to Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!result.resume) {
    notFound();
  }

  const resume = result.resume;

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

