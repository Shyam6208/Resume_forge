"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase/client";
import { User, LayoutDashboard, UserCheck, LogOut, ChevronDown } from "lucide-react";

export function UserMenu() {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [dbAvatarUrl, setDbAvatarUrl] = useState<string | null>(null);
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

  // Fetch avatar from Supabase profiles table if updated in database
  useEffect(() => {
    if (user?.id) {
      supabase
        .from("profiles")
        .select("avatar_url, name")
        .eq("id", user.id)
        .maybeSingle()
        .then(({ data }) => {
          const profile = data as { avatar_url?: string | null; name?: string | null } | null;
          if (profile?.avatar_url) {
            setDbAvatarUrl(profile.avatar_url);
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
        className="flex items-center gap-2 px-2 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-slate-200 transition-all text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-xs group"
      >
        <div className="w-7 h-7 rounded-full bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center text-[10px] font-bold overflow-hidden shrink-0">
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
            <User className="w-3.5 h-3.5 text-indigo-400" />
          )}
        </div>
        <span className="truncate max-w-[120px] hidden sm:inline text-slate-200 font-medium">
          {fullName}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-150 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 text-slate-100 space-y-1 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* User Info Header */}
          <div className="px-3 py-2 border-b border-slate-800/80 mb-1 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center text-xs font-bold overflow-hidden shrink-0">
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
              <p className="text-xs font-bold text-white truncate">{fullName}</p>
              <p className="text-[11px] text-slate-400 truncate">{email}</p>
            </div>
          </div>

          <Link
            href="/dashboard"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
          >
            <LayoutDashboard className="w-4 h-4 text-indigo-400" />
            <span>Dashboard</span>
          </Link>

          <Link
            href="/profile"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
          >
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <span>Profile & Avatar Settings</span>
          </Link>

          <div className="border-t border-slate-800/80 my-1 pt-1">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                signOut();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors text-left"
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
