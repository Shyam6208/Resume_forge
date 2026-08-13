import { requireAdminPage } from "@/lib/auth/require-admin";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import { AdminResumeViewer } from "@/components/admin/AdminResumeViewer";
import { ResumeData, ResumeTheme } from "@/types/resume.types";
import { DynamicTemplateConfig } from "@/lib/templates/template-validator";

export const dynamic = "force-dynamic";

export default async function AdminResumeViewPage({ params }: { params: { id: string } }) {
  await requireAdminPage();

  const supabase = createAdminSupabaseClient();
  const resumeId = params.id;

  // Fetch the resume securely using the service role
  const { data: rawResume, error } = await supabase
    .from("resumes")
    .select(`
      id,
      title,
      user_id,
      template_id,
      data,
      theme,
      section_order,
      target_job,
      is_public,
      download_count,
      created_at,
      updated_at
    `)
    .eq("id", resumeId)
    .single();

  if (error || !rawResume) {
    console.error("[ADMIN RESUME VIEWER] Error fetching resume:", error);
    notFound();
  }

  const resume = rawResume as any;

  const { data: rawProfile } = await supabase
    .from("profiles")
    .select("name, email")
    .eq("id", resume.user_id)
    .single();

  const profile = rawProfile as any;

  let templateConfig: DynamicTemplateConfig | null = null;
  // If the template is from the database, we could theoretically fetch its config here.
  // We'll attempt a safe fetch in case it's a dynamic template.
  const { data: rawTemplate } = await supabase
    .from("resume_templates")
    .select("config")
    .eq("id", resume.template_id)
    .single();

  if (rawTemplate) {
    const dbTemplate = rawTemplate as any;
    if (dbTemplate.config) {
      templateConfig = dbTemplate.config as DynamicTemplateConfig;
    }
  }

  const ownerName = profile?.name || "Unknown User";
  const ownerEmail = profile?.email || "No email";

  const resumeData = (resume.data as unknown) as ResumeData;
  if (resume.section_order) {
    (resumeData as any).metadata = {
      ...(resumeData as any).metadata,
      sectionOrder: resume.section_order as string[]
    };
  }

  return (
    <AdminResumeViewer
      resumeId={resume.id}
      title={resume.title || "Untitled Resume"}
      templateId={resume.template_id}
      data={resumeData}
      theme={(resume.theme as unknown) as ResumeTheme}
      isPublic={resume.is_public}
      downloadCount={resume.download_count}
      createdAt={resume.created_at}
      updatedAt={resume.updated_at}
      targetJob={resume.target_job}
      ownerName={ownerName}
      ownerEmail={ownerEmail}
      templateConfig={templateConfig}
    />
  );
}
