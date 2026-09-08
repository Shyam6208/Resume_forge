import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { TEMPLATES as BUILTIN_TEMPLATES, TemplateConfig } from "@/config/templates.config";

export async function GET() {
  try {
    let supabase;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (serviceKey && serviceKey !== "your_supabase_service_role_key_here") {
      try {
        supabase = createAdminSupabaseClient();
      } catch {
        supabase = await createServerSupabaseClient();
      }
    } else {
      supabase = await createServerSupabaseClient();
    }

    // Query ONLY published templates for public users
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: dbTemplates, error } = await (supabase.from("resume_templates") as any)
      .select("*")
      .eq("status", "published")
      .order("sort_order", { ascending: true });

    let publishedList: TemplateConfig[] = [];

    if (!error && Array.isArray(dbTemplates)) {
      // Format dynamic database templates into standard TemplateConfig shape
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      publishedList = dbTemplates.map((t: any) => ({
        id: t.id || t.slug,
        name: t.name,
        slug: t.slug,
        category: t.category || "Modern",
        atsRating: t.ats_rating || 90,
        tags: t.tags || ["Dynamic"],
        description: t.description || "",
        previewImage: t.thumbnail_url || undefined,
        isFeatured: Boolean(t.is_featured),
        isPremium: Boolean(t.is_premium),
        isDynamic: true,
        templateConfig: t.template_config || null,
      }));
    }

    // Merge built-in templates with published dynamic database templates
    const combinedTemplates = [
      ...BUILTIN_TEMPLATES.map((t) => ({ ...t, isDynamic: false })),
      ...publishedList,
    ];

    return NextResponse.json({ templates: combinedTemplates });
  } catch (err: unknown) {
    console.error("Public templates API error:", err);
    // Graceful fallback to built-in templates
    return NextResponse.json({
      templates: BUILTIN_TEMPLATES.map((t) => ({ ...t, isDynamic: false })),
    });
  }
}
