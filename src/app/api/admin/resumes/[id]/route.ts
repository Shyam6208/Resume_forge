import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin";
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
