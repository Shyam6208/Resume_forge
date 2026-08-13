"use client";

import { useState, useEffect, useMemo } from "react";
import { FileCode2, Search, Filter, Eye, AlertTriangle, Target, Loader2, Image as ImageIcon } from "lucide-react";
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

export function AdminTemplatesClient() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usageData, setUsageData] = useState<UsageData>({ usageMap: {}, totalResumes: 0 });
  
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateConfig | null>(null);

  useEffect(() => {
    async function fetchUsage() {
      try {
        const res = await fetch("/api/admin/templates/usage");
        if (!res.ok) throw new Error("Failed to fetch template usage statistics");
        const data = await res.json();
        
        if (data.success) {
          setUsageData({
            usageMap: data.usageMap,
            totalResumes: data.totalResumes
          });
        } else {
          throw new Error(data.error || "Failed to fetch usage data");
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || "An error occurred");
        toast.error("Could not load template usage data");
      } finally {
        setLoading(false);
      }
    }
    
    fetchUsage();
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(TEMPLATES.map(t => t.category));
    return Array.from(cats);
  }, []);

  const filteredTemplates = useMemo(() => {
    return TEMPLATES.filter(template => {
      const matchesSearch = 
        template.name.toLowerCase().includes(search.toLowerCase()) || 
        template.slug.toLowerCase().includes(search.toLowerCase()) ||
        template.id.toLowerCase().includes(search.toLowerCase());
      
      const matchesCategory = categoryFilter === "all" || template.category === categoryFilter;
      
      return matchesSearch && matchesCategory;
    });
  }, [search, categoryFilter]);

  if (loading) {
    return <AdminTemplatesSkeleton />;
  }

  if (error) {
    return (
      <div className="p-12 text-center text-slate-400 bg-slate-900/90 rounded-3xl border border-slate-800 space-y-4">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
        <p className="text-lg font-bold text-white">Failed to load templates</p>
        <p className="text-sm">{error}</p>
        <Button onClick={() => window.location.reload()} variant="outline" className="mt-4 bg-slate-800 border-slate-700">
          Try Again
        </Button>
      </div>
    );
  }

  // Find unknown templates 
  // Get all keys in usageMap that are not in TEMPLATES and are not "unknown" (which handles null/undefined templates)
  const knownTemplateIds = new Set(TEMPLATES.map(t => t.id));
  const unknownIds = Object.keys(usageData.usageMap).filter(id => !knownTemplateIds.has(id) && id !== "unknown");
  const nullTemplatesCount = usageData.usageMap["unknown"] || 0;
  
  const hasLegacyData = unknownIds.length > 0 || nullTemplatesCount > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Template Management</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-semibold">
              {TEMPLATES.length} Configurations
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Read-only view of static templates and their active usage across {usageData.totalResumes} resumes.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-10 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
        {filteredTemplates.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <FileCode2 className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm font-bold text-white">No templates found</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No templates match your current filters.
            </p>
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
                {filteredTemplates.map((template) => {
                  const usage = usageData.usageMap[template.id] || 0;
                  const percentage = usageData.totalResumes > 0 
                    ? ((usage / usageData.totalResumes) * 100).toFixed(1) 
                    : "0.0";

                  return (
                    <tr key={template.id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0 overflow-hidden relative">
                            {template.previewImage ? (
                               <img 
                                 src={template.previewImage} 
                                 alt=""
                                 className="w-full h-full object-cover"
                                 onError={(e) => {
                                   (e.target as HTMLImageElement).style.display = 'none';
                                   (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                 }}
                               />
                            ) : null}
                            <div className={`w-full h-full flex items-center justify-center ${template.previewImage ? 'hidden' : 'flex'}`}>
                               <FileCode2 className="w-5 h-5 text-indigo-400" />
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white flex items-center gap-2">
                              {template.name}
                              {usage === 0 && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-medium">Unused</span>
                              )}
                            </p>
                            <p className="text-xs text-slate-500 font-mono mt-0.5">
                              {template.id}
                            </p>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 hidden md:table-cell">
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-800 text-slate-300">
                          {template.category}
                        </span>
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
                            <div 
                              className="h-full bg-indigo-500 rounded-full" 
                              style={{ width: `${Math.min(100, Number(percentage))}%` }} 
                            />
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedTemplate(template)}
                          className="h-8 px-3 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border-transparent hover:border-slate-600 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1.5" />
                          Details
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

      {/* Legacy / Unknown Templates Section */}
      {hasLegacyData && (
        <div className="rounded-3xl bg-amber-500/5 border border-amber-500/20 shadow-xl overflow-hidden mt-8">
          <div className="px-6 py-4 border-b border-amber-500/20 bg-amber-500/10">
            <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Unknown / Legacy Templates Detected
            </h3>
            <p className="text-xs text-amber-400/80 mt-1">
              Some resumes are using template IDs that are not present in the static configuration. 
            </p>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {unknownIds.map(id => (
              <div key={id} className="bg-slate-900/50 p-4 rounded-xl border border-amber-500/20 flex justify-between items-center">
                <div className="space-y-1">
                  <span className="text-xs text-slate-400">Template ID:</span>
                  <p className="text-sm font-mono text-white truncate max-w-[150px]">{id}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-white">{usageData.usageMap[id]}</p>
                  <p className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider">Uses</p>
                </div>
              </div>
            ))}
            
            {nullTemplatesCount > 0 && (
              <div className="bg-slate-900/50 p-4 rounded-xl border border-red-500/20 flex justify-between items-center">
                <div className="space-y-1">
                  <span className="text-xs text-slate-400">Template ID:</span>
                  <p className="text-sm font-mono text-white font-bold italic">NULL / NONE</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-white">{nullTemplatesCount}</p>
                  <p className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider">Uses</p>
                </div>
              </div>
            )}
          </div>
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
