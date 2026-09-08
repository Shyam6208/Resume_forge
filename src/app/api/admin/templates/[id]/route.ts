import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi, logAdminActivity } from "@/lib/auth/require-admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { deleteCloudinaryImage } from "@/lib/cloudinary";
import { validateTemplateConfig } from "@/lib/templates/template-validator";

async function getAdminDb() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (serviceKey && serviceKey !== "your_supabase_service_role_key_here") {
    try {
      return createAdminSupabaseClient();
    } catch {
      return await createServerSupabaseClient();
    }
  }
  return await createServerSupabaseClient();
}

// GET /api/admin/templates/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdminApi();
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { id } = await params;
  const supabase = await getAdminDb();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: template, error } = await (supabase.from("resume_templates") as any)
    .select("*")
    .or(`id.eq.${id},slug.eq.${id}`)
    .single();

  if (error || !template) {
    return NextResponse.json({ error: "Template not found." }, { status: 404 });
  }

  return NextResponse.json({ template });
}

// PATCH /api/admin/templates/[id] — Update template
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdminApi();
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { user } = authResult;
  const { id } = await params;

  try {
    const body = await request.json();

    // Validate template_config if provided
    let cleanConfig = body.template_config;
    if (body.template_config && typeof body.template_config === "object" && Object.keys(body.template_config).length > 0) {
      const validation = validateTemplateConfig(body.template_config);
      if (!validation.isValid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }
      cleanConfig = validation.config;
    }

    const supabase = await getAdminDb();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    // Only include fields that were sent in the body
    if (body.name !== undefined) updatePayload.name = body.name.trim();
    if (body.slug !== undefined) updatePayload.slug = body.slug.trim();
    if (body.description !== undefined) updatePayload.description = body.description;
    if (body.category !== undefined) updatePayload.category = body.category;
    if (body.tags !== undefined) updatePayload.tags = body.tags;
    if (body.thumbnail_url !== undefined) updatePayload.thumbnail_url = body.thumbnail_url;
    if (body.thumbnail_public_id !== undefined) updatePayload.thumbnail_public_id = body.thumbnail_public_id;
    if (body.template_config_url !== undefined) updatePayload.template_config_url = body.template_config_url;
    if (body.template_config_public_id !== undefined) updatePayload.template_config_public_id = body.template_config_public_id;
    if (cleanConfig !== undefined) updatePayload.template_config = cleanConfig;
    if (body.status !== undefined) updatePayload.status = body.status;
    if (body.is_featured !== undefined) updatePayload.is_featured = Boolean(body.is_featured);
    if (body.is_premium !== undefined) updatePayload.is_premium = Boolean(body.is_premium);
    if (body.is_ats_friendly !== undefined) updatePayload.is_ats_friendly = Boolean(body.is_ats_friendly);
    if (body.ats_rating !== undefined) updatePayload.ats_rating = Number(body.ats_rating);
    if (body.sort_order !== undefined) updatePayload.sort_order = Number(body.sort_order);
    if (body.version !== undefined) {
      updatePayload.version = typeof body.version === "number" ? Math.floor(body.version) : parseInt(String(body.version || 1), 10) || 1;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: updated, error } = await (supabase.from("resume_templates") as any)
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error || !updated) {
      console.error("Update template error:", error);
      return NextResponse.json(
        { error: `Update failed: ${error?.message || "Unknown error"}` },
        { status: 400 }
      );
    }

    await logAdminActivity(user.id, user.email || "", "template_updated", {
      templateId: id,
      name: updated.name,
      fieldsUpdated: Object.keys(updatePayload).filter((k) => k !== "updated_at"),
    });

    return NextResponse.json({ success: true, template: updated });
  } catch (err: unknown) {
    console.error("PATCH template error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update template." },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/templates/[id] — Delete template
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdminApi();
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { user } = authResult;
  const { id } = await params;
  const supabase = await getAdminDb();

  try {
    // Fetch template to get Cloudinary public IDs for cleanup
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: template } = await (supabase.from("resume_templates") as any)
      .select("name, thumbnail_public_id, template_config_public_id")
      .eq("id", id)
      .single();

    // Delete Cloudinary assets if they exist
    if (template?.thumbnail_public_id) {
      try { await deleteCloudinaryImage(template.thumbnail_public_id); } catch { /* ignore */ }
    }
    if (template?.template_config_public_id) {
      try { await deleteCloudinaryImage(template.template_config_public_id, "raw"); } catch { /* ignore */ }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("resume_templates") as any)
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: `Delete failed: ${error.message}` }, { status: 400 });
    }

    await logAdminActivity(user.id, user.email || "", "template_deleted", {
      templateId: id,
      name: template?.name || "Unknown",
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("DELETE template error:", err);
    return NextResponse.json({ error: "Failed to delete template." }, { status: 500 });
  }
}
