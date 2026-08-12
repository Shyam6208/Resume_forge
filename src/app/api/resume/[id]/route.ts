import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isValidUUID, generateUUID } from "@/utils/uuid";

export const dynamic = "force-dynamic";

// Helper to safely extract id parameter from Next.js params Promise
async function getResumeId(params: Promise<{ id?: string; resumeId?: string }>): Promise<string> {
  const resolved = await params;
  return resolved.id || resolved.resumeId || "";
}

// OPTIONS handler for CORS / Preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      Allow: "GET, POST, PUT, PATCH, DELETE, OPTIONS",
      "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

// GET /api/resume/[id]
export async function GET(
  request: Request,
  context: { params: Promise<{ id?: string; resumeId?: string }> }
) {
  try {
    const id = await getResumeId(context.params);
    if (!id || !isValidUUID(id)) {
      return NextResponse.json({ error: "Invalid or missing resume UUID" }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Your session has expired. Please sign in again." },
        { status: 401 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: resume, error } = await (supabase.from("resumes") as any)
      .select("*")
      .eq("id", id)
      .single();

    if (error || !resume) {
      if (process.env.NODE_ENV === "development") {
        console.log(`[DEV DIAGNOSTIC] GET /api/resume/${id} not found in DB for user ${user.id}`);
      }
      return NextResponse.json({ error: "Resume not found." }, { status: 404 });
    }

    // Verify ownership
    if (resume.user_id && resume.user_id !== user.id && !resume.is_public) {
      return NextResponse.json(
        { error: "You don't have permission to access this resume." },
        { status: 403 }
      );
    }

    return NextResponse.json(resume, { status: 200 });
  } catch (err: unknown) {
    console.error("GET /api/resume/[id] error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unable to load this resume. Please try again." },
      { status: 500 }
    );
  }
}

// Helper to update or upsert resume
async function handleUpdateResume(
  request: Request,
  context: { params: Promise<{ id?: string; resumeId?: string }> }
) {
  try {
    const rawId = await getResumeId(context.params);
    if (!rawId) {
      return NextResponse.json({ error: "Missing resume ID" }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Your session has expired. Please sign in again." },
        { status: 401 }
      );
    }

    // Ensure rawId is a valid UUID before sending to PostgreSQL UUID column
    const id = isValidUUID(rawId) ? rawId : generateUUID();
    const userId = user.id; // Valid PostgreSQL UUID from Supabase Auth

    const body = await request.json().catch(() => ({}));

    // Check if resume already exists in database
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existingResume } = await (supabase.from("resumes") as any)
      .select("id, user_id, title, slug, template_id, data, theme, section_order, is_public, target_job, created_at")
      .eq("id", id)
      .maybeSingle();

    if (existingResume && existingResume.user_id && existingResume.user_id !== userId) {
      return NextResponse.json(
        { error: "You don't have permission to modify this resume." },
        { status: 403 }
      );
    }

    const now = new Date().toISOString();

    if (!existingResume) {
      // Record missing in DB -> Insert/Upsert new row using valid UUIDs
      const title = body.title || "My Resume";
      const slug = `${title.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${id.slice(0, 8)}`;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: insertError } = await (supabase.from("resumes") as any).upsert(
        {
          id,
          user_id: userId,
          title,
          slug,
          template_id: body.templateId || body.template_id || "minimal-white",
          target_job: body.targetJob || body.target_job || "",
          data: body.data || {},
          theme: body.theme || {},
          section_order: body.sectionOrder || body.section_order || [],
          is_public: body.isPublic ?? body.is_public ?? false,
          created_at: now,
          updated_at: now,
        },
        { onConflict: "id" }
      );

      if (insertError) {
        console.error(`[DEV DIAGNOSTIC] handleUpdateResume insert error for resume ${id}:`, insertError);
        return NextResponse.json(
          { error: insertError.message || "Failed to create resume record in database" },
          { status: 500 }
        );
      }

      if (process.env.NODE_ENV === "development") {
        console.log(`[DEV DIAGNOSTIC] handleUpdateResume inserted new resume ${id} for owner UUID ${userId}`);
      }

      return NextResponse.json(
        { success: true, id, created: true },
        { status: 200 }
      );
    }

    // Record exists -> UPDATE existing row
    const updatePayload: Record<string, unknown> = {
      updated_at: now,
    };

    if (body.title !== undefined) updatePayload.title = body.title;
    if (body.templateId !== undefined || body.template_id !== undefined) {
      updatePayload.template_id = body.templateId || body.template_id;
    }
    if (body.targetJob !== undefined || body.target_job !== undefined) {
      updatePayload.target_job = body.targetJob || body.target_job;
    }
    if (body.data !== undefined) updatePayload.data = body.data;
    if (body.theme !== undefined) updatePayload.theme = body.theme;
    if (body.sectionOrder !== undefined || body.section_order !== undefined) {
      updatePayload.section_order = body.sectionOrder || body.section_order;
    }
    if (body.isPublic !== undefined || body.is_public !== undefined) {
      updatePayload.is_public = body.isPublic ?? body.is_public;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await (supabase.from("resumes") as any)
      .update(updatePayload)
      .eq("id", id)
      .eq("user_id", userId);

    if (updateError) {
      console.error(`[DEV DIAGNOSTIC] handleUpdateResume update error for resume ${id}:`, updateError);
      return NextResponse.json(
        { error: updateError.message || "Failed to update resume in database" },
        { status: 500 }
      );
    }

    if (process.env.NODE_ENV === "development") {
      console.log(`[DEV DIAGNOSTIC] handleUpdateResume updated resume ${id} for owner UUID ${userId}`);
    }

    return NextResponse.json(
      { success: true, id, updated: updatePayload },
      { status: 200 }
    );
  } catch (err: unknown) {
    console.error("Resume update error:", err);
    const errorMessage = err instanceof Error ? err.message : "Failed to update resume";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// PUT /api/resume/[id]
export async function PUT(
  request: Request,
  context: { params: Promise<{ id?: string; resumeId?: string }> }
) {
  return handleUpdateResume(request, context);
}

// PATCH /api/resume/[id]
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id?: string; resumeId?: string }> }
) {
  return handleUpdateResume(request, context);
}

// POST /api/resume/[id]
export async function POST(
  request: Request,
  context: { params: Promise<{ id?: string; resumeId?: string }> }
) {
  return handleUpdateResume(request, context);
}

// DELETE /api/resume/[id]
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id?: string; resumeId?: string }> }
) {
  try {
    const id = await getResumeId(context.params);
    if (!id || !isValidUUID(id)) {
      return NextResponse.json({ error: "Invalid or missing resume UUID" }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Your session has expired. Please sign in again." },
        { status: 401 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("resumes") as any)
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error(`[DEV DIAGNOSTIC] DELETE /api/resume/${id} error:`, error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (process.env.NODE_ENV === "development") {
      console.log(`[DEV DIAGNOSTIC] DELETE /api/resume/${id} deleted resume for owner UUID ${user.id}`);
    }

    return NextResponse.json({ success: true, id }, { status: 200 });
  } catch (err: unknown) {
    console.error("DELETE /api/resume/[id] error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete resume" },
      { status: 500 }
    );
  }
}
