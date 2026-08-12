import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi, logAdminActivity } from "@/lib/auth/require-admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { deleteCloudinaryImage } from "@/lib/cloudinary";
import { validateTemplateConfig } from "@/lib/templates/template-validator";

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
  const supabase = await createServerSupabaseClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: template, error } = await (supabase.from("resume_templates") as any)
    .select("*")
    .eq("id", id)
    .single();

  if (error || !template) {
    return NextResponse.json({ error: "Template not found." }, { status: 404 });
  }

  return NextResponse.json({ template });
}

// PATCH /api/admin/templates/[id]
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
  const body = await request.json();

  try {
    const supabase = await createServerSupabaseClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existing } = await (supabase.from("resume_templates") as any)
      .select("*")
      .eq("id", id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: "Template not found." }, { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (body.name !== undefined) updatePayload.name = body.name.trim();
    if (body.slug !== undefined) updatePayload.slug = body.slug.toLowerCase().trim();
    if (body.description !== undefined) updatePayload.description = body.description;
    if (body.category !== undefined) updatePayload.category = body.category;
    if (body.tags !== undefined) updatePayload.tags = Array.isArray(body.tags) ? body.tags : [];
    if (body.thumbnail_url !== undefined) updatePayload.thumbnail_url = body.thumbnail_url;
    if (body.thumbnail_public_id !== undefined) updatePayload.thumbnail_public_id = body.thumbnail_public_id;
    if (body.template_config_url !== undefined) updatePayload.template_config_url = body.template_config_url;
    if (body.template_config_public_id !== undefined) updatePayload.template_config_public_id = body.template_config_public_id;
    if (body.status !== undefined) updatePayload.status = body.status;
    if (body.is_featured !== undefined) updatePayload.is_featured = Boolean(body.is_featured);
    if (body.is_premium !== undefined) updatePayload.is_premium = Boolean(body.is_premium);
    if (body.is_ats_friendly !== undefined) updatePayload.is_ats_friendly = Boolean(body.is_ats_friendly);
    if (body.ats_rating !== undefined) updatePayload.ats_rating = Number(body.ats_rating);
    if (body.sort_order !== undefined) updatePayload.sort_order = Number(body.sort_order);
    if (body.version !== undefined) updatePayload.version = body.version;

    if (body.template_config !== undefined) {
      const validation = validateTemplateConfig(body.template_config);
      if (!validation.isValid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }
      updatePayload.template_config = validation.config;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let { data: updated, error } = await (supabase.from("resume_templates") as any)
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    // Fallback if ats_rating column does not exist in schema cache yet
    if (error && (error.message.includes("ats_rating") || error.code === "PGRST204")) {
      delete updatePayload.ats_rating;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const retry = await (supabase.from("resume_templates") as any)
        .update(updatePayload)
        .eq("id", id)
        .select()
        .single();
      updated = retry.data;
      error = retry.error;
    }

    if (error || !updated) {
      return NextResponse.json({ error: `Update failed: ${error?.message || "Update failed"}` }, { status: 400 });
    }

    // If thumbnail was replaced, clean up old Cloudinary preview asset safely
    if (
      body.thumbnail_public_id &&
      existing.thumbnail_public_id &&
      body.thumbnail_public_id !== existing.thumbnail_public_id
    ) {
      await deleteCloudinaryImage(existing.thumbnail_public_id, "image");
    }

    await logAdminActivity(user.id, user.email || "", "template_updated", {
      templateId: id,
      name: updated.name,
    });

    return NextResponse.json({ success: true, template: updated });
  } catch (err: unknown) {
    console.error("Update template error:", err);
    return NextResponse.json({ error: "Failed to update template." }, { status: 500 });
  }
}

// DELETE /api/admin/templates/[id]
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
  const supabase = await createServerSupabaseClient();

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existing } = await (supabase.from("resume_templates") as any)
      .select("*")
      .eq("id", id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: "Template not found." }, { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("resume_templates") as any)
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: `Delete failed: ${error.message}` }, { status: 400 });
    }

    // Clean up Cloudinary assets if present
    if (existing.thumbnail_public_id) {
      await deleteCloudinaryImage(existing.thumbnail_public_id, "image");
    }
    if (existing.template_config_public_id) {
      await deleteCloudinaryImage(existing.template_config_public_id, "raw");
    }

    await logAdminActivity(user.id, user.email || "", "template_deleted", {
      templateId: id,
      name: existing.name,
    });

    return NextResponse.json({ success: true, message: "Template deleted successfully." });
  } catch (err: unknown) {
    console.error("Delete template error:", err);
    return NextResponse.json({ error: "Failed to delete template." }, { status: 500 });
  }
}
