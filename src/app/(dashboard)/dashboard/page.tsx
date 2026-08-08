import type { Metadata } from "next";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { DashboardClient } from "@/components/dashboard/DashboardClient";
import type { Resume } from "@/types/resume.types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard — ResumeForge",
  description: "Manage, edit, score, and export your ATS-optimized resume documents.",
};

export default async function DashboardPage() {
  let resumes: Resume[] = [];
  let userEmail = "";

  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      userEmail = user.email || "";
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: rawResumes } = await (supabase.from("resumes") as any)
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (rawResumes && Array.isArray(rawResumes)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resumes = rawResumes.map((r: any) => ({
          id: r.id,
          userId: r.user_id || r.userId || user.id,
          title: r.title || "My Resume",
          slug: r.slug || r.id,
          templateId: r.template_id || r.templateId || "minimal-white",
          data: r.data || {},
          theme: r.theme || {},
          sectionOrder: r.section_order || r.sectionOrder || [],
          isPublic: r.is_public ?? false,
          targetJob: r.target_job || r.targetJob || "",
          downloadCount: r.download_count || 0,
          createdAt: r.created_at || new Date().toISOString(),
          updatedAt: r.updated_at || new Date().toISOString(),
        }));
      }
    }
  } catch (err) {
    console.warn("Could not fetch user resumes from Supabase on dashboard server component:", err);
  }

  return <DashboardClient initialResumes={resumes} userEmail={userEmail} />;
}
