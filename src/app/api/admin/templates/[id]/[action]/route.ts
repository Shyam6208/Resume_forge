import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi, logAdminActivity } from "@/lib/auth/require-admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { nanoid } from "nanoid";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; action: string }> }
) {
  const authResult = await requireAdminApi();
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { user } = authResult;
  const { id, action } = await params;
  const supabase = await createServerSupabaseClient();

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: template, error: fetchErr } = await (supabase.from("resume_templates") as any)
      .select("*")
      .eq("id", id)
      .single();

    if (fetchErr || !template) {
      return NextResponse.json({ error: "Template not found." }, { status: 404 });
    }

    if (action === "publish") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: updated } = await (supabase.from("resume_templates") as any)
        .update({ status: "published", updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      await logAdminActivity(user.id, user.email || "", "template_published", {
        templateId: id,
        name: template.name,
      });

      return NextResponse.json({ success: true, status: "published", template: updated });
    }

    if (action === "unpublish") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: updated } = await (supabase.from("resume_templates") as any)
        .update({ status: "draft", updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      await logAdminActivity(user.id, user.email || "", "template_unpublished", {
        templateId: id,
        name: template.name,
      });

      return NextResponse.json({ success: true, status: "draft", template: updated });
    }

    if (action === "archive") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: updated } = await (supabase.from("resume_templates") as any)
        .update({ status: "archived", updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      await logAdminActivity(user.id, user.email || "", "template_archived", {
        templateId: id,
        name: template.name,
      });

      return NextResponse.json({ success: true, status: "archived", template: updated });
    }

    if (action === "duplicate") {
      const newSlug = `${template.slug}-copy-${nanoid(6).toLowerCase()}`;
      const duplicatePayload = {
        name: `${template.name} (Copy)`,
        slug: newSlug,
        description: template.description || "",
        category: template.category || "Modern",
        tags: template.tags || [],
        thumbnail_url: template.thumbnail_url || null,
        thumbnail_public_id: template.thumbnail_public_id || null,
        template_config_url: template.template_config_url || null,
        template_config_public_id: template.template_config_public_id || null,
        template_config: template.template_config || {},
        status: "draft",
        is_featured: false,
        is_premium: template.is_premium || false,
        is_ats_friendly: template.is_ats_friendly ?? true,
        ats_rating: template.ats_rating || 90,
        sort_order: (template.sort_order || 0) + 1,
        version: template.version || "1.0",
        created_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let { data: newRecord, error: dupError } = await (supabase.from("resume_templates") as any)
        .insert(duplicatePayload)
        .select()
        .single();

      if (dupError && (dupError.message.includes("ats_rating") || dupError.code === "PGRST204")) {
        delete (duplicatePayload as Record<string, any>).ats_rating;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const retry = await (supabase.from("resume_templates") as any)
          .insert(duplicatePayload)
          .select()
          .single();
        newRecord = retry.data;
        dupError = retry.error;
      }

      if (dupError || !newRecord) {
        return NextResponse.json(
          { error: `Duplicate failed: ${dupError?.message || "Insert failed"}` },
          { status: 400 }
        );
      }

      await logAdminActivity(user.id, user.email || "", "template_duplicated", {
        originalId: id,
        newId: newRecord.id,
        name: newRecord.name,
      });

      return NextResponse.json({ success: true, template: newRecord }, { status: 201 });
    }

    return NextResponse.json({ error: `Invalid action "${action}".` }, { status: 400 });
  } catch (err: unknown) {
    console.error(`Admin template action ${action} error:`, err);
    return NextResponse.json({ error: "Failed to perform action." }, { status: 500 });
  }
}
