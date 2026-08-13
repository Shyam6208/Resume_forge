import { requireAdminPage } from "@/lib/auth/require-admin";
import { AdminSettingsClient } from "@/components/admin/AdminSettingsClient";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  await requireAdminPage();
  return <AdminSettingsClient />;
}
