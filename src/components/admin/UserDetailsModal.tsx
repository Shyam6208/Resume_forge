"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  User,
  Mail,
  Calendar,
  FileText,
  ShieldCheck,
  Clock,
  Briefcase,
} from "lucide-react";

export interface UserForModal {
  id: string;
  name: string | null;
  email: string;
  avatar_url: string | null;
  username: string | null;
  user_type: string | null;
  is_admin: boolean;
  is_guest: boolean;
  created_at: string;
  updated_at: string;
  resume_count: number;
}

interface UserDetailsModalProps {
  user: UserForModal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * UserDetailsModal — shows non-sensitive user profile information.
 *
 * NEVER displays passwords, tokens, hashes, sessions, API keys,
 * or any private authentication metadata.
 */
export function UserDetailsModal({
  user,
  open,
  onOpenChange,
}: UserDetailsModalProps) {
  if (!user) return null;

  const displayName =
    user.name || user.username || user.email?.split("@")[0] || "User";
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const createdAt = user.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "—";

  const lastUpdated = user.updated_at
    ? new Date(user.updated_at).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "—";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-slate-950 border-slate-800 text-slate-100">
        <DialogHeader>
          <DialogTitle className="text-white text-lg font-extrabold">
            User Details
          </DialogTitle>
          <DialogDescription className="text-slate-400 text-xs">
            Profile information for this user account.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Avatar + Name */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center text-lg font-bold shrink-0 overflow-hidden">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            <div className="space-y-1 min-w-0">
              <p className="text-base font-extrabold text-white truncate">
                {displayName}
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                {user.is_admin && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                    <ShieldCheck className="w-3 h-3" />
                    Admin
                  </span>
                )}
                {user.is_guest ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                    Guest
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                    Active
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Details grid */}
          <div className="grid gap-3">
            <DetailRow
              icon={Mail}
              label="Email"
              value={user.email || "—"}
              mono
            />
            <DetailRow
              icon={Briefcase}
              label="User Type"
              value={user.user_type ? user.user_type.charAt(0).toUpperCase() + user.user_type.slice(1) : "General"}
            />
            <DetailRow
              icon={FileText}
              label="Resumes Created"
              value={String(user.resume_count)}
            />
            <DetailRow
              icon={Calendar}
              label="Joined"
              value={createdAt}
            />
            <DetailRow
              icon={Clock}
              label="Last Updated"
              value={lastUpdated}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
  mono = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800/60">
      <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-slate-400" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
          {label}
        </p>
        <p
          className={`text-xs font-semibold text-slate-200 truncate ${
            mono ? "font-mono" : ""
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
