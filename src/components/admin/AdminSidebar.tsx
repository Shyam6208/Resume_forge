"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileCode2,
  Users,
  Settings,
  ShieldCheck,
  Menu,
  X,
  ArrowLeft,
  Sparkles,
  LogOut,
  FileText,
  Activity,
  ServerCrash,
} from "lucide-react";
import { UserMenu } from "@/components/navigation/UserMenu";
import { supabase } from "@/lib/supabase/client";
import toast from "react-hot-toast";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Templates", href: "/admin/templates", icon: FileCode2 },
  { label: "Resumes", href: "/admin/resumes", icon: FileText },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Activity", href: "/admin/activity", icon: Activity },
  { label: "Reliability", href: "/admin/reliability", icon: ServerCrash },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleAdminSignOut = async () => {
    setIsLoggingOut(true);
    try {
      await supabase.auth.signOut();
      toast.success("Admin session signed out successfully.");
      router.push("/admin/login");
      router.refresh();
    } catch (err) {
      console.error("Admin signout error:", err);
      toast.error("Failed to sign out.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row selection:bg-indigo-500 selection:text-white">
      {/* Mobile Header Bar */}
      <header className="md:hidden sticky top-0 z-40 h-16 bg-slate-950/90 backdrop-blur border-b border-slate-800 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 font-bold text-xs">
            RF
          </span>
          <span className="font-extrabold text-base text-white tracking-tight">
            Admin Panel
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAdminSignOut}
            disabled={isLoggingOut}
            className="p-2 text-rose-400 hover:text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs font-semibold flex items-center gap-1"
            title="Sign Out Admin"
          >
            <LogOut className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2 text-slate-400 hover:text-white rounded-xl bg-slate-900 border border-slate-800"
            aria-label="Toggle Navigation Drawer"
          >
            {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Desktop Sidebar (Fixed) */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900/90 border-r border-slate-800/80 shrink-0 min-h-screen sticky top-0 h-screen p-4 justify-between">
        <div className="space-y-6">
          {/* Logo & Admin Badge */}
          <div className="space-y-2">
            <Link href="/admin" className="flex items-center gap-2 group">
              <span className="p-2 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 font-bold text-sm group-hover:bg-indigo-600/30 transition-colors">
                RF
              </span>
              <span className="font-extrabold text-lg text-white tracking-tight">
                ResumeForge
              </span>
            </Link>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin System Active</span>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`min-h-[44px] flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="space-y-2 pt-4 border-t border-slate-800/80">
          <Link
            href="/dashboard"
            className="min-h-[44px] flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-indigo-400" />
            <span>User Dashboard</span>
          </Link>

          <button
            type="button"
            onClick={handleAdminSignOut}
            disabled={isLoggingOut}
            className="w-full min-h-[44px] flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Admin</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer (Overlay) */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col p-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <span className="font-extrabold text-base text-white">Admin Navigation</span>
            </div>
            <button
              type="button"
              onClick={() => setIsMobileOpen(false)}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="space-y-2 py-6 flex-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`min-h-[48px] flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                      : "text-slate-300 hover:bg-slate-900"
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="space-y-2 pt-4 border-t border-slate-800">
            <Link
              href="/dashboard"
              onClick={() => setIsMobileOpen(false)}
              className="min-h-[48px] flex items-center justify-center gap-2 w-full py-3 bg-slate-900 text-slate-200 font-semibold text-xs rounded-2xl border border-slate-800"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to User Dashboard</span>
            </Link>

            <button
              type="button"
              onClick={handleAdminSignOut}
              className="min-h-[48px] flex items-center justify-center gap-2 w-full py-3 bg-rose-500/10 text-rose-300 font-bold text-xs rounded-2xl border border-rose-500/20"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out Admin</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Viewport */}
      <main className="flex-1 w-full max-w-full overflow-x-hidden p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
