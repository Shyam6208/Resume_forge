import { AdminUsersClient } from "@/components/admin/AdminUsersClient";

export const dynamic = "force-dynamic";

/**
 * /admin/users — Admin Users Management page.
 *
 * Security: The parent admin layout already calls requireAdminPage()
 * for server-side admin authorization. No duplicate auth needed here.
 *
 * Data fetching is handled client-side via the secure /api/admin/users
 * endpoint (which enforces requireAdminApi() on every request).
 */
export default function AdminUsersPage() {
  return <AdminUsersClient />;
}
