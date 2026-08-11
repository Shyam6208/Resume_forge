import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// Helper to safely extract id parameter fromNext.js params Promise
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
    if (!id) {
      return NextResponse.json({ error: "Missing resume ID" }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Require authentication
    if (!user) {
      return NextResponse.json(
        { error: "Your session has expired. Please sign in again." },
        { status: 401 }
      );
    }

    // Query resume from database
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: resume, error } = await (supabase.from("resumes") as any)
      .select("*")
      .eq("id", id)
      .single();

    if (error || !resume) {
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

// Helper to update resume
async function handleUpdateResume(
  request: Request,
  context: { params: Promise<{ id?: string; resumeId?: string }> }
) {
  try {
    const id = await getResumeId(context.params);
    if (!id) {
      return NextResponse.json({ error: "Missing resume ID" }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Your session has expired. Please sign in again." },
        { status: 401 }
      );
    }

    // Check existing resume ownership
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existingResume } = await (supabase.from("resumes") as any)
      .select("user_id")
      .eq("id", id)
      .single();

    if (existingResume && existingResume.user_id && existingResume.user_id !== user.id) {
      return NextResponse.json(
        { error: "You don't have permission to modify this resume." },
        { status: 403 }
      );
    }

    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
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
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Supabase resume update error:", updateError);
      return NextResponse.json(
        { error: updateError.message || "Failed to update resume in database" },
        { status: 500 }
      );
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
    if (!id) {
      return NextResponse.json({ error: "Missing resume ID" }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
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
      return NextResponse.json({ error: error.message }, { status: 500 });
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
