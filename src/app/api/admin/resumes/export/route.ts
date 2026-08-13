import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi, logAdminActivity } from "@/lib/auth/require-admin";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/resumes/export
 *
 * Secure admin-only endpoint for exporting resumes as CSV.
 * Fetches lightweight metadata and resolves owner name/email via batch query.
 */
export async function GET(request: NextRequest) {
  // ── 1. Admin Authorization (server-side) ─────────────────────
  const authResult = await requireAdminApi();
  if (authResult instanceof NextResponse) {
    return authResult; // 401 or 403
  }

  const { user } = authResult;

  try {
    const { searchParams } = new URL(request.url);
    const search = (searchParams.get("search") || "").trim();
    const userId = (searchParams.get("userId") || "").trim();
    const templateId = (searchParams.get("templateId") || "").trim();
    const sort = (searchParams.get("sort") || "updated_desc").trim();

    // ── 2. Service-role client (server-only) ───────────────────
    const adminSupabase = createAdminSupabaseClient();

    // ── 3. Build query — LIGHT columns only ────────────────────
    const LIGHT_COLUMNS = "id, user_id, title, slug, template_id, target_job, is_public, download_count, created_at, updated_at";

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

    let dataQuery = adminSupabase
      .from("resumes")
      .select(LIGHT_COLUMNS)
      .order(sortColumn, { ascending: sortAscending })
      .limit(10000);

    // ── 4. Apply filters ───────────────────────────────────────
    if (userId) {
      dataQuery = dataQuery.eq("user_id", userId);
    }

    if (templateId) {
      dataQuery = dataQuery.eq("template_id", templateId);
    }

    if (search) {
      const filter = `title.ilike.%${search}%,target_job.ilike.%${search}%`;
      dataQuery = dataQuery.or(filter);
    }

    const { data: resumes, error } = await dataQuery;

    if (error) {
      console.error("Admin resumes export data query error:", error.message);
      return NextResponse.json(
        { error: "Unable to load resumes." },
        { status: 500 }
      );
    }

    const safeResumes = resumes || [];

    // ── 5. Fetch owner profiles in one batch (no N+1) ──────────
    const uniqueUserIds = Array.from(new Set(safeResumes.map((r: any) => r.user_id)));
    const ownerMap: Record<string, { name: string; email: string }> = {};

    if (uniqueUserIds.length > 0) {
      const { data: profiles, error: profilesError } = await adminSupabase
        .from("profiles")
        .select("id, name, email, username")
        .in("id", uniqueUserIds);

      if (!profilesError && profiles) {
        profiles.forEach((p: any) => {
          ownerMap[p.id] = {
            name: p.name || p.username || (p.email ? p.email.split("@")[0] : "Unknown"),
            email: p.email || "—",
          };
        });
      }
    }

    // ── 6. Generate CSV Content ────────────────────────────────
    const headers = [
      "ID",
      "User ID",
      "Owner Name",
      "Owner Email",
      "Title",
      "Slug",
      "Template ID",
      "Target Job",
      "Is Public",
      "Download Count",
      "Created At",
      "Updated At",
    ];

    const escapeCSV = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = String(val);
      if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = safeResumes.map((r: any) => {
      const owner = ownerMap[r.user_id] || { name: "Unknown", email: "—" };
      return [
        r.id,
        r.user_id,
        owner.name,
        owner.email,
        r.title,
        r.slug,
        r.template_id,
        r.target_job,
        r.is_public,
        r.download_count,
        r.created_at,
        r.updated_at,
      ];
    });

    const csvContent = [
      headers.map(escapeCSV).join(","),
      ...rows.map(row => row.map(escapeCSV).join(",")),
    ].join("\n");

    // ── 7. Audit Log ───────────────────────────────────────────
    await logAdminActivity(
      user.id,
      user.email || "",
      "resumes_exported",
      {
        rowCount: safeResumes.length,
        filters: { search, userId, templateId, sort },
      }
    );

    // ── 8. Return CSV Response ─────────────────────────────────
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="resumes.csv"',
      },
    });
  } catch (err) {
    console.error("Admin resumes export unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
