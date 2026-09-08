import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi, logAdminActivity } from "@/lib/auth/require-admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { validateTemplateConfig } from "@/lib/templates/template-validator";

/**
 * Helper: get a Supabase client for admin database operations.
 * Uses service role key (bypasses RLS) if configured,
 * otherwise returns an error response.
 */
async function getAdminDb() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (serviceKey && serviceKey !== "your_supabase_service_role_key_here") {
    try {
      return createAdminSupabaseClient();
    } catch (err) {
      console.warn("Could not instantiate admin client, falling back to session client:", err);
    }
  }
  return await createServerSupabaseClient();
}

// GET /api/admin/templates — List all templates for admin with filtering & search
export async function GET(request: NextRequest) {
  const authResult = await requireAdminApi();
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const category = searchParams.get("category") || "";
    const featured = searchParams.get("featured");
    const premium = searchParams.get("premium");
    const atsFriendly = searchParams.get("ats_friendly");

    const supabase = await getAdminDb();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase.from("resume_templates") as any)
      .select("*")
      .order("created_at", { ascending: false });

    if (status && status !== "all") {
      query = query.eq("status", status);
    }
    if (category && category !== "all") {
      query = query.eq("category", category);
    }
    if (featured === "true") {
      query = query.eq("is_featured", true);
    }
    if (premium === "true") {
      query = query.eq("is_premium", true);
    }
    if (atsFriendly === "true") {
      query = query.eq("is_ats_friendly", true);
    }

    const { data: rawTemplates, error } = await query;

    if (error) {
      console.warn("Could not query resume_templates table:", error.message);
      // Fallback empty list if table not populated yet
      return NextResponse.json({ templates: [], total: 0 });
    }

    let templates = rawTemplates || [];

    // Client-side text search on Name, Slug, Tags
    if (search.trim()) {
      const term = search.toLowerCase().trim();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      templates = templates.filter((t: any) =>
        t.name?.toLowerCase().includes(term) ||
        t.slug?.toLowerCase().includes(term) ||
        (Array.isArray(t.tags) && t.tags.some((tag: string) => tag.toLowerCase().includes(term)))
      );
    }

    return NextResponse.json({
      templates,
      total: templates.length,
    });
  } catch (err: unknown) {
    console.error("Admin list templates error:", err);
    return NextResponse.json({ error: "Failed to fetch templates." }, { status: 500 });
  }
}

// POST /api/admin/templates — Create a new template record
export async function POST(request: NextRequest) {
  const authResult = await requireAdminApi();
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { user } = authResult;

  try {
    const body = await request.json();

    if (!body.name || !body.slug) {
      return NextResponse.json({ error: "Template Name and Slug are required." }, { status: 400 });
    }

    // Validate JSON configuration if provided
    let cleanConfig = body.template_config || {};
    if (body.template_config) {
      const validation = validateTemplateConfig(body.template_config);
      if (!validation.isValid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }
      cleanConfig = validation.config;
    }

    const supabase = await getAdminDb();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const insertPayload: Record<string, any> = {
      name: body.name.trim(),
      slug: body.slug.toLowerCase().trim(),
      description: body.description || "",
      category: body.category || "Modern",
      tags: Array.isArray(body.tags) ? body.tags : [],
      thumbnail_url: body.thumbnail_url || null,
      thumbnail_public_id: body.thumbnail_public_id || null,
      template_config_url: body.template_config_url || null,
      template_config_public_id: body.template_config_public_id || null,
      template_config: cleanConfig,
      status: body.status || "draft",
      is_featured: Boolean(body.is_featured),
      is_premium: Boolean(body.is_premium),
      is_ats_friendly: Boolean(body.is_ats_friendly ?? true),
      ats_rating: Number(body.ats_rating) || 90,
      sort_order: Number(body.sort_order) || 0,
      version: typeof body.version === "number" ? Math.floor(body.version) : parseInt(String(body.version || 1), 10) || 1,
      created_by: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let newRecord: any = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let error: any = null;

    // Resilient insert: automatically strip columns missing from database schema cache or fix type errors
    const MAX_RETRIES = 10;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      const result = await (supabase.from("resume_templates") as any)
        .insert(insertPayload)
        .select()
        .single();
      newRecord = result.data;
      error = result.error;

      if (!error) break;

      // Extract missing column name from PostgREST error: "Could not find the 'X' column..."
      const colMatch = error.message?.match(/Could not find the '(\w+)' column/);
      if (colMatch && colMatch[1] && insertPayload[colMatch[1]] !== undefined) {
        console.warn(`Schema cache missing column '${colMatch[1]}', stripping and retrying (attempt ${attempt + 1})`);
        delete insertPayload[colMatch[1]];
        continue;
      }

      // If invalid integer syntax error occurs on version, strip or reset to integer 1
      if (error.message?.includes("invalid input syntax for type integer")) {
        console.warn(`Integer syntax mismatch, stripping 'version' column and retrying (attempt ${attempt + 1})`);
        delete insertPayload.version;
        continue;
      }

      // Non-schema-cache error — stop retrying
      break;
    }

    if (error || !newRecord) {
      console.error("Supabase insert template error:", error);
      return NextResponse.json(
        { error: `Database Error: ${error?.message || "Insert failed"}` },
        { status: 400 }
      );
    }

    await logAdminActivity(user.id, user.email || "", "template_created", {
      templateId: newRecord.id,
      name: newRecord.name,
      slug: newRecord.slug,
    });

    return NextResponse.json({ success: true, template: newRecord }, { status: 201 });
  } catch (err: unknown) {
    console.error("Create template error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create template." },
      { status: 500 }
    );
  }
}
