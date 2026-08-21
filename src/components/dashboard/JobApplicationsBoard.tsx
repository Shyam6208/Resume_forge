"use client";

import { useState, useEffect, useMemo } from "react";
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
  ListFilter,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  Clock,
  TrendingUp,
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
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
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

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setApplications(JSON.parse(saved));
      } else {
        setApplications(DEFAULT_SAMPLE_APPLICATIONS);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SAMPLE_APPLICATIONS));
      }
    } catch {
      setApplications(DEFAULT_SAMPLE_APPLICATIONS);
    } finally {
      setIsLoaded(true);
    }
  }, []);

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
      // Update
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
      // Create
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.06] flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xl font-bold text-white">{stats.total}</div>
            <div className="text-[11px] text-slate-400">Total Tracked</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.06] flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xl font-bold text-white">{stats.interviewing}</div>
            <div className="text-[11px] text-slate-400">Interviews</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.06] flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xl font-bold text-white">{stats.offers}</div>
            <div className="text-[11px] text-slate-400">Job Offers</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.06] flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xl font-bold text-white">{stats.successRate}%</div>
            <div className="text-[11px] text-slate-400">Response Rate</div>
          </div>
        </div>
      </div>

      {/* Control Bar: Search + Filter + View Mode + Add Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Search by role or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 bg-slate-900/80 border-white/[0.08] text-xs text-white rounded-xl placeholder:text-slate-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-10 px-3 bg-slate-900/80 border border-white/[0.08] text-xs text-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="saved">Saved</option>
            <option value="applied">Applied</option>
            <option value="interviewing">Interviewing</option>
            <option value="offered">Offered</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* View Toggle */}
          <div className="bg-slate-900 border border-white/[0.08] p-0.5 rounded-xl flex items-center text-xs">
            <button
              type="button"
              onClick={() => setViewMode("kanban")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                viewMode === "kanban" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Board
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                viewMode === "list" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              List
            </button>
          </div>

          <Button
            type="button"
            onClick={() => openAddModal("applied")}
            className="h-10 px-4 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
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
                className="rounded-2xl bg-slate-900/40 border border-white/[0.06] p-3 space-y-3 min-w-[240px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${config.color.replace("text-", "bg-")}`} />
                    <h3 className="text-xs font-bold text-slate-200">{config.label}</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/[0.05] text-slate-400">
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
                        className={`p-3.5 rounded-xl bg-slate-950/80 border border-white/[0.06] ${config.borderClass} border-l-2 space-y-2.5 group hover:border-white/[0.15] transition-all`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-0.5 min-w-0">
                            <h4 className="text-xs font-bold text-white truncate">{app.jobTitle}</h4>
                            <div className="text-[11px] text-slate-400 flex items-center gap-1">
                              <Building2 className="w-3 h-3 text-slate-500 shrink-0" />
                              <span className="truncate">{app.company}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            <button
                              type="button"
                              onClick={() => openEditModal(app)}
                              className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/[0.06]"
                              title="Edit"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteApplication(app.id)}
                              className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                              title="Delete"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Location / Salary Tags */}
                        <div className="flex flex-wrap gap-1 text-[10px] text-slate-500">
                          {app.location && (
                            <span className="flex items-center gap-0.5">
                              <MapPin className="w-2.5 h-2.5" />
                              <span className="truncate max-w-[120px]">{app.location}</span>
                            </span>
                          )}
                          {app.salary && (
                            <span className="text-emerald-400/80 font-mono">{app.salary}</span>
                          )}
                        </div>

                        {/* Notes preview */}
                        {app.notes && (
                          <p className="text-[11px] text-slate-400 line-clamp-2 italic bg-white/[0.02] p-1.5 rounded-lg border border-white/[0.03]">
                            &ldquo;{app.notes}&rdquo;
                          </p>
                        )}

                        {/* Quick Status Shift selector */}
                        <div className="pt-1 flex items-center justify-between border-t border-white/[0.04] text-[10px]">
                          <span className="text-slate-500 font-mono">{app.appliedDate}</span>

                          <select
                            value={app.status}
                            onChange={(e) =>
                              handleStatusChange(app.id, e.target.value as ApplicationStatus)
                            }
                            className="bg-slate-900 border border-white/[0.06] rounded px-1.5 py-0.5 text-slate-300 text-[10px] focus:outline-none"
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
                      className="border border-dashed border-white/[0.06] rounded-xl p-4 text-center cursor-pointer hover:border-white/[0.12] hover:bg-white/[0.01] transition-all flex flex-col items-center justify-center gap-1 text-slate-500"
                    >
                      <Plus className="w-4 h-4 text-slate-600" />
                      <span className="text-[11px]">Add {config.label.split("/")[0].trim()}</span>
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
        <div className="rounded-2xl bg-slate-900/40 border border-white/[0.06] overflow-hidden">
          <div className="divide-y divide-white/[0.05]">
            {filteredApplications.map((app) => {
              const config = APPLICATION_STATUS_CONFIG[app.status];
              return (
                <div
                  key={app.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">{app.jobTitle}</h4>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${config.badgeClass}`}
                      >
                        {config.label}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                      <span className="flex items-center gap-1 text-slate-300 font-medium">
                        <Building2 className="w-3.5 h-3.5 text-slate-500" />
                        {app.company}
                      </span>
                      {app.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" />
                          {app.location}
                        </span>
                      )}
                      {app.salary && (
                        <span className="text-emerald-400 font-mono">{app.salary}</span>
                      )}
                      <span className="text-slate-500">Applied: {app.appliedDate}</span>
                    </div>
                    {app.notes && (
                      <p className="text-xs text-slate-400 italic pt-1 max-w-2xl">{app.notes}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {app.jobUrl && (
                      <a
                        href={app.jobUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] text-slate-400 hover:text-white transition-colors"
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
                      className="h-8 text-xs bg-slate-900 border-white/[0.08] text-slate-300 hover:text-white"
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteApplication(app.id)}
                      className="h-8 w-8 p-0 text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}

            {filteredApplications.length === 0 && (
              <div className="text-center py-12 text-slate-500 text-xs">
                No matching job applications found.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ADD / EDIT APPLICATION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-white/[0.1] shadow-2xl p-6 space-y-5 text-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-indigo-400" />
                <span>{editingApp ? "Edit Job Application" : "Track New Application"}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveApplication} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Job Title *</label>
                  <Input
                    required
                    placeholder="e.g. Senior Frontend Engineer"
                    value={formJobTitle}
                    onChange={(e) => setFormJobTitle(e.target.value)}
                    className="h-10 bg-slate-950 border-white/[0.08] text-xs text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Company Name *</label>
                  <Input
                    required
                    placeholder="e.g. Google, Stripe"
                    value={formCompany}
                    onChange={(e) => setFormCompany(e.target.value)}
                    className="h-10 bg-slate-950 border-white/[0.08] text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Location</label>
                  <Input
                    placeholder="e.g. Remote / New York"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    className="h-10 bg-slate-950 border-white/[0.08] text-xs text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Salary Range</label>
                  <Input
                    placeholder="e.g. $140k - $170k"
                    value={formSalary}
                    onChange={(e) => setFormSalary(e.target.value)}
                    className="h-10 bg-slate-950 border-white/[0.08] text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as ApplicationStatus)}
                    className="w-full h-10 px-3 bg-slate-950 border border-white/[0.08] text-xs text-white rounded-xl focus:outline-none"
                  >
                    <option value="saved">Saved / Wishlist</option>
                    <option value="applied">Applied</option>
                    <option value="interviewing">Interviewing</option>
                    <option value="offered">Offer Received</option>
                    <option value="rejected">Rejected / Closed</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Applied Date</label>
                  <Input
                    type="date"
                    value={formAppliedDate}
                    onChange={(e) => setFormAppliedDate(e.target.value)}
                    className="h-10 bg-slate-950 border-white/[0.08] text-xs text-white"
                  />
                </div>
              </div>

              {resumes.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Linked Resume</label>
                  <select
                    value={formResumeId}
                    onChange={(e) => setFormResumeId(e.target.value)}
                    className="w-full h-10 px-3 bg-slate-950 border border-white/[0.08] text-xs text-white rounded-xl focus:outline-none"
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
                <label className="text-xs font-medium text-slate-300">Job URL</label>
                <Input
                  type="url"
                  placeholder="https://company.com/job/123"
                  value={formJobUrl}
                  onChange={(e) => setFormJobUrl(e.target.value)}
                  className="h-10 bg-slate-950 border-white/[0.08] text-xs text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Notes / Interview Details</label>
                <textarea
                  rows={3}
                  placeholder="Recruiter contact, interview rounds, salary requirements, questions asked..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-white/[0.08] text-xs text-white rounded-xl focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/[0.06]">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                  className="h-9 px-4 text-xs bg-slate-900 border-white/[0.08] text-slate-300 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="h-9 px-5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl"
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
