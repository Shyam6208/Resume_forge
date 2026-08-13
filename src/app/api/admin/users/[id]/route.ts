import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/users/:id
 *
 * Secure admin-only endpoint for fetching a single user's full overview.
 * Returns safe profile info and a list of lightweight resumes.
 *
 * Security:
 *   - requireAdminApi() on every request
 *   - createAdminSupabaseClient() server-only
 *
 * Performance:
 *   - Maximum TWO database reads (1 for profile, 1 for resumes)
 *   - In-memory stat calculation
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
        { error: "User ID is required." },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminSupabaseClient();

    // ── 2. Fetch User Profile ──────────────────────────────────
    const SAFE_COLUMNS = "id, name, email, username, user_type, is_admin, is_guest, avatar_url, created_at, updated_at";
    
    const { data: profile, error: profileError } = await adminSupabase
      .from("profiles")
      .select(SAFE_COLUMNS)
      .eq("id", id)
      .maybeSingle();

    if (profileError) {
      console.error("Admin user detail query error:", profileError.message);
      return NextResponse.json(
        { error: "Unable to load user profile." },
        { status: 500 }
      );
    }

    if (!profile) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      );
    }

    // ── 3. Fetch User Resumes ──────────────────────────────────
    const RESUME_LIGHT_COLUMNS = "id, title, slug, template_id, target_job, is_public, download_count, created_at, updated_at";
    
    const { data: resumesData, error: resumesError } = await adminSupabase
      .from("resumes")
      .select(RESUME_LIGHT_COLUMNS)
      .eq("user_id", id)
      .order("updated_at", { ascending: false });

    if (resumesError) {
      console.error("Admin user resumes query error:", resumesError.message);
      return NextResponse.json(
        { error: "Unable to load user resumes." },
        { status: 500 }
      );
    }

    const resumes = resumesData || [];

    // ── 4. Calculate Stats ─────────────────────────────────────
    let publicResumes = 0;
    let privateResumes = 0;
    let totalDownloads = 0;

    for (const r of resumes) {
      if ((r as any).is_public) {
        publicResumes++;
      } else {
        privateResumes++;
      }
      totalDownloads += ((r as any).download_count || 0);
    }

    return NextResponse.json({
      user: profile,
      stats: {
        totalResumes: resumes.length,
        publicResumes,
        privateResumes,
        totalDownloads
      },
      resumes
    });

  } catch (err) {
    console.error("Admin user detail API unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
