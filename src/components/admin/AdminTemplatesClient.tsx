"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileCode2, Search, Filter, Eye, AlertTriangle, Target, Loader2,
  Plus, Edit3, Trash2, Copy, Globe, GlobeLock,
} from "lucide-react";
import { TEMPLATES } from "@/config/templates.config";
import type { TemplateConfig } from "@/config/templates.config";
import { TemplateDetailsModal } from "./TemplateDetailsModal";
import { AdminTemplatesSkeleton } from "./AdminTemplatesSkeleton";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";

interface UsageData {
  usageMap: Record<string, number>;
  totalResumes: number;
}

interface DbTemplate {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string;
  tags: string[];
  thumbnail_url: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  template_config: any | null;
  status: "draft" | "published" | "archived";
  is_featured: boolean;
  is_premium: boolean;
  is_ats_friendly: boolean;
  ats_rating: number | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export function AdminTemplatesClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usageData, setUsageData] = useState<UsageData>({ usageMap: {}, totalResumes: 0 });
  const [dbTemplates, setDbTemplates] = useState<DbTemplate[]>([]);
  const [dbLoading, setDbLoading] = useState(true);
  
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [activeTab, setActiveTab] = useState<"builtin" | "custom">("custom");
  
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateConfig | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUsage() {
      try {
        const res = await fetch("/api/admin/templates/usage");
        if (!res.ok) throw new Error("Failed to fetch template usage statistics");
        const data = await res.json();
        if (data.success) {
          setUsageData({ usageMap: data.usageMap, totalResumes: data.totalResumes });
        } else {
          throw new Error(data.error || "Failed to fetch usage data");
        }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error(err);
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    }
    fetchUsage();
  }, []);

  useEffect(() => {
    async function fetchDbTemplates() {
      try {
        const res = await fetch("/api/admin/templates");
        if (!res.ok) throw new Error("Failed to fetch custom templates");
        const data = await res.json();
        setDbTemplates(data.templates || []);
      } catch (err) {
        console.warn("Could not load DB templates:", err);
      } finally {
        setDbLoading(false);
      }
    }
    fetchDbTemplates();
  }, []);

  const categories = useMemo(() => {
    const cats = new Set([...TEMPLATES.map(t => t.category), ...dbTemplates.map(t => t.category)]);
    return Array.from(cats);
  }, [dbTemplates]);

  const filteredBuiltinTemplates = useMemo(() => {
    return TEMPLATES.filter(template => {
      const matchesSearch = template.name.toLowerCase().includes(search.toLowerCase()) || template.slug.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === "all" || template.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [search, categoryFilter]);

  const filteredDbTemplates = useMemo(() => {
    return dbTemplates.filter(template => {
      const matchesSearch = template.name.toLowerCase().includes(search.toLowerCase()) || template.slug.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === "all" || template.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [search, categoryFilter, dbTemplates]);

  const handleAction = async (templateId: string, action: "publish" | "unpublish" | "archive" | "duplicate") => {
    setActionLoading(templateId);
    try {
      const res = await fetch(`/api/admin/templates/${templateId}/${action}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || `Failed to ${action}`);
      toast.success(`Template ${action}ed successfully!`);
      const listRes = await fetch("/api/admin/templates");
      const listData = await listRes.json();
      setDbTemplates(listData.templates || []);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : `Failed to ${action} template`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (templateId: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) return;
    setActionLoading(templateId);
    try {
      const res = await fetch(`/api/admin/templates/${templateId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Delete failed");
      toast.success("Template deleted!");
      setDbTemplates(prev => prev.filter(t => t.id !== templateId));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete template");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">Published</span>;
      case "archived":
        return <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-500/15 text-slate-400 border border-slate-500/30 font-bold">Archived</span>;
      default:
        return <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold">Draft</span>;
    }
  };

  if (loading && dbLoading) return <AdminTemplatesSkeleton />;

  if (error && dbTemplates.length === 0) {
    return (
      <div className="p-12 text-center text-slate-400 bg-slate-900/90 rounded-3xl border border-slate-800 space-y-4">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
        <p className="text-lg font-bold text-white">Failed to load templates</p>
        <p className="text-sm">{error}</p>
        <Button onClick={() => window.location.reload()} variant="outline" className="mt-4 bg-slate-800 border-slate-700">Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Template Management</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-semibold">
              {TEMPLATES.length + dbTemplates.length} Total
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Manage built-in and custom templates. Custom templates can be uploaded and published for users.
          </p>
        </div>
        <Link href="/admin/templates/create">
          <Button type="button" className="h-11 px-5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/30">
            <Plus className="w-4 h-4" />
            <span>Create New Template</span>
          </Button>
        </Link>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800 w-fit">
        <button type="button" onClick={() => setActiveTab("custom")} className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === "custom" ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-white"}`}>
          Custom Templates ({dbTemplates.length})
        </button>
        <button type="button" onClick={() => setActiveTab("builtin")} className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === "builtin" ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-white"}`}>
          Built-in ({TEMPLATES.length})
        </button>
      </div>

      {/* Filter & Search */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input type="text" placeholder="Search by name or slug..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full h-10 pl-10 pr-4 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Category:</span>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="h-10 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none">
              <option value="all">All Categories</option>
              {categories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
            </select>
          </div>
        </div>
      </div>

      {/* Custom Templates Tab */}
      {activeTab === "custom" && (
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
          {dbLoading ? (
            <div className="p-12 text-center text-slate-400 space-y-3">
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
              <p className="text-xs">Loading custom templates...</p>
            </div>
          ) : filteredDbTemplates.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-4">
              <FileCode2 className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm font-bold text-white">No custom templates yet</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">Create your first custom template to make it available for users.</p>
              <Link href="/admin/templates/create">
                <Button className="mt-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl">
                  <Plus className="w-3.5 h-3.5 mr-1.5" />Create Template
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/50 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="px-6 py-4">Template</th>
                    <th className="px-6 py-4 hidden md:table-cell">Category</th>
                    <th className="px-6 py-4 hidden lg:table-cell">Status</th>
                    <th className="px-6 py-4 hidden lg:table-cell">ATS</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredDbTemplates.map((template) => (
                    <tr key={template.id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-14 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0 overflow-hidden">
                            {template.thumbnail_url ? (
                              <img src={template.thumbnail_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <FileCode2 className="w-5 h-5 text-indigo-400" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white flex items-center gap-2">
                              {template.name}
                              {template.is_featured && <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-medium">★ Featured</span>}
                              {template.is_premium && <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 font-medium">Premium</span>}
                            </p>
                            <p className="text-xs text-slate-500 font-mono mt-0.5">{template.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-800 text-slate-300">{template.category}</span>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell">{getStatusBadge(template.status)}</td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <div className="flex items-center gap-1.5">
                          <Target className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-xs font-bold text-emerald-400">{template.ats_rating || 90}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button variant="ghost" size="sm" onClick={() => router.push(`/admin/templates/${template.id}/edit`)} className="h-8 px-2.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200" title="Edit">
                            <Edit3 className="w-3.5 h-3.5" />
                          </Button>
                          {template.status === "published" ? (
                            <Button variant="ghost" size="sm" onClick={() => handleAction(template.id, "unpublish")} disabled={actionLoading === template.id} className="h-8 px-2.5 text-xs bg-amber-500/10 hover:bg-amber-500/20 text-amber-400" title="Unpublish">
                              <GlobeLock className="w-3.5 h-3.5" />
                            </Button>
                          ) : (
                            <Button variant="ghost" size="sm" onClick={() => handleAction(template.id, "publish")} disabled={actionLoading === template.id} className="h-8 px-2.5 text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400" title="Publish">
                              <Globe className="w-3.5 h-3.5" />
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" onClick={() => handleAction(template.id, "duplicate")} disabled={actionLoading === template.id} className="h-8 px-2.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300" title="Duplicate">
                            <Copy className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(template.id, template.name)} disabled={actionLoading === template.id} className="h-8 px-2.5 text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400" title="Delete">
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Built-in Templates Tab */}
      {activeTab === "builtin" && (
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
          {filteredBuiltinTemplates.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-3">
              <FileCode2 className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm font-bold text-white">No templates found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/50 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="px-6 py-4">Template</th>
                    <th className="px-6 py-4 hidden md:table-cell">Category</th>
                    <th className="px-6 py-4 hidden lg:table-cell">ATS Rating</th>
                    <th className="px-6 py-4">Usage</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredBuiltinTemplates.map((template) => {
                    const usage = usageData.usageMap[template.id] || 0;
                    const percentage = usageData.totalResumes > 0 ? ((usage / usageData.totalResumes) * 100).toFixed(1) : "0.0";
                    return (
                      <tr key={template.id} className="hover:bg-slate-800/20 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0">
                              <FileCode2 className="w-5 h-5 text-indigo-400" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white flex items-center gap-2">
                                {template.name}
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 font-medium">Built-in</span>
                              </p>
                              <p className="text-xs text-slate-500 font-mono mt-0.5">{template.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell">
                          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-800 text-slate-300">{template.category}</span>
                        </td>
                        <td className="px-6 py-4 hidden lg:table-cell">
                          <div className="flex items-center gap-1.5">
                            <Target className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-xs font-bold text-emerald-400">{template.atsRating}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-baseline gap-2">
                              <span className="text-sm font-bold text-white">{usage}</span>
                              <span className="text-xs text-slate-500">resumes ({percentage}%)</span>
                            </div>
                            <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min(100, Number(percentage))}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button variant="ghost" size="sm" onClick={() => setSelectedTemplate(template)} className="h-8 px-3 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200">
                            <Eye className="w-3.5 h-3.5 mr-1.5" />Details
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <TemplateDetailsModal
        isOpen={!!selectedTemplate}
        onClose={() => setSelectedTemplate(null)}
        template={selectedTemplate}
        usageCount={selectedTemplate ? usageData.usageMap[selectedTemplate.id] || 0 : 0}
        totalResumes={usageData.totalResumes}
      />
    </div>
  );
}
