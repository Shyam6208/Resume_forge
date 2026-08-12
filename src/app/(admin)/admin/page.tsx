import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  Users,
  FileText,
  FileCode2,
  CheckCircle2,
  Clock,
  Sparkles,
  Plus,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = await createServerSupabaseClient();

  let totalUsers = 0;
  let totalResumes = 0;
  let totalTemplates = 0;
  let publishedTemplates = 0;
  let draftTemplates = 0;
  let featuredTemplates = 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let recentTemplates: any[] = [];

  try {
    // 1. Total Users Count from public.profiles
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count: usersCount } = await (supabase.from("profiles") as any)
      .select("*", { count: "exact", head: true });
    totalUsers = usersCount || 0;

    // 2. Total Resumes Count from public.resumes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count: resumesCount } = await (supabase.from("resumes") as any)
      .select("*", { count: "exact", head: true });
    totalResumes = resumesCount || 0;

    // 3. Templates Counts from public.resume_templates
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: allTemplates } = await (supabase.from("resume_templates") as any)
      .select("*")
      .order("created_at", { ascending: false });

    if (allTemplates && Array.isArray(allTemplates)) {
      totalTemplates = allTemplates.length;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      publishedTemplates = allTemplates.filter((t: any) => t.status === "published").length;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      draftTemplates = allTemplates.filter((t: any) => t.status === "draft").length;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      featuredTemplates = allTemplates.filter((t: any) => t.is_featured === true).length;
      recentTemplates = allTemplates.slice(0, 5);
    }
  } catch (err) {
    console.warn("Could not query admin dashboard stats:", err);
  }

  const STAT_CARDS = [
    {
      title: "Total Users",
      value: totalUsers,
      icon: Users,
      color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    },
    {
      title: "Total Resumes",
      value: totalResumes,
      icon: FileText,
      color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    },
    {
      title: "Total Templates",
      value: totalTemplates,
      icon: FileCode2,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      title: "Published Templates",
      value: publishedTemplates,
      icon: CheckCircle2,
      color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    },
    {
      title: "Draft Templates",
      value: draftTemplates,
      icon: Clock,
      color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    },
    {
      title: "Featured Templates",
      value: featuredTemplates,
      icon: Sparkles,
      color: "text-pink-400 bg-pink-500/10 border-pink-500/20",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Admin Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time analytics and template management control center.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link href="/admin/templates/new">
            <Button
              type="button"
              className="h-10 px-4 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Template</span>
            </Button>
          </Link>
          <Link href="/admin/templates">
            <Button
              type="button"
              variant="outline"
              className="h-10 px-4 text-xs bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-200 font-semibold rounded-xl"
            >
              <span>Manage Templates</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {STAT_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3 flex items-center justify-between"
            >
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-400">{card.title}</p>
                <p className="text-2xl sm:text-3xl font-extrabold text-white">
                  {card.value !== undefined ? card.value : "—"}
                </p>
              </div>

              <div
                className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 ${card.color}`}
              >
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Template Activity Section */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-5 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div className="space-y-0.5">
            <h3 className="text-base font-bold text-white">Recent Templates</h3>
            <p className="text-xs text-slate-400">
              Latest dynamic template additions and modifications.
            </p>
          </div>

          <Link
            href="/admin/templates"
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentTemplates.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 space-y-2">
            <p>No dynamic templates added yet.</p>
            <Link
              href="/admin/templates/new"
              className="text-indigo-400 font-bold hover:underline"
            >
              Create your first template →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {recentTemplates.map((t) => (
              <div
                key={t.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0 overflow-hidden">
                    {t.thumbnail_url ? (
                      <img
                        src={t.thumbnail_url}
                        alt={t.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FileCode2 className="w-5 h-5 text-indigo-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">{t.name}</p>
                    <p className="text-[11px] text-slate-400 font-mono">
                      slug: {t.slug} • Category: {t.category || "Modern"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      t.status === "published"
                        ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                        : t.status === "archived"
                        ? "bg-slate-800 text-slate-400 border-slate-700"
                        : "bg-amber-500/10 text-amber-300 border-amber-500/30"
                    }`}
                  >
                    {t.status?.toUpperCase() || "DRAFT"}
                  </span>
                  <Link
                    href={`/admin/templates/${t.id}/edit`}
                    className="text-xs font-semibold px-3 py-1 bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-lg transition-colors"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
