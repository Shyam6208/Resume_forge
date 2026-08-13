import { requireAdminPage } from "@/lib/auth/require-admin";
import { AdminReliabilityClient } from "@/components/admin/AdminReliabilityClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin Reliability - ResumeForge",
  description: "Monitor platform performance and reliability configurations",
};

export default async function AdminReliabilityPage() {
  await requireAdminPage();
  return <AdminReliabilityClient />;
}
