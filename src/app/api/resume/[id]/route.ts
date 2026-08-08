import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

async function handleUpdateResume(request: Request, id: string) {
  try {
    const body = await request.json().catch(() => ({}));
    const supabase = await createServerSupabaseClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

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

    if (user) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase.from("resumes") as any)
          .update(updatePayload)
          .eq("id", id)
          .eq("user_id", user.id);

        if (error) {
          console.warn("Supabase resume update error:", error);
        }
      } catch (dbErr) {
        console.warn("Supabase connection warning during resume update:", dbErr);
      }
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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: resume, error } = await (supabase.from("resumes") as any)
      .select("*")
      .eq("id", id)
      .single();

    if (error || !resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    return NextResponse.json(resume, { status: 200 });
  } catch (err: unknown) {
    console.error("GET /api/resume/[id] error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch resume" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handleUpdateResume(request, id);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handleUpdateResume(request, id);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handleUpdateResume(request, id);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from("resumes") as any)
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);
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
