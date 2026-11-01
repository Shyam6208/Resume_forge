"use client";

import { useState, useMemo, useSyncExternalStore } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Resume } from "@/types/resume.types";
import {
  type JobApplication,
  type ApplicationStatus,
  APPLICATION_STATUS_CONFIG,
} from "@/types/job-application.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  Building2,
  Briefcase,
  MapPin,
  Calendar,
  ExternalLink,
  Trash2,
  Edit2,
  FileText,
  DollarSign,
  Layers,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  Clock,
  TrendingUp,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

const STORAGE_KEY = "resumeforge_job_applications";

const DEFAULT_SAMPLE_APPLICATIONS: JobApplication[] = [
  {
    id: "app-1",
    jobTitle: "Senior Full Stack Engineer",
    company: "Stripe",
    location: "Remote / San Francisco",
    salary: "$160k - $190k",
    status: "interviewing",
    appliedDate: new Date(Date.now() - 3 * 86400000).toISOString().split("T")[0],
    jobUrl: "https://stripe.com/jobs",
    notes: "Passed technical screening round. System design interview scheduled for next Tuesday.",
  },
  {
    id: "app-2",
    jobTitle: "Frontend Developer (Next.js)",
    company: "Vercel",
    location: "Remote",
    salary: "$140k - $165k",
    status: "applied",
    appliedDate: new Date(Date.now() - 6 * 86400000).toISOString().split("T")[0],
    jobUrl: "https://vercel.com/careers",
    notes: "Tailored resume to emphasize React Server Components & Turbopack experience.",
  },
  {
    id: "app-3",
    jobTitle: "Staff Software Engineer",
    company: "Linear",
    location: "San Francisco, CA",
    salary: "$180k - $210k",
    status: "saved",
    appliedDate: new Date().toISOString().split("T")[0],
    notes: "Need to update portfolio with recent desktop app case study before submitting.",
  },
];

interface JobApplicationsBoardProps {
  resumes: Resume[];
}

