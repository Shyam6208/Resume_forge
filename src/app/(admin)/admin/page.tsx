import { Metadata } from "next";
import { AdminAnalyticsClient } from "@/components/admin/AdminAnalyticsClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Dashboard - ResumeForge",
  description: "ResumeForge Admin Dashboard Overview and Analytics",
};

export default function AdminDashboardPage() {
  return (
    <div className="w-full">
      <AdminAnalyticsClient />
    </div>
  );
}
