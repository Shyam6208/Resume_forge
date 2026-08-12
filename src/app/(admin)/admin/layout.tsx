import type { Metadata } from "next";
import { requireAdminPage } from "@/lib/auth/require-admin";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Panel — ResumeForge",
  description: "ResumeForge Admin Dashboard and Dynamic Template Management.",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Strict Server-Side Admin Authorization Assertion
  await requireAdminPage();

  return <AdminSidebar>{children}</AdminSidebar>;
}
