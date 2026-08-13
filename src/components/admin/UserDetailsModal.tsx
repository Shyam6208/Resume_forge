"use client";

import { useState, useEffect } from "react";
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
  Loader2,
  AlertCircle,
  Globe,
  Lock,
  Download,
  Eye,
  LayoutTemplate
} from "lucide-react";
import { TEMPLATES } from "@/config/templates.config";
import Link from "next/link";

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

interface UserStats {
  totalResumes: number;
  publicResumes: number;
  privateResumes: number;
  totalDownloads: number;
}

interface LightResume {
  id: string;
  title: string;
  slug: string;
  template_id: string;
  target_job: string | null;
  is_public: boolean;
  download_count: number;
  created_at: string;
  updated_at: string;
}

interface UserDetailsModalProps {
  user: UserForModal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * UserDetailsModal — shows comprehensive read-only user overview.
 *
 * Fetches lightweight resumes and stats from /api/admin/users/[id].
 * NEVER displays passwords, tokens, hashes, sessions, API keys,
 * or any private authentication metadata.
 */
export function UserDetailsModal({
  user,
  open,
  onOpenChange,
}: UserDetailsModalProps) {
  const [fullUser, setFullUser] = useState<UserForModal | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [resumes, setResumes] = useState<LightResume[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !user) {
      setFullUser(null);
      setStats(null);
      setResumes([]);
      setError("");
      return;
    }

    const fetchDetails = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/admin/users/${user.id}`);
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed to load user details.");
        }
        const data = await res.json();
        setFullUser(data.user);
        setStats(data.stats);
        setResumes(data.resumes);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Unable to load user details.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [open, user]);

  if (!user) return null;

  // Use base user while loading, then fullUser when loaded
  const displayUser = fullUser || user;

  const displayName =
    displayUser.name || displayUser.username || displayUser.email?.split("@")[0] || "User";
  
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const createdAt = displayUser.created_at
    ? new Date(displayUser.created_at).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "—";

  const lastUpdated = displayUser.updated_at
    ? new Date(displayUser.updated_at).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "—";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl bg-slate-950 border-slate-800 text-slate-100 max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white text-lg font-extrabold">
            User Overview
          </DialogTitle>
          <DialogDescription className="text-slate-400 text-xs">
            Complete read-only profile and resume activity.
          </DialogDescription>
        </DialogHeader>

        {loading && !fullUser && (
          <div className="py-12 flex flex-col items-center gap-3 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
            <p className="text-xs">Loading user details...</p>
          </div>
        )}

        {error && (
          <div className="py-8 flex flex-col items-center gap-3 text-center">
            <AlertCircle className="w-6 h-6 text-red-400" />
            <p className="text-xs text-red-300">{error}</p>
          </div>
        )}

        {(!loading || fullUser) && !error && displayUser && (
          <div className="space-y-8 pt-2">
            
            {/* ── Profile Header ── */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
              <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center text-xl font-bold shrink-0 overflow-hidden">
                {displayUser.avatar_url ? (
                  <img
                    src={displayUser.avatar_url}
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{initials}</span>
                )}
              </div>
              <div className="space-y-1.5 min-w-0 flex-1">
                <p className="text-lg font-extrabold text-white truncate">
                  {displayName}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="flex items-center gap-1.5 text-xs text-slate-300 font-mono">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    {displayUser.email || "—"}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap pt-1">
                  {displayUser.is_admin && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                      <ShieldCheck className="w-3 h-3" />
                      Admin
                    </span>
                  )}
                  {displayUser.is_guest ? (
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
              <div className="flex flex-col gap-2 text-right">
                <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                  Joined
                </div>
                <div className="text-xs font-medium text-slate-300">
                  {createdAt}
                </div>
              </div>
            </div>

            {/* ── Statistics ── */}
            {stats && (
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">
                  Statistics
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <StatCard 
                    label="Total Resumes" 
                    value={stats.totalResumes} 
                    icon={FileText} 
                    color="text-indigo-400"
                    bg="bg-indigo-500/10 border-indigo-500/20"
                  />
                  <StatCard 
                    label="Public" 
                    value={stats.publicResumes} 
                    icon={Globe} 
                    color="text-emerald-400"
                    bg="bg-emerald-500/10 border-emerald-500/20"
                  />
                  <StatCard 
                    label="Private" 
                    value={stats.privateResumes} 
                    icon={Lock} 
                    color="text-amber-400"
                    bg="bg-amber-500/10 border-amber-500/20"
                  />
                  <StatCard 
                    label="Total Downloads" 
                    value={stats.totalDownloads} 
                    icon={Download} 
                    color="text-purple-400"
                    bg="bg-purple-500/10 border-purple-500/20"
                  />
                </div>
              </div>
            )}

            {/* ── Resumes List ── */}
            <div>
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  User Resumes
                </h3>
                {resumes.length > 0 && (
                  <span className="text-[10px] text-slate-500">
                    Most recently updated at top
                  </span>
                )}
              </div>
              
              {resumes.length === 0 ? (
                <div className="p-8 text-center border border-slate-800 border-dashed rounded-2xl bg-slate-900/30">
                  <FileText className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-400">No resumes yet</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {resumes.map((resume, idx) => {
                    const tName = TEMPLATES.find(t => t.id === resume.template_id)?.name || "Unknown / Legacy";
                    const isMostRecent = idx === 0;

                    return (
                      <div 
                        key={resume.id}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-800/50 transition-colors relative overflow-hidden"
                      >
                        {isMostRecent && (
                          <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
                        )}
                        
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-white truncate">
                              {resume.title}
                            </p>
                            {isMostRecent && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                Most Recent
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 flex items-center gap-2">
                            <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                            {resume.target_job || "No target role"}
                          </p>
                          <div className="flex items-center gap-3 pt-2 text-[10px] font-semibold">
                            <span className={`flex items-center gap-1 ${resume.is_public ? "text-emerald-400" : "text-amber-400"}`}>
                              {resume.is_public ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                              {resume.is_public ? "Public" : "Private"}
                            </span>
                            <span className="text-slate-600">•</span>
                            <span className="flex items-center gap-1 text-slate-400">
                              <LayoutTemplate className="w-3 h-3 text-slate-500" />
                              {tName}
                            </span>
                            <span className="text-slate-600">•</span>
                            <span className="flex items-center gap-1 text-slate-400">
                              <Download className="w-3 h-3 text-slate-500" />
                              {resume.download_count} DL
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                          <Link 
                            href={`/admin/resumes/${resume.id}/view`}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View Resume
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ── Helpers ────────────────────────────────────────────────────

function StatCard({ 
  label, 
  value, 
  icon: Icon,
  color,
  bg
}: { 
  label: string; 
  value: number; 
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
}) {
  return (
    <div className={`p-4 rounded-xl border ${bg} flex flex-col items-center justify-center text-center gap-2`}>
      <Icon className={`w-5 h-5 ${color}`} />
      <div>
        <p className={`text-xl font-black ${color}`}>{value}</p>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{label}</p>
      </div>
    </div>
  );
}
