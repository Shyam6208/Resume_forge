"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
  Zap,
} from "lucide-react";
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
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row selection:bg-cyan-500 selection:text-white">
      {/* Mobile Header Bar */}
      <header className="md:hidden sticky top-0 z-40 h-16 bg-background/80 backdrop-blur-xl border-b border-white/[0.08] px-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30">
            <Zap className="w-4 h-4 text-cyan-400" />
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full" style={{ animation: "admin-live-blink 2s ease-in-out infinite" }} />
          </div>
          <span className="font-extrabold text-base text-foreground tracking-tight">
            Admin Panel
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAdminSignOut}
            disabled={isLoggingOut}
            className="p-2 text-rose-400 hover:text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all hover:bg-rose-500/20"
            title="Sign Out Admin"
          >
            <LogOut className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2 text-muted-foreground hover:text-foreground rounded-xl bg-card/80 border border-white/[0.08] backdrop-blur-sm transition-all hover:bg-white/[0.06]"
            aria-label="Toggle Navigation Drawer"
          >
            {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════════════
          Desktop Sidebar — Glassmorphism + Animated Gradient Orbs
          ═══════════════════════════════════════════════════════════════ */}
      <aside className="hidden md:flex flex-col w-[272px] shrink-0 min-h-screen sticky top-0 h-screen overflow-hidden relative">
        {/* Animated gradient orbs behind the sidebar */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute w-40 h-40 rounded-full bg-cyan-600/20 blur-3xl"
            style={{
              top: "15%",
              left: "50%",
              animation: "admin-breathe 6s ease-in-out infinite",
            }}
          />
          <div
            className="absolute w-32 h-32 rounded-full bg-emerald-600/15 blur-3xl"
            style={{
              bottom: "20%",
              left: "50%",
              animation: "admin-breathe 8s ease-in-out infinite 2s",
            }}
          />
          <div
            className="absolute w-24 h-24 rounded-full bg-emerald-600/10 blur-2xl"
            style={{
              top: "60%",
              left: "30%",
              animation: "admin-breathe 7s ease-in-out infinite 4s",
            }}
          />
        </div>

        {/* Glass panel */}
        <div className="relative z-10 flex flex-col h-full p-4 bg-card/60 backdrop-blur-xl border-r border-white/[0.08] justify-between">
          <div className="space-y-6">
            {/* Logo & Admin Badge */}
            <div className="space-y-3">
              <Link href="/admin" className="flex items-center gap-3 group">
                <div className="relative p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30 group-hover:from-cyan-500/30 group-hover:to-emerald-500/30 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-cyan-500/20">
                  <Zap className="w-5 h-5 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
                </div>
                <div className="flex flex-col">
                  <span
                    className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-foreground via-foreground/80 to-muted-foreground bg-clip-text text-transparent"
                  >
                    ResumeForge
                  </span>
                  <span className="text-[10px] font-medium text-muted-foreground tracking-widest uppercase">
                    Admin Console
                  </span>
                </div>
              </Link>

              {/* Animated status badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" style={{ animation: "admin-pulse-glow 2s ease-in-out infinite" }} />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
                </span>
                <span className="text-[11px] font-semibold text-emerald-400 tracking-wide">
                  System Active
                </span>
              </div>
            </div>

            {/* Nav Items with animated active indicator */}
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
                    className="relative min-h-[44px] flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200 group"
                  >
                    {/* Animated active background */}
                    {isActive && (
                      <motion.div
                        layoutId="admin-active-nav"
                        className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 shadow-lg shadow-cyan-500/25"
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      />
                    )}

                    {/* Hover background */}
                    {!isActive && (
                      <div className="absolute inset-0 rounded-xl bg-white/0 group-hover:bg-white/[0.06] transition-colors duration-200" />
                    )}

                    <div className="relative z-10 flex items-center gap-3 w-full">
                      <div className={`transition-transform duration-200 ${isActive ? "" : "group-hover:scale-110"}`}>
                        <Icon className={`w-[18px] h-[18px] shrink-0 ${isActive ? "text-slate-950" : "text-muted-foreground group-hover:text-foreground"} transition-colors`} />
                      </div>
                      <span className={`${isActive ? "text-slate-950 font-bold" : "text-muted-foreground group-hover:text-foreground"} transition-colors`}>
                        {item.label}
                      </span>

                      {/* Active indicator dot */}
                      {isActive && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="ml-auto w-1.5 h-1.5 rounded-full bg-slate-950/60"
                        />
                      )}
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Bottom Actions — Premium glass card */}
          <div className="space-y-2 pt-4">
            <div className="h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent mb-3" />

            <Link
              href="/dashboard"
              className="min-h-[44px] flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-[13px] font-medium text-muted-foreground hover:text-foreground transition-all duration-200 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/[0.06] transition-colors rounded-xl" />
              <div className="relative z-10 flex items-center gap-2.5">
                <ArrowLeft className="w-4 h-4 text-cyan-400 group-hover:text-cyan-300 transition-all duration-200 group-hover:-translate-x-0.5" />
                <span>User Dashboard</span>
              </div>
            </Link>

            <button
              type="button"
              onClick={handleAdminSignOut}
              disabled={isLoggingOut}
              className="w-full min-h-[44px] flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-[13px] font-semibold text-rose-400 hover:text-rose-300 transition-all duration-200 group relative overflow-hidden border border-rose-500/15 hover:border-rose-500/30"
            >
              <div className="absolute inset-0 bg-rose-500/0 group-hover:bg-rose-500/10 transition-colors rounded-xl" />
              <div className="relative z-10 flex items-center gap-2.5">
                <LogOut className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                <span>{isLoggingOut ? "Signing Out..." : "Sign Out Admin"}</span>
              </div>
            </button>
          </div>
        </div>
      </aside>

      {/* ═══════════════════════════════════════════════════════════════
          Mobile Drawer (Overlay) — Premium Version
          ═══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden fixed inset-0 z-50 bg-background/85 backdrop-blur-xl flex flex-col p-4"
          >
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                </div>
                <span className="font-extrabold text-base text-foreground">Admin Navigation</span>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileOpen(false)}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="space-y-2 py-6 flex-1">
              {NAV_ITEMS.map((item, index) => {
                const Icon = item.icon;
                const isActive =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(item.href);

                return (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05, type: "spring", stiffness: 300, damping: 25 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={`min-h-[48px] flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                        isActive
                          ? "bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 font-bold shadow-lg shadow-cyan-500/20"
                          : "text-muted-foreground hover:bg-white/[0.06]"
                      }`}
                    >
                      <Icon className="w-5 h-5 shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  </motion.div>
                );
              })}
            </nav>

            <div className="space-y-2 pt-4 border-t border-white/[0.08]">
              <Link
                href="/dashboard"
                onClick={() => setIsMobileOpen(false)}
                className="min-h-[48px] flex items-center justify-center gap-2 w-full py-3 bg-card/80 text-foreground font-semibold text-xs rounded-2xl border border-white/[0.08] backdrop-blur-sm"
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Viewport */}
      <main className="flex-1 w-full max-w-full overflow-x-hidden p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
