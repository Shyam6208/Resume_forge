"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase/client";
import { User, LayoutDashboard, UserCheck, LogOut, ChevronDown, ShieldCheck } from "lucide-react";

export function UserMenu() {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [dbAvatarUrl, setDbAvatarUrl] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [imgError, setImgError] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch avatar and admin status from Supabase profiles table
  useEffect(() => {
    if (user?.id) {
      supabase
        .from("profiles")
        .select("avatar_url, name, is_admin, role")
        .eq("id", user.id)
        .maybeSingle()
        .then(({ data }) => {
          const profile = data as {
            avatar_url?: string | null;
            name?: string | null;
            is_admin?: boolean | string | null;
            role?: string | null;
          } | null;
          if (profile?.avatar_url) {
            setDbAvatarUrl(profile.avatar_url);
          }
          if (
            profile &&
            (profile.is_admin === true ||
              profile.is_admin === "true" ||
              profile.role === "admin")
          ) {
            setIsAdmin(true);
          }
        });
    }
  }, [user?.id]);

  if (!user) return null;

  const email = user.email || "";
  const fullName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.user_metadata?.user_name ||
    email.split("@")[0] ||
    "User";

  const rawAvatarUrl =
    dbAvatarUrl ||
    user.user_metadata?.avatar_url ||
    user.user_metadata?.picture ||
    user.user_metadata?.avatar ||
    user.user_metadata?.photoUrl ||
    user.user_metadata?.image ||
    null;

  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .map((n: string) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase() || "U";

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-full bg-card border border-white/[0.08] hover:border-cyan-500/30 text-foreground/80 transition-all text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-cyan-500/40 shadow-xs group"
      >
        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30 text-cyan-300 flex items-center justify-center text-[10px] font-bold overflow-hidden shrink-0">
          {rawAvatarUrl && !imgError ? (
            <img
              src={rawAvatarUrl}
              alt={fullName}
              className="w-full h-full object-cover rounded-full"
              onError={() => setImgError(true)}
              referrerPolicy="no-referrer"
            />
          ) : initials ? (
            <span>{initials}</span>
          ) : (
            <User className="w-3.5 h-3.5 text-cyan-400" />
          )}
        </div>
        <span className="truncate max-w-[120px] hidden sm:inline text-foreground/80 font-medium">
          {fullName}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground shrink-0 transition-transform duration-150 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-card/95 backdrop-blur-xl border border-white/[0.08] shadow-2xl p-2 z-50 text-foreground space-y-1 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* User Info Header */}
          <div className="px-3 py-2 border-b border-white/[0.06] mb-1 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30 text-cyan-300 flex items-center justify-center text-xs font-bold overflow-hidden shrink-0">
              {rawAvatarUrl && !imgError ? (
                <img
                  src={rawAvatarUrl}
                  alt={fullName}
                  className="w-full h-full object-cover rounded-full"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-foreground truncate">{fullName}</p>
              <p className="text-[11px] text-muted-foreground truncate">{email}</p>
            </div>
          </div>

          <Link
            href="/dashboard"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-foreground/70 hover:text-foreground hover:bg-white/[0.04] transition-colors"
          >
            <LayoutDashboard className="w-4 h-4 text-cyan-400" />
            <span>Dashboard</span>
          </Link>

          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>Admin Panel</span>
            </Link>
          )}

          <Link
            href="/profile"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-foreground/70 hover:text-foreground hover:bg-white/[0.04] transition-colors"
          >
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <span>Profile & Avatar Settings</span>
          </Link>

          <div className="border-t border-white/[0.06] my-1 pt-1">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                signOut();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors text-left"
            >
              <LogOut className="w-4 h-4 text-rose-400" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
