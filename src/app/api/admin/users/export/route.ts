import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi, logAdminActivity } from "@/lib/auth/require-admin";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/users/export
 *
 * Secure admin-only endpoint for exporting user data as CSV.
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

    // ── 2. Service-role client (server-only, bypasses RLS) ─────
    const adminSupabase = createAdminSupabaseClient();

    // ── 3. Build profiles query (safe columns only) ────────────
    const SAFE_COLUMNS = "id, name, email, username, user_type, is_admin, is_guest, created_at, updated_at";

    let dataQuery = adminSupabase
      .from("profiles")
      .select(SAFE_COLUMNS)
      .order("created_at", { ascending: false })
      .limit(10000); // Reasonable limit for export

    // ── 4. Apply search filter (server-side, case-insensitive) ─
    if (search) {
      const filter = `name.ilike.%${search}%,email.ilike.%${search}%`;
      dataQuery = dataQuery.or(filter);
    }

    const { data: profiles, error } = await dataQuery;

    if (error) {
      console.error("Admin users export query error:", error.message);
      return NextResponse.json(
        { error: "Unable to export users." },
        { status: 500 }
      );
    }

    const safeProfiles = profiles || [];

    // ── 5. Generate CSV Content ────────────────────────────────
    const headers = [
      "ID",
      "Name",
      "Email",
      "Username",
      "User Type",
      "Is Admin",
      "Is Guest",
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

    const rows = safeProfiles.map((p: any) => [
      p.id,
      p.name,
      p.email,
      p.username,
      p.user_type,
      p.is_admin,
      p.is_guest,
      p.created_at,
      p.updated_at,
    ]);

    const csvContent = [
      headers.map(escapeCSV).join(","),
      ...rows.map(row => row.map(escapeCSV).join(",")),
    ].join("\n");

    // ── 6. Audit Log ───────────────────────────────────────────
    await logAdminActivity(
      user.id,
      user.email || "",
      "users_exported",
      {
        rowCount: safeProfiles.length,
        filters: { search },
      }
    );

    // ── 7. Return CSV Response ─────────────────────────────────
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="users.csv"',
      },
    });
  } catch (err) {
    console.error("Admin users export unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
