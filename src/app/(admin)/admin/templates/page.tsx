import { Metadata } from "next";
import { AdminTemplatesClient } from "@/components/admin/AdminTemplatesClient";

export const metadata: Metadata = {
  title: "Template Management - Admin",
  description: "View and manage static template configurations and their usage across resumes.",
};

export default function AdminTemplatesPage() {
  return (
    <div className="w-full">
      <AdminTemplatesClient />
    </div>
  );
}
