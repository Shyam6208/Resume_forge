import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/users
 *
 * Secure admin-only endpoint for paginated user management.
 *
 * Query params:
 *   page     – 1-indexed page number (default 1)
 *   pageSize – rows per page (default 20, max 100)
 *   search   – case-insensitive partial match on name or email
 *
 * Security:
 *   - requireAdminApi() verifies the caller is an authenticated admin
 *   - createAdminSupabaseClient() uses the service-role key (server-only, bypasses RLS)
 *   - Only safe profile columns are selected — never passwords, tokens, or auth secrets
 *
 * Resume counts are fetched in a single aggregated query to avoid N+1.
 */
export async function GET(request: NextRequest) {
  // ── 1. Admin Authorization (server-side) ─────────────────────
  const authResult = await requireAdminApi();
  if (authResult instanceof NextResponse) {
    return authResult; // 401 or 403
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "20", 10)));
    const search = (searchParams.get("search") || "").trim();

    // ── 2. Service-role client (server-only, bypasses RLS) ─────
    const adminSupabase = createAdminSupabaseClient();

    // ── 3. Build profiles query (safe columns only) ────────────
    const SAFE_COLUMNS = "id, name, email, avatar_url, username, user_type, is_admin, is_guest, created_at, updated_at";

    let countQuery = adminSupabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    let dataQuery = adminSupabase
      .from("profiles")
      .select(SAFE_COLUMNS)
      .order("created_at", { ascending: false });

    // ── 4. Apply search filter (server-side, case-insensitive) ─
    if (search) {
      const filter = `name.ilike.%${search}%,email.ilike.%${search}%`;
      countQuery = countQuery.or(filter);
      dataQuery = dataQuery.or(filter);
    }

    // ── 5. Pagination (range-based) ────────────────────────────
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    dataQuery = dataQuery.range(from, to);

    // ── 6. Execute both queries in parallel ────────────────────
    const [countResult, dataResult] = await Promise.all([
      countQuery,
      dataQuery,
    ]);

    if (dataResult.error) {
      console.error("Admin users data query error:", dataResult.error.message);
      return NextResponse.json(
        { error: "Unable to load users." },
        { status: 500 }
      );
    }

    const totalCount = countResult.count ?? 0;
    const profiles = dataResult.data ?? [];

    // ── 7. Aggregate resume counts (single query, no N+1) ──────
    // Fetch counts for all user IDs on this page in one request.
    const userIds = profiles.map((p: { id: string }) => p.id);
    const resumeCountMap: Record<string, number> = {};

    if (userIds.length > 0) {
      // Use a grouped count approach: fetch resume rows with only user_id,
      // then aggregate client-side. This avoids an RPC and works with
      // standard Supabase PostgREST.
      const { data: resumeRows, error: resumeError } = await adminSupabase
        .from("resumes")
        .select("user_id")
        .in("user_id", userIds);

      if (!resumeError && resumeRows) {
        for (const row of resumeRows) {
          const uid = (row as { user_id: string }).user_id;
          resumeCountMap[uid] = (resumeCountMap[uid] || 0) + 1;
        }
      }
    }

    // ── 8. Merge resume counts into profiles ───────────────────
    interface SafeProfile {
      id: string;
      name: string | null;
      email: string;
      avatar_url: string | null;
      username: string | null;
      user_type: string | null;
      is_admin: boolean;
      is_guest: boolean;
      created_at: string;
      updated_at: string;
    }

    const usersWithCounts = profiles.map((p: SafeProfile) => ({
      ...p,
      resume_count: resumeCountMap[p.id] || 0,
    }));

    return NextResponse.json({
      users: usersWithCounts,
      totalCount,
      page,
      pageSize,
    });
  } catch (err) {
    console.error("Admin users API unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