export function JobApplicationsBoard({ resumes }: JobApplicationsBoardProps) {
  const isLoaded = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const [applications, setApplications] = useState<JobApplication[]>(() => {
    if (typeof window === "undefined") return DEFAULT_SAMPLE_APPLICATIONS;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SAMPLE_APPLICATIONS));
      return DEFAULT_SAMPLE_APPLICATIONS;
    } catch {
      return DEFAULT_SAMPLE_APPLICATIONS;
    }
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<JobApplication | null>(null);

  // Form State
  const [formJobTitle, setFormJobTitle] = useState("");
  const [formCompany, setFormCompany] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formSalary, setFormSalary] = useState("");
  const [formStatus, setFormStatus] = useState<ApplicationStatus>("applied");
  const [formAppliedDate, setFormAppliedDate] = useState(new Date().toISOString().split("T")[0]);
  const [formJobUrl, setFormJobUrl] = useState("");
  const [formResumeId, setFormResumeId] = useState("");
  const [formNotes, setFormNotes] = useState("");

  // Save on changes
  const saveApplications = (updated: JobApplication[]) => {
    setApplications(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to persist applications:", e);
    }
  };

  const openAddModal = (initialStatus: ApplicationStatus = "applied") => {
    setEditingApp(null);
    setFormJobTitle("");
    setFormCompany("");
    setFormLocation("");
    setFormSalary("");
    setFormStatus(initialStatus);
    setFormAppliedDate(new Date().toISOString().split("T")[0]);
    setFormJobUrl("");
    setFormResumeId(resumes[0]?.id || "");
    setFormNotes("");
    setIsModalOpen(true);
  };

  const openEditModal = (app: JobApplication) => {
    setEditingApp(app);
    setFormJobTitle(app.jobTitle);
    setFormCompany(app.company);
    setFormLocation(app.location || "");
    setFormSalary(app.salary || "");
    setFormStatus(app.status);
    setFormAppliedDate(app.appliedDate || new Date().toISOString().split("T")[0]);
    setFormJobUrl(app.jobUrl || "");
    setFormResumeId(app.resumeId || "");
    setFormNotes(app.notes || "");
    setIsModalOpen(true);
  };

  const handleSaveApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formJobTitle.trim() || !formCompany.trim()) {
      toast.error("Please provide both job title and company name.");
      return;
    }

    const linkedResume = resumes.find((r) => r.id === formResumeId);

    if (editingApp) {
      const updated = applications.map((a) =>
        a.id === editingApp.id
          ? {
              ...a,
              jobTitle: formJobTitle.trim(),
              company: formCompany.trim(),
              location: formLocation.trim() || undefined,
              salary: formSalary.trim() || undefined,
              status: formStatus,
              appliedDate: formAppliedDate,
              jobUrl: formJobUrl.trim() || undefined,
              resumeId: formResumeId || undefined,
              resumeTitle: linkedResume?.title || undefined,
              notes: formNotes.trim() || undefined,
              updatedAt: new Date().toISOString(),
            }
          : a
      );
      saveApplications(updated);
      toast.success("Application updated!");
    } else {
      const newApp: JobApplication = {
        id: `app-${Date.now()}`,
        jobTitle: formJobTitle.trim(),
        company: formCompany.trim(),
        location: formLocation.trim() || undefined,
        salary: formSalary.trim() || undefined,
        status: formStatus,
        appliedDate: formAppliedDate,
        jobUrl: formJobUrl.trim() || undefined,
        resumeId: formResumeId || undefined,
        resumeTitle: linkedResume?.title || undefined,
        notes: formNotes.trim() || undefined,
        createdAt: new Date().toISOString(),
      };
      saveApplications([newApp, ...applications]);
      toast.success("Job application tracked!");
    }

    setIsModalOpen(false);
  };

  const handleDeleteApplication = (id: string) => {
    const updated = applications.filter((a) => a.id !== id);
    saveApplications(updated);
    toast.success("Application removed.");
  };

  const handleStatusChange = (id: string, nextStatus: ApplicationStatus) => {
    const updated = applications.map((a) => (a.id === id ? { ...a, status: nextStatus } : a));
    saveApplications(updated);
    toast.success(`Moved to ${APPLICATION_STATUS_CONFIG[nextStatus].label}`);
  };

  // Metrics
  const stats = useMemo(() => {
    const total = applications.length;
    const interviewing = applications.filter((a) => a.status === "interviewing").length;
    const offers = applications.filter((a) => a.status === "offered").length;
    const applied = applications.filter((a) => a.status === "applied").length;
    const successRate = total > 0 ? Math.round(((interviewing + offers) / total) * 100) : 0;

    return { total, interviewing, offers, applied, successRate };
  }, [applications]);

  // Filtered List
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const matchesSearch =
        app.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (app.location && app.location.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = filterStatus === "all" || app.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [applications, searchQuery, filterStatus]);

  const columns: ApplicationStatus[] = ["saved", "applied", "interviewing", "offered", "rejected"];

  if (!isLoaded) return null;

  return (
    <div className="space-y-6">
      {/* Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-card/70 backdrop-blur-xl border border-white/[0.08] shadow-sm flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-foreground tracking-tight">{stats.total}</div>
            <div className="text-xs font-medium text-muted-foreground">Total Tracked</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card/70 backdrop-blur-xl border border-white/[0.08] shadow-sm flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-foreground tracking-tight">{stats.interviewing}</div>
            <div className="text-xs font-medium text-muted-foreground">Interviews</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card/70 backdrop-blur-xl border border-white/[0.08] shadow-sm flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-foreground tracking-tight">{stats.offers}</div>
            <div className="text-xs font-medium text-muted-foreground">Job Offers</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card/70 backdrop-blur-xl border border-white/[0.08] shadow-sm flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-foreground tracking-tight">{stats.successRate}%</div>
            <div className="text-xs font-medium text-muted-foreground">Response Rate</div>
          </div>
        </div>
      </div>

      {/* Control Bar: Search + Filter + View Mode + Add Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2.5 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Search by role or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-11 bg-card/80 border-white/[0.08] text-xs text-foreground rounded-xl placeholder:text-muted-foreground focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/40"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-11 px-3 bg-card/80 border border-white/[0.08] text-xs text-foreground font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/40 transition-colors"
          >
            <option value="all">All Statuses</option>
            <option value="saved">Saved</option>
            <option value="applied">Applied</option>
            <option value="interviewing">Interviewing</option>
            <option value="offered">Offered</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          {/* View Toggle */}
          <div className="bg-card/80 border border-white/[0.08] p-1 rounded-xl flex items-center text-xs">
            <button
              type="button"
              onClick={() => setViewMode("kanban")}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${
                viewMode === "kanban"
                  ? "bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Board
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${
                viewMode === "list"
                  ? "bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              List
            </button>
          </div>

          <Button
            type="button"
            onClick={() => openAddModal("applied")}
            className="h-11 px-4 text-xs bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-bold rounded-xl shadow-lg shadow-cyan-500/20 active:scale-[0.98] flex items-center gap-1.5 border-0"
          >
            <Plus className="w-4 h-4 text-slate-950" />
            <span>Track Application</span>
          </Button>
        </div>
      </div>

      {/* KANBAN BOARD VIEW */}
      {viewMode === "kanban" && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start overflow-x-auto pb-4">
          {columns.map((colKey) => {
            const config = APPLICATION_STATUS_CONFIG[colKey];
            const colApps = filteredApplications.filter((a) => a.status === colKey);

            return (
              <div
                key={colKey}
                className="rounded-2xl bg-card/60 backdrop-blur-xl border border-white/[0.08] p-3.5 space-y-3 min-w-[240px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${config.color.replace("text-", "bg-")}`} />
                    <h3 className="text-xs font-bold text-foreground">{config.label}</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-white/[0.06] text-muted-foreground border border-white/[0.04]">
                    {colApps.length}
                  </span>
                </div>

                {/* Column Cards */}
                <div className="space-y-2.5 min-h-[140px]">
                  <AnimatePresence>
                    {colApps.map((app) => (
                      <motion.div
                        key={app.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className={`p-3.5 rounded-xl bg-background/80 border border-white/[0.08] ${config.borderClass} border-l-2 space-y-2.5 group hover:border-cyan-500/40 hover:shadow-lg hover:shadow-cyan-500/5 transition-all`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-0.5 min-w-0">
                            <h4 className="text-xs font-bold text-foreground truncate">{app.jobTitle}</h4>
                            <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                              <Building2 className="w-3 h-3 text-cyan-400/80 shrink-0" />
                              <span className="truncate">{app.company}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            <button
                              type="button"
                              onClick={() => openEditModal(app)}
                              className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-white/[0.08] transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteApplication(app.id)}
                              className="p-1 rounded text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Location / Salary Tags */}
                        <div className="flex flex-wrap gap-1.5 text-[10px] text-muted-foreground">
                          {app.location && (
                            <span className="flex items-center gap-0.5">
                              <MapPin className="w-2.5 h-2.5 text-muted-foreground" />
                              <span className="truncate max-w-[120px]">{app.location}</span>
                            </span>
                          )}
                          {app.salary && (
                            <span className="text-emerald-400 font-mono font-medium">{app.salary}</span>
                          )}
                        </div>

                        {/* Notes preview */}
                        {app.notes && (
                          <p className="text-[11px] text-muted-foreground/90 line-clamp-2 italic bg-white/[0.02] p-1.5 rounded-lg border border-white/[0.04]">
                            &ldquo;{app.notes}&rdquo;
                          </p>
                        )}

                        {/* Quick Status Shift selector */}
                        <div className="pt-1.5 flex items-center justify-between border-t border-white/[0.06] text-[10px]">
                          <span className="text-muted-foreground font-mono">{app.appliedDate}</span>

                          <select
                            value={app.status}
                            onChange={(e) =>
                              handleStatusChange(app.id, e.target.value as ApplicationStatus)
                            }
                            className="bg-card border border-white/[0.08] rounded-md px-1.5 py-0.5 text-foreground text-[10px] focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                          >
                            <option value="saved">Saved</option>
                            <option value="applied">Applied</option>
                            <option value="interviewing">Interviewing</option>
                            <option value="offered">Offered</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {colApps.length === 0 && (
                    <div
                      onClick={() => openAddModal(colKey)}
                      className="border border-dashed border-white/[0.08] rounded-xl p-4 text-center cursor-pointer hover:border-cyan-500/30 hover:bg-cyan-500/[0.02] transition-all flex flex-col items-center justify-center gap-1 text-muted-foreground group"
                    >
                      <Plus className="w-4 h-4 text-muted-foreground group-hover:text-cyan-400 transition-colors" />
                      <span className="text-[11px] group-hover:text-foreground transition-colors">
                        Add {config.label.split("/")[0].trim()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* LIST VIEW */}
      {viewMode === "list" && (
        <div className="rounded-2xl bg-card/60 backdrop-blur-xl border border-white/[0.08] overflow-hidden">
          <div className="divide-y divide-white/[0.06]">
            {filteredApplications.map((app) => {
              const config = APPLICATION_STATUS_CONFIG[app.status];
              return (
                <div
                  key={app.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-foreground">{app.jobTitle}</h4>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${config.badgeClass}`}
                      >
                        {config.label}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1 text-foreground font-medium">
                        <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                        {app.company}
                      </span>
                      {app.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                          {app.location}
                        </span>
                      )}
                      {app.salary && (
                        <span className="text-emerald-400 font-mono font-medium">{app.salary}</span>
                      )}
                      <span className="text-muted-foreground">Applied: {app.appliedDate}</span>
                    </div>
                    {app.notes && (
                      <p className="text-xs text-muted-foreground italic pt-1 max-w-2xl">{app.notes}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {app.jobUrl && (
                      <a
                        href={app.jobUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-muted-foreground hover:text-foreground transition-colors"
                        title="Open Job Posting"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(app)}
                      className="h-8 text-xs bg-card border-white/[0.08] text-foreground hover:bg-white/[0.06]"
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteApplication(app.id)}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-rose-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}

            {filteredApplications.length === 0 && (
              <div className="text-center py-12 text-muted-foreground text-xs">
                No matching job applications found.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ADD / EDIT APPLICATION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-2xl bg-card border border-white/[0.1] shadow-2xl p-6 space-y-5 text-foreground max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3.5">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <Briefcase className="w-4 h-4" />
                </div>
                <span>{editingApp ? "Edit Job Application" : "Track New Application"}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveApplication} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Job Title *</label>
                  <Input
                    required
                    placeholder="e.g. Senior Frontend Engineer"
                    value={formJobTitle}
                    onChange={(e) => setFormJobTitle(e.target.value)}
                    className="h-10 bg-background/60 border-white/[0.08] text-xs text-foreground focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/40"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Company Name *</label>
                  <Input
                    required
                    placeholder="e.g. Google, Stripe"
                    value={formCompany}
                    onChange={(e) => setFormCompany(e.target.value)}
                    className="h-10 bg-background/60 border-white/[0.08] text-xs text-foreground focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Location</label>
                  <Input
                    placeholder="e.g. Remote / New York"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    className="h-10 bg-background/60 border-white/[0.08] text-xs text-foreground focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/40"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Salary Range</label>
                  <Input
                    placeholder="e.g. $140k - $170k"
                    value={formSalary}
                    onChange={(e) => setFormSalary(e.target.value)}
                    className="h-10 bg-background/60 border-white/[0.08] text-xs text-foreground focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as ApplicationStatus)}
                    className="w-full h-10 px-3 bg-background/60 border border-white/[0.08] text-xs text-foreground rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/40"
                  >
                    <option value="saved">Saved / Wishlist</option>
                    <option value="applied">Applied</option>
                    <option value="interviewing">Interviewing</option>
                    <option value="offered">Offer Received</option>
                    <option value="rejected">Rejected / Closed</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Applied Date</label>
                  <Input
                    type="date"
                    value={formAppliedDate}
                    onChange={(e) => setFormAppliedDate(e.target.value)}
                    className="h-10 bg-background/60 border-white/[0.08] text-xs text-foreground focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/40"
                  />
                </div>
              </div>

              {resumes.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Linked Resume</label>
                  <select
                    value={formResumeId}
                    onChange={(e) => setFormResumeId(e.target.value)}
                    className="w-full h-10 px-3 bg-background/60 border border-white/[0.08] text-xs text-foreground rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/40"
                  >
                    <option value="">-- None / General --</option>
                    {resumes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.title} ({r.targetJob || "General"})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Job URL</label>
                <Input
                  type="url"
                  placeholder="https://company.com/job/123"
                  value={formJobUrl}
                  onChange={(e) => setFormJobUrl(e.target.value)}
                  className="h-10 bg-background/60 border-white/[0.08] text-xs text-foreground focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/40"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Notes / Interview Details</label>
                <textarea
                  rows={3}
                  placeholder="Recruiter contact, interview rounds, salary requirements, questions asked..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full p-3 bg-background/60 border border-white/[0.08] text-xs text-foreground rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/40 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/[0.08]">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                  className="h-10 px-4 text-xs bg-card border-white/[0.08] text-foreground hover:bg-white/[0.06]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="h-10 px-5 text-xs bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-bold rounded-xl shadow-lg shadow-cyan-500/20"
                >
                  {editingApp ? "Save Changes" : "Add Application"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
