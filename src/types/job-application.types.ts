export type ApplicationStatus = "saved" | "applied" | "interviewing" | "offered" | "rejected";

export interface JobApplication {
  id: string;
  userId?: string;
  resumeId?: string;
  resumeTitle?: string;
  jobTitle: string;
  company: string;
  location?: string;
  salary?: string;
  status: ApplicationStatus;
  appliedDate: string;
  jobUrl?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const APPLICATION_STATUS_CONFIG: Record<
  ApplicationStatus,
  { label: string; color: string; badgeClass: string; borderClass: string; bgClass: string }
> = {
  saved: {
    label: "Saved / Wishlist",
    color: "text-slate-400",
    badgeClass: "bg-slate-500/10 text-slate-300 border-slate-500/20",
    borderClass: "border-l-slate-500",
    bgClass: "bg-slate-900/40",
  },
  applied: {
    label: "Applied",
    color: "text-indigo-400",
    badgeClass: "bg-indigo-500/10 text-indigo-300 border-indigo-500/20",
    borderClass: "border-l-indigo-500",
    bgClass: "bg-indigo-950/20",
  },
  interviewing: {
    label: "Interviewing",
    color: "text-amber-400",
    badgeClass: "bg-amber-500/10 text-amber-300 border-amber-500/20",
    borderClass: "border-l-amber-500",
    bgClass: "bg-amber-950/20",
  },
  offered: {
    label: "Offer Received",
    color: "text-emerald-400",
    badgeClass: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
    borderClass: "border-l-emerald-500",
    bgClass: "bg-emerald-950/20",
  },
  rejected: {
    label: "Rejected / Closed",
    color: "text-rose-400",
    badgeClass: "bg-rose-500/10 text-rose-300 border-rose-500/20",
    borderClass: "border-l-rose-500",
    bgClass: "bg-rose-950/20",
  },
};
