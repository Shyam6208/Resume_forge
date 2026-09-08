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
  FileText,
  User,
  Briefcase,
  Calendar,
  Clock,
  LayoutTemplate,
  Download,
  Globe,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ShieldAlert,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TEMPLATES } from "@/config/templates.config";
import { calculateResumeScore } from "@/utils/score-calculator";
import type { ResumeData, UserType } from "@/types/resume.types";
import toast from "react-hot-toast";

// ── Types ──────────────────────────────────────────────────────

export interface ResumeListItem {
  id: string;
  user_id: string;
  title: string;
  slug: string;
  template_id: string;
  target_job: string | null;
  is_public: boolean;
  download_count: number;
  created_at: string;
  updated_at: string;
  owner_name: string;
  owner_email: string;
}

interface ResumeFullDetail {
  id: string;
  user_id: string;
  title: string;
  slug: string;
  template_id: string;
  data: ResumeData;
  target_job: string | null;
  is_public: boolean;
  download_count: number;
  section_order: string[];
  created_at: string;
  updated_at: string;
  owner_name: string;
  owner_email: string;
}

interface ResumeDetailsModalProps {
  resumeId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVisibilityChange?: (resumeId: string, newIsPublic: boolean) => void;
}

/**
 * ResumeDetailsModal — fetches full resume data for a single resume
 * and displays non-sensitive details + section summary + ATS score.
 *
 * ATS score is calculated using the existing calculateResumeScore()
 * function from the full ResumeData. No new scoring algorithm.
 *
 * Zero database writes. Zero Gemini/AI calls.
 */
