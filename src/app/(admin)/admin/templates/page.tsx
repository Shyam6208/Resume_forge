"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  FileCode2,
  Search,
  Filter,
  Plus,
  Edit2,
  Copy,
  Eye,
  CheckCircle2,
  XCircle,
  Archive,
  Trash2,
  Loader2,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import type { ResumeTemplateRow } from "@/types/database.types";

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<ResumeTemplateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Confirmation modal state for deletion
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (categoryFilter !== "all") params.set("category", categoryFilter);

      const res = await fetch(`/api/admin/templates?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch templates.");
      const data = await res.json();
      setTemplates(data.templates || []);
    } catch (err: unknown) {
      console.error("Fetch templates error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to load templates.");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, categoryFilter]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  // Action handlers: Publish, Unpublish, Archive, Duplicate
  const handleAction = async (id: string, action: string) => {
    setActionLoadingId(id);
    try {
      const res = await fetch(`/api/admin/templates/${id}/${action}`, {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || `Failed to ${action} template.`);
      }

      toast.success(`Template ${action}ed successfully!`);
      fetchTemplates();
    } catch (err: unknown) {
      console.error(`Action ${action} error:`, err);
      toast.error(err instanceof Error ? err.message : `Failed to ${action} template.`);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Delete handler
  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    setActionLoadingId(deletingId);
    try {
      const res = await fetch(`/api/admin/templates/${deletingId}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to delete template.");
      }

      toast.success("Template deleted successfully!");
      setDeletingId(null);
      fetchTemplates();
    } catch (err: unknown) {
      console.error("Delete error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to delete template.");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Template Management</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-semibold">
              {templates.length}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Create, preview, publish, archive, and manage dynamic resume templates.
          </p>
        </div>

        <Link href="/admin/templates/new">
          <Button
            type="button"
            className="h-10 px-5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md flex items-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Template</span>
          </Button>
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, slug, tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-10 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none"
            >
              <option value="all">All Categories</option>
              <option value="Modern">Modern</option>
              <option value="Minimal">Minimal</option>
              <option value="Fresher">Fresher</option>
              <option value="Developer">Developer</option>
              <option value="Corporate">Corporate</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Container (Responsive Horizontal Scroll) */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
            <p className="text-xs">Loading database templates...</p>
          </div>
        ) : templates.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <FileCode2 className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm font-bold text-white">No templates found</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No dynamic database templates match your current filters. Create a new template to get started.
            </p>
            <div className="pt-2">
              <Link href="/admin/templates/new">
                <Button type="button" className="h-9 px-4 text-xs bg-indigo-600 text-white font-bold rounded-xl">
                  + Add Template
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="p-4">Preview</th>
                  <th className="p-4">Name & Slug</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">ATS %</th>
                  <th className="p-4">Flags</th>
                  <th className="p-4">Version</th>
                  <th className="p-4">Updated</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {templates.map((t) => {
                  const isLoadingThis = actionLoadingId === t.id;
                  const isPublished = t.status === "published";
                  const isDraft = t.status === "draft";

                  return (
                    <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Preview Image */}
                      <td className="p-4">
                        <div className="w-12 h-14 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center shrink-0">
                          {t.thumbnail_url ? (
                            <img
                              src={t.thumbnail_url}
                              alt={t.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <FileCode2 className="w-5 h-5 text-indigo-400" />
                          )}
                        </div>
                      </td>

                      {/* Name & Slug */}
                      <td className="p-4">
                        <p className="font-bold text-white text-sm">{t.name}</p>
                        <p className="text-[11px] text-slate-400 font-mono">slug: {t.slug}</p>
                        {Array.isArray(t.tags) && t.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {t.tags.slice(0, 3).map((tag) => (
                              <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Category */}
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-semibold">
                          {t.category || "Modern"}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                            isPublished
                              ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                              : t.status === "archived"
                              ? "bg-slate-800 text-slate-400 border-slate-700"
                              : "bg-amber-500/10 text-amber-300 border-amber-500/30"
                          }`}
                        >
                          {isPublished ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          ) : isDraft ? (
                            <Sparkles className="w-3 h-3 text-amber-400" />
                          ) : (
                            <Archive className="w-3 h-3 text-slate-400" />
                          )}
                          <span>{t.status.toUpperCase()}</span>
                        </span>
                      </td>

                      {/* ATS Score */}
                      <td className="p-4 font-semibold text-emerald-400">
                        {t.ats_rating || 90}%
                      </td>

                      {/* Flags */}
                      <td className="p-4 space-y-1">
                        {t.is_featured && (
                          <span className="block text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 w-fit">
                            Featured
                          </span>
                        )}
                        {t.is_premium && (
                          <span className="block text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 w-fit">
                            Premium
                          </span>
                        )}
                        {t.is_ats_friendly && (
                          <span className="block text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 w-fit">
                            ATS Friendly
                          </span>
                        )}
                      </td>

                      {/* Version */}
                      <td className="p-4 font-mono text-slate-400">v{t.version || "1.0"}</td>

                      {/* Updated Date */}
                      <td className="p-4 text-[11px] text-slate-400 whitespace-nowrap">
                        {t.updated_at
                          ? new Date(t.updated_at).toLocaleDateString()
                          : "Recently"}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isLoadingThis ? (
                            <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                          ) : (
                            <>
                              {/* Edit */}
                              <Link
                                href={`/admin/templates/${t.id}/edit`}
                                className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
                                title="Edit Template"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </Link>

                              {/* Duplicate */}
                              <button
                                type="button"
                                onClick={() => handleAction(t.id, "duplicate")}
                                className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
                                title="Duplicate Template"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>

                              {/* Publish / Unpublish */}
                              {isPublished ? (
                                <button
                                  type="button"
                                  onClick={() => handleAction(t.id, "unpublish")}
                                  className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-colors"
                                  title="Unpublish (Convert to Draft)"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleAction(t.id, "publish")}
                                  className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-colors"
                                  title="Publish Template"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* Delete */}
                              <button
                                type="button"
                                onClick={() => setDeletingId(t.id)}
                                className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors"
                                title="Delete Template"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Deletion */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-white">Delete Template?</h3>
              <p className="text-xs text-slate-400">
                Are you sure you want to delete this template? This will remove its Cloudinary preview & configuration assets.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeletingId(null)}
                className="flex-1 h-11 text-xs bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleDeleteConfirm}
                className="flex-1 h-11 text-xs bg-rose-600 hover:bg-rose-500 text-white font-bold"
              >
                Delete Template
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
