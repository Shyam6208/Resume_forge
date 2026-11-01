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
        return <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">Published</span>;
      case "archived":
        return <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-500/15 text-muted-foreground border border-white/[0.08] font-bold">Archived</span>;
      default:
        return <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold">Draft</span>;
    }
  };

  if (loading && dbLoading) return <AdminTemplatesSkeleton />;

  if (error && dbTemplates.length === 0) {
    return (
      <div className="p-12 text-center text-muted-foreground bg-card/85 rounded-3xl border border-white/[0.08] space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <p className="text-lg font-bold text-foreground">Failed to load templates</p>
        <p className="text-sm">{error}</p>
        <Button onClick={() => window.location.reload()} variant="outline" className="mt-4 bg-card border-white/[0.08] text-foreground">Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight flex items-center gap-2">
            <span>Template Management</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold">
              {TEMPLATES.length + dbTemplates.length} Total
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Manage built-in and custom templates. Custom templates can be uploaded and published for users.
          </p>
        </div>
        <Link href="/admin/templates/create">
          <Button type="button" className="h-11 px-5 text-xs bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-cyan-500/20 border-0">
            <Plus className="w-4 h-4 text-slate-950" />
            <span>Create New Template</span>
          </Button>
        </Link>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-1 bg-card/80 p-1 rounded-2xl border border-white/[0.08] w-fit">
        <button type="button" onClick={() => setActiveTab("custom")} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === "custom" ? "bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
          Custom Templates ({dbTemplates.length})
        </button>
        <button type="button" onClick={() => setActiveTab("builtin")} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === "builtin" ? "bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
          Built-in ({TEMPLATES.length})
        </button>
      </div>

      {/* Filter & Search */}
      <div className="p-4 rounded-3xl bg-card/85 backdrop-blur-xl border border-white/[0.08] flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input type="text" placeholder="Search by name or slug..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full h-10 pl-10 pr-4 bg-background/80 border border-white/[0.08] rounded-xl text-foreground text-xs placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/40" />
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold">Category:</span>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="h-10 px-3 bg-background/80 border border-white/[0.08] rounded-xl text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500/40 font-medium">
              <option value="all">All Categories</option>
              {categories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
            </select>
          </div>
        </div>
      </div>

      {/* Custom Templates Tab */}
      {activeTab === "custom" && (
        <div className="rounded-3xl bg-card/85 backdrop-blur-xl border border-white/[0.08] shadow-xl overflow-hidden">
          {dbLoading ? (
            <div className="p-12 text-center text-muted-foreground space-y-3">
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
              <p className="text-xs">Loading custom templates...</p>
            </div>
          ) : filteredDbTemplates.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground space-y-4">
              <FileCode2 className="w-10 h-10 text-muted-foreground mx-auto opacity-50" />
              <p className="text-sm font-bold text-foreground">No custom templates yet</p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">Create your first custom template to make it available for users.</p>
              <Link href="/admin/templates/create">
                <Button className="mt-2 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 text-xs font-bold rounded-xl shadow-lg shadow-cyan-500/20 border-0">
                  <Plus className="w-3.5 h-3.5 mr-1.5 text-slate-950" />Create Template
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-background/80 border-b border-white/[0.08] text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <th className="px-6 py-4">Template</th>
                    <th className="px-6 py-4 hidden md:table-cell">Category</th>
                    <th className="px-6 py-4 hidden lg:table-cell">Status</th>
                    <th className="px-6 py-4 hidden lg:table-cell">ATS</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {filteredDbTemplates.map((template) => (
                    <tr key={template.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-14 rounded-xl bg-background border border-white/[0.08] flex items-center justify-center shrink-0 overflow-hidden">
                            {template.thumbnail_url ? (
                              <img src={template.thumbnail_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <FileCode2 className="w-5 h-5 text-cyan-400" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground flex items-center gap-2">
                              {template.name}
                              {template.is_featured && <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-medium">★ Featured</span>}
                              {template.is_premium && <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 font-medium">Premium</span>}
                            </p>
                            <p className="text-xs text-muted-foreground font-mono mt-0.5">{template.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-card border border-white/[0.08] text-foreground">{template.category}</span>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell">{getStatusBadge(template.status)}</td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <div className="flex items-center gap-1.5">
                          <Target className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-xs font-bold text-emerald-400 font-mono">{template.ats_rating || 90}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button variant="ghost" size="sm" onClick={() => router.push(`/admin/templates/${template.id}/edit`)} className="h-8 px-2.5 text-xs bg-card hover:bg-white/[0.06] text-foreground border border-white/[0.08]" title="Edit">
                            <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                          </Button>
                          {template.status === "published" ? (
                            <Button variant="ghost" size="sm" onClick={() => handleAction(template.id, "unpublish")} disabled={actionLoading === template.id} className="h-8 px-2.5 text-xs bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20" title="Unpublish">
                              <GlobeLock className="w-3.5 h-3.5" />
                            </Button>
                          ) : (
                            <Button variant="ghost" size="sm" onClick={() => handleAction(template.id, "publish")} disabled={actionLoading === template.id} className="h-8 px-2.5 text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20" title="Publish">
                              <Globe className="w-3.5 h-3.5" />
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" onClick={() => handleAction(template.id, "duplicate")} disabled={actionLoading === template.id} className="h-8 px-2.5 text-xs bg-card hover:bg-white/[0.06] text-foreground border border-white/[0.08]" title="Duplicate">
                            <Copy className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(template.id, template.name)} disabled={actionLoading === template.id} className="h-8 px-2.5 text-xs bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20" title="Delete">
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
        <div className="rounded-3xl bg-card/85 backdrop-blur-xl border border-white/[0.08] shadow-xl overflow-hidden">
          {filteredBuiltinTemplates.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground space-y-3">
              <FileCode2 className="w-10 h-10 text-muted-foreground mx-auto opacity-50" />
              <p className="text-sm font-bold text-foreground">No templates found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-background/80 border-b border-white/[0.08] text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <th className="px-6 py-4">Template</th>
                    <th className="px-6 py-4 hidden md:table-cell">Category</th>
                    <th className="px-6 py-4 hidden lg:table-cell">ATS Rating</th>
                    <th className="px-6 py-4">Usage</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {filteredBuiltinTemplates.map((template) => {
                    const usage = usageData.usageMap[template.id] || 0;
                    const percentage = usageData.totalResumes > 0 ? ((usage / usageData.totalResumes) * 100).toFixed(1) : "0.0";
                    return (
                      <tr key={template.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                              <FileCode2 className="w-5 h-5 text-cyan-400" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-foreground flex items-center gap-2">
                                {template.name}
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-semibold">Built-in</span>
                              </p>
                              <p className="text-xs text-muted-foreground font-mono mt-0.5">{template.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell">
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-card border border-white/[0.08] text-foreground">{template.category}</span>
                        </td>
                        <td className="px-6 py-4 hidden lg:table-cell">
                          <div className="flex items-center gap-1.5">
                            <Target className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-xs font-bold text-emerald-400 font-mono">{template.atsRating}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-baseline gap-2">
                              <span className="text-sm font-bold text-foreground font-mono">{usage}</span>
                              <span className="text-xs text-muted-foreground">resumes ({percentage}%)</span>
                            </div>
                            <div className="w-28 h-1.5 bg-card rounded-full overflow-hidden border border-white/[0.04]">
                              <div className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full" style={{ width: `${Math.min(100, Number(percentage))}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button variant="ghost" size="sm" onClick={() => setSelectedTemplate(template)} className="h-8 px-3 text-xs bg-card hover:bg-white/[0.06] text-foreground border border-white/[0.08]">
                            <Eye className="w-3.5 h-3.5 mr-1.5 text-cyan-400" />Details
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