export function ResumeDetailsModal({
  resumeId,
  open,
  onOpenChange,
  onVisibilityChange,
}: ResumeDetailsModalProps) {
  const [resume, setResume] = useState<ResumeFullDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingVisibility, setPendingVisibility] = useState<boolean | null>(null);
  const [toggling, setToggling] = useState(false);

  const [prevOpen, setPrevOpen] = useState(open);
  const [prevResumeId, setPrevResumeId] = useState(resumeId);

  if (open !== prevOpen || resumeId !== prevResumeId) {
    setPrevOpen(open);
    setPrevResumeId(resumeId);
    if (!open || !resumeId) {
      setResume(null);
      setError("");
    }
  }

  useEffect(() => {
    if (!resumeId || !open) {
      return;
    }

    let isCancelled = false;

    const fetchDetail = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/admin/resumes/${resumeId}`);
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error((body as { error?: string }).error || "Failed to load resume details.");
        }
        const data: ResumeFullDetail = await res.json();
        if (!isCancelled) {
          setResume(data);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : "Failed to load resume.");
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchDetail();

    return () => {
      isCancelled = true;
    };
  }, [resumeId, open]);

  if (!open) return null;

  // Template name lookup
  const templateName = resume
    ? TEMPLATES.find((t) => t.id === resume.template_id)?.name || "Unknown Template"
    : "—";

  // ATS score calculation (only for the single selected resume)
  const atsScore = resume?.data
    ? calculateResumeScore(resume.data, (resume.target_job as UserType) || "developer")
    : null;

  // Score color logic
  let scoreColor = "text-emerald-400";
  let scoreBg = "bg-emerald-500/10";
  let scoreBorder = "border-emerald-500/30";
  if (atsScore) {
    if (atsScore.score < 70) {
      scoreColor = "text-rose-400";
      scoreBg = "bg-rose-500/10";
      scoreBorder = "border-rose-500/30";
    } else if (atsScore.score < 90) {
      scoreColor = "text-amber-400";
      scoreBg = "bg-amber-500/10";
      scoreBorder = "border-amber-500/30";
    }
  }

  // Section summary
  const sectionSummary = resume?.data
    ? buildSectionSummary(resume.data)
    : [];

  const createdAt = resume?.created_at
    ? new Date(resume.created_at).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "—";

  const updatedAt = resume?.updated_at
    ? new Date(resume.updated_at).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "—";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-slate-950 border-slate-800 text-slate-100 max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white text-lg font-extrabold">
            Resume Details
          </DialogTitle>
          <DialogDescription className="text-slate-400 text-xs">
            Detailed view of this resume record.
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="py-12 flex flex-col items-center gap-3 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
            <p className="text-xs">Loading resume details…</p>
          </div>
        )}

        {error && (
          <div className="py-8 flex flex-col items-center gap-3 text-center">
            <AlertCircle className="w-6 h-6 text-red-400" />
            <p className="text-xs text-red-300">{error}</p>
          </div>
        )}

        {resume && !loading && !error && (
          <div className="space-y-5 pt-2">
            {/* Resume title + owner */}
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-purple-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-base font-extrabold text-white truncate">
                    {resume.title}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    by {resume.owner_name} ({resume.owner_email})
                  </p>
                </div>
              </div>
            </div>

            {/* ATS Score */}
            {atsScore && (
              <div className={`flex items-center justify-between px-3 py-2.5 rounded-xl border ${scoreBg} ${scoreBorder}`}>
                <span className="text-xs font-semibold text-slate-300">ATS Score</span>
                <span className={`text-sm font-extrabold ${scoreColor}`}>
                  {atsScore.score} / 100
                </span>
              </div>
            )}

            {/* Details grid */}
            <div className="grid gap-3">
              <DetailRow icon={User} label="Owner" value={`${resume.owner_name}`} />
              <DetailRow
                icon={Briefcase}
                label="Target Role"
                value={resume.target_job || "Not specified"}
              />
              <DetailRow icon={LayoutTemplate} label="Template" value={templateName} />
              <DetailRow icon={Calendar} label="Created" value={createdAt} />
              <DetailRow icon={Clock} label="Last Updated" value={updatedAt} />
              <DetailRow
                icon={Download}
                label="Downloads"
                value={String(resume.download_count)}
              />
              {/* ── Visibility Toggle ────────────────────── */}
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800/60">
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                  <Globe className="w-4 h-4 text-slate-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                    Visibility
                  </p>
                  <p className="text-xs font-semibold text-slate-200">
                    {resume.is_public ? "Public" : "Private"}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={toggling}
                  onClick={() => {
                    setPendingVisibility(!resume.is_public);
                    setShowConfirm(true);
                  }}
                  className={`h-7 px-3 text-[11px] font-bold rounded-lg border transition-colors flex items-center gap-1.5 ${
                    resume.is_public
                      ? "text-amber-300 bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20"
                      : "text-emerald-300 bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {toggling ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : resume.is_public ? (
                    <>
                      <Lock className="w-3 h-3" />
                      Make Private
                    </>
                  ) : (
                    <>
                      <Globe className="w-3 h-3" />
                      Make Public
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Section Summary */}
            {sectionSummary.length > 0 && (
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
                  Resume Sections
                </p>
                <div className="grid gap-1.5">
                  {sectionSummary.map((section) => (
                    <div
                      key={section.label}
                      className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800/60"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-xs font-semibold text-slate-200">
                          {section.label}
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-400">
                        {section.detail}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Visibility Confirmation Dialog ─────────────── */}
        {showConfirm && pendingVisibility !== null && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-slate-950 border border-slate-700 rounded-2xl p-6 max-w-sm mx-4 space-y-4 shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-white">
                    Confirm Visibility Change
                  </p>
                  <p className="text-[11px] text-slate-400">
                    This affects whether this resume is publicly visible.
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                You are about to change this resume from{" "}
                <span className="font-bold text-white">
                  {pendingVisibility ? "Private" : "Public"}
                </span>{" "}
                to{" "}
                <span className="font-bold text-white">
                  {pendingVisibility ? "Public" : "Private"}
                </span>
                . The resume owner will see this change.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <Button
                  variant="outline"
                  disabled={toggling}
                  onClick={() => {
                    setShowConfirm(false);
                    setPendingVisibility(null);
                  }}
                  className="flex-1 h-9 text-xs font-semibold bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  disabled={toggling}
                  onClick={async () => {
                    if (pendingVisibility === null || !resume) return;
                    setToggling(true);
                    try {
                      const res = await fetch(`/api/admin/resumes/${resume.id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ isPublic: pendingVisibility }),
                      });
                      const data = await res.json();
                      if (!res.ok) {
                        throw new Error(data.error || "Failed to update visibility.");
                      }
                      // Update local state only after server confirms
                      setResume({ ...resume, is_public: pendingVisibility });
                      if (data.changed && onVisibilityChange) {
                        onVisibilityChange(resume.id, pendingVisibility);
                      }
                      toast.success(
                        `Resume is now ${pendingVisibility ? "public" : "private"}.`
                      );
                    } catch (err) {
                      toast.error(
                        err instanceof Error ? err.message : "Failed to update visibility."
                      );
                    } finally {
                      setToggling(false);
                      setShowConfirm(false);
                      setPendingVisibility(null);
                    }
                  }}
                  className={`flex-1 h-9 text-xs font-bold rounded-xl ${
                    pendingVisibility
                      ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                      : "bg-amber-600 hover:bg-amber-500 text-white"
                  }`}
                >
                  {toggling ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : pendingVisibility ? (
                    "Make Public"
                  ) : (
                    "Make Private"
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ── Helpers ────────────────────────────────────────────────────

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
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
        <p className="text-xs font-semibold text-slate-200 truncate">{value}</p>
      </div>
    </div>
  );
}

interface SectionInfo {
  label: string;
  detail: string;
}

function buildSectionSummary(data: ResumeData): SectionInfo[] {
  const sections: SectionInfo[] = [];

  if (data.personalInfo) {
    sections.push({ label: "Personal Information", detail: "✓" });
  }
  if (data.summary) {
    sections.push({ label: "Summary", detail: "✓" });
  }
  if (data.experience && data.experience.length > 0) {
    sections.push({
      label: "Experience",
      detail: `${data.experience.length} ${data.experience.length === 1 ? "entry" : "entries"}`,
    });
  }
  if (data.education && data.education.length > 0) {
    sections.push({
      label: "Education",
      detail: `${data.education.length} ${data.education.length === 1 ? "entry" : "entries"}`,
    });
  }
  if (data.projects && data.projects.length > 0) {
    sections.push({
      label: "Projects",
      detail: `${data.projects.length} ${data.projects.length === 1 ? "project" : "projects"}`,
    });
  }
  if (data.skills) {
    const totalSkills = Object.values(data.skills).reduce(
      (sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0),
      0
    );
    if (totalSkills > 0) {
      sections.push({ label: "Skills", detail: `${totalSkills} skills` });
    }
  }
  if (data.certifications && data.certifications.length > 0) {
    sections.push({
      label: "Certifications",
      detail: `${data.certifications.length}`,
    });
  }
  if (data.achievements && data.achievements.length > 0) {
    sections.push({
      label: "Achievements",
      detail: `${data.achievements.length}`,
    });
  }
  if (data.languages && data.languages.length > 0) {
    sections.push({
      label: "Languages",
      detail: `${data.languages.length}`,
    });
  }
  if (data.interests && data.interests.length > 0) {
    sections.push({
      label: "Interests",
      detail: `${data.interests.length}`,
    });
  }
  if (data.volunteer && data.volunteer.length > 0) {
    sections.push({
      label: "Volunteer",
      detail: `${data.volunteer.length}`,
    });
  }
  if (data.publications && data.publications.length > 0) {
    sections.push({
      label: "Publications",
      detail: `${data.publications.length}`,
    });
  }
  if (data.references && data.references.length > 0) {
    sections.push({
      label: "References",
      detail: `${data.references.length}`,
    });
  }

  return sections;
}
