import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/resumes
 *
 * Secure admin-only endpoint for paginated resume management.
 *
 * Query params:
 *   page       – 1-indexed page number (default 1)
 *   pageSize   – rows per page (default 20, max 100)
 *   search     – case-insensitive partial match on title or target_job
 *   userId     – filter by owner user_id
 *   templateId – filter by template_id
 *   sort       – one of: updated_desc, updated_asc, created_desc, created_asc, title_asc, title_desc
 *
 * Security:
 *   - requireAdminApi() verifies the caller is an authenticated admin
 *   - createAdminSupabaseClient() uses service-role key (server-only, bypasses RLS)
 *
 * Performance:
 *   - Does NOT return data/theme/section_order (heavy JSONB columns) for list view
 *   - Owner profiles fetched in one batch query (no N+1)
 *   - Zero database writes
 *   - Zero Gemini/AI calls
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
    const userId = (searchParams.get("userId") || "").trim();
    const templateId = (searchParams.get("templateId") || "").trim();
    const sort = (searchParams.get("sort") || "updated_desc").trim();

    // ── 2. Service-role client (server-only) ───────────────────
    const adminSupabase = createAdminSupabaseClient();

    // ── 3. Build query — LIGHT columns only (no data/theme/section_order) ──
    const LIGHT_COLUMNS = "id, user_id, title, slug, template_id, target_job, is_public, download_count, created_at, updated_at";

    // Determine sort column and direction
    let sortColumn = "updated_at";
    let sortAscending = false;
    switch (sort) {
      case "updated_asc":
        sortColumn = "updated_at";
        sortAscending = true;
        break;
      case "created_desc":
        sortColumn = "created_at";
        sortAscending = false;
        break;
      case "created_asc":
        sortColumn = "created_at";
        sortAscending = true;
        break;
      case "title_asc":
        sortColumn = "title";
        sortAscending = true;
        break;
      case "title_desc":
        sortColumn = "title";
        sortAscending = false;
        break;
      default: // updated_desc
        sortColumn = "updated_at";
        sortAscending = false;
    }

    let countQuery = adminSupabase
      .from("resumes")
      .select("*", { count: "exact", head: true });

    let dataQuery = adminSupabase
      .from("resumes")
      .select(LIGHT_COLUMNS)
      .order(sortColumn, { ascending: sortAscending });

    // ── 4. Apply filters ───────────────────────────────────────
    if (userId) {
      countQuery = countQuery.eq("user_id", userId);
      dataQuery = dataQuery.eq("user_id", userId);
    }

    if (templateId) {
      countQuery = countQuery.eq("template_id", templateId);
      dataQuery = dataQuery.eq("template_id", templateId);
    }

    if (search) {
      // Search on title and target_job (server-side)
      const filter = `title.ilike.%${search}%,target_job.ilike.%${search}%`;
      countQuery = countQuery.or(filter);
      dataQuery = dataQuery.or(filter);
    }

    // ── 5. Pagination ──────────────────────────────────────────
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    dataQuery = dataQuery.range(from, to);

    // ── 6. Execute in parallel ─────────────────────────────────
    const [countResult, dataResult] = await Promise.all([
      countQuery,
      dataQuery,
    ]);

    if (dataResult.error) {
      console.error("Admin resumes data query error:", dataResult.error.message);
      return NextResponse.json(
        { error: "Unable to load resumes." },
        { status: 500 }
      );
    }

    const totalCount = countResult.count ?? 0;
    interface ResumeListItem {
      id: string;
      user_id: string;
      title: string;
      slug: string;
      template_id: string;
      target_job: string | null;
      is_public: boolean;
      download_count: number;
      created_at: string;
      updated_at: string;
    }
    const resumes: ResumeListItem[] = dataResult.data ?? [];

    // ── 7. Batch fetch owner profiles (no N+1) ─────────────────
    const userIds = [...new Set(resumes.map((r) => r.user_id))];
    const ownerMap: Record<string, { name: string | null; email: string }> = {};

    if (userIds.length > 0) {
      const { data: profiles } = await adminSupabase
        .from("profiles")
        .select("id, name, email, username")
        .in("id", userIds);

      if (profiles) {
        for (const p of profiles as Array<{ id: string; name: string | null; email: string; username: string | null }>) {
          ownerMap[p.id] = {
            name: p.name || p.username || p.email?.split("@")[0] || "User",
            email: p.email,
          };
        }
      }
    }

    // ── 8. Merge owner info ────────────────────────────────────
    const resumesWithOwner = resumes.map((r) => ({
      ...r,
      owner_name: ownerMap[r.user_id]?.name || "Unknown",
      owner_email: ownerMap[r.user_id]?.email || "—",
    }));

    // If searching by owner name/email, filter client-side since
    // owner fields are not in the resumes table
    let filteredResumes = resumesWithOwner;
    let filteredCount = totalCount;

    if (search) {
      const lowerSearch = search.toLowerCase();
      const beforeFilter = filteredResumes.length;
      filteredResumes = filteredResumes.filter((r) =>
        r.title.toLowerCase().includes(lowerSearch) ||
        (r.target_job && r.target_job.toLowerCase().includes(lowerSearch)) ||
        r.owner_name.toLowerCase().includes(lowerSearch) ||
        r.owner_email.toLowerCase().includes(lowerSearch)
      );
      // If client-side filter removed rows, adjust count
      // (this is approximate for owner-based search within current page)
      if (filteredResumes.length < beforeFilter) {
        filteredCount = filteredResumes.length;
      }
    }

    return NextResponse.json({
      resumes: filteredResumes,
      totalCount: filteredCount,
      page,
      pageSize,
    });
  } catch (err) {
    console.error("Admin resumes API unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
