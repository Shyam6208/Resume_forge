import { AdminResumesClient } from "@/components/admin/AdminResumesClient";

export const dynamic = "force-dynamic";

/**
 * /admin/resumes — Admin Resume Management page.
 *
 * Security: The parent admin layout already calls requireAdminPage()
 * for server-side admin authorization. No duplicate auth needed here.
 *
 * Data fetching is handled client-side via the secure /api/admin/resumes
 * endpoint (which enforces requireAdminApi() on every request).
 *
 * Zero database writes. Zero Gemini/AI calls.
 */
export default function AdminResumesPage() {
  return <AdminResumesClient />;
}
