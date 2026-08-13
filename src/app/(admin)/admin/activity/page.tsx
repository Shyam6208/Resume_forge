import { requireAdminPage } from "@/lib/auth/require-admin";
import { AdminActivityClient } from "@/components/admin/AdminActivityClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin Activity - ResumeForge",
  description: "Monitor secure, chronological system events",
};

export default async function AdminActivityPage() {
  await requireAdminPage();
  return <AdminActivityClient />;
}
