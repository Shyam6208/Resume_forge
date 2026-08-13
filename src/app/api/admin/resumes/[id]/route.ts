import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi, logAdminActivity } from "@/lib/auth/require-admin";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/resumes/:id
 *
 * Secure admin-only endpoint for fetching a single resume's full data.
 * Used by the details modal to show section summary and calculate ATS score.
 *
 * Security:
 *   - requireAdminApi() on every request
 *   - createAdminSupabaseClient() server-only
 *
 * This endpoint returns full ResumeData for ONE resume only.
 * Zero database writes. Zero Gemini/AI calls.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // ── 1. Admin Authorization ───────────────────────────────────
  const authResult = await requireAdminApi();
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Resume ID is required." },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminSupabaseClient();

    // ── 2. Fetch full resume (including data for ATS score) ────
    const { data: resume, error } = await adminSupabase
      .from("resumes")
      .select("id, user_id, title, slug, template_id, data, target_job, is_public, download_count, section_order, created_at, updated_at")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("Admin resume detail query error:", error.message);
      return NextResponse.json(
        { error: "Unable to load resume." },
        { status: 500 }
      );
    }

    if (!resume) {
      return NextResponse.json(
        { error: "Resume not found." },
        { status: 404 }
      );
    }

    // ── 3. Fetch owner profile ─────────────────────────────────
    const { data: profile } = await adminSupabase
      .from("profiles")
      .select("id, name, email, username")
      .eq("id", (resume as { user_id: string }).user_id)
      .maybeSingle();

    const ownerProfile = profile as { id: string; name: string | null; email: string; username: string | null } | null;

    return NextResponse.json({
      resume: {
        ...(resume as Record<string, unknown>),
        owner_name: ownerProfile?.name || ownerProfile?.username || ownerProfile?.email?.split("@")[0] || "Unknown",
        owner_email: ownerProfile?.email || "—",
      },
    });
  } catch (err) {
    console.error("Admin resume detail API unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/resumes/:id
 *
 * Admin-only endpoint to toggle a resume's visibility (is_public).
 *
 * Accepts ONLY: { "isPublic": true | false }
 * Rejects any additional fields, non-boolean values, or malformed JSON.
 *
 * No-op: If the requested value matches the current value, no UPDATE is
 * performed and no audit log is created.
 *
 * Security:
 *   - requireAdminApi() on every request
 *   - createAdminSupabaseClient() server-only
 *   - Only is_public is modified — never data, theme, title, or any other field
 *
 * Database writes: 1 UPDATE when value changes, 0 for no-op.
 * Gemini/AI calls: 0.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // ── 1. Admin Authorization ───────────────────────────────────
  const authResult = await requireAdminApi();
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { user } = authResult;

  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Resume ID is required." },
        { status: 400 }
      );
    }

    // ── 2. Parse and strictly validate the request body ─────────
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body." },
        { status: 400 }
      );
    }

    // Reject unknown fields — only "isPublic" is allowed
    const allowedKeys = ["isPublic"];
    const receivedKeys = Object.keys(body);
    const unknownKeys = receivedKeys.filter((k) => !allowedKeys.includes(k));

    if (unknownKeys.length > 0) {
      return NextResponse.json(
        { error: `Unknown fields are not allowed: ${unknownKeys.join(", ")}` },
        { status: 400 }
      );
    }

    if (!("isPublic" in body)) {
      return NextResponse.json(
        { error: "Missing required field: isPublic (boolean)." },
        { status: 400 }
      );
    }

    if (typeof body.isPublic !== "boolean") {
      return NextResponse.json(
        { error: "isPublic must be a boolean (true or false)." },
        { status: 400 }
      );
    }

    const requestedIsPublic = body.isPublic;

    // ── 3. Fetch current resume state ──────────────────────────
    const adminSupabase = createAdminSupabaseClient();

    const { data: existing, error: fetchError } = await adminSupabase
      .from("resumes")
      .select("id, is_public")
      .eq("id", id)
      .maybeSingle();

    if (fetchError) {
      console.error("Admin resume visibility fetch error:", fetchError.message);
      return NextResponse.json(
        { error: "Unable to verify resume." },
        { status: 500 }
      );
    }

    if (!existing) {
      return NextResponse.json(
        { error: "Resume not found." },
        { status: 404 }
      );
    }

    const currentIsPublic = (existing as { is_public: boolean }).is_public;

    // ── 4. No-op check ─────────────────────────────────────────
    if (currentIsPublic === requestedIsPublic) {
      return NextResponse.json({
        success: true,
        changed: false,
        isPublic: currentIsPublic,
        message: "Visibility is already set to the requested value.",
      });
    }

    // ── 5. Perform targeted update (is_public ONLY) ────────────
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await (adminSupabase.from("resumes") as any)
      .update({ is_public: requestedIsPublic })
      .eq("id", id);

    if (updateError) {
      console.error("Admin resume visibility update error:", updateError.message);
      return NextResponse.json(
        { error: "Failed to update resume visibility." },
        { status: 500 }
      );
    }

    // ── 6. Audit log (only when value actually changed) ────────
    await logAdminActivity(
      user.id,
      user.email || "",
      "resume_visibility_changed",
      {
        resumeId: id,
        previousIsPublic: currentIsPublic,
        newIsPublic: requestedIsPublic,
      }
    );

    return NextResponse.json({
      success: true,
      changed: true,
      isPublic: requestedIsPublic,
      message: `Resume visibility changed to ${requestedIsPublic ? "public" : "private"}.`,
    });
  } catch (err) {
    console.error("Admin resume visibility PATCH unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
