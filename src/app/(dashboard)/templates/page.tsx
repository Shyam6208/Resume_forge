"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { TEMPLATES as BUILTIN_TEMPLATES, TemplateConfig } from "@/config/templates.config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Layout, Search, ArrowRight, CheckCircle2, Loader2, Sparkles } from "lucide-react";

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<TemplateConfig[]>(BUILTIN_TEMPLATES);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = useMemo(() => {
    const set = new Set(["all", ...templates.map((t) => (t.category || "Modern").toLowerCase())]);
    return Array.from(set);
  }, [templates]);

  useEffect(() => {
    async function loadPublishedTemplates() {
      try {
        const res = await fetch("/api/templates");
        if (res.ok) {
          const data = await res.json();
          if (data.templates && Array.isArray(data.templates)) {
            setTemplates(data.templates);
          }
        }
      } catch (err) {
        console.warn("Could not load published dynamic templates:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPublishedTemplates();
  }, []);

  const filteredTemplates = templates.filter((tmpl) => {
    const matchesCategory =
      selectedCategory === "all" || tmpl.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      tmpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tmpl.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Glass Navbar */}
      <header className="sticky top-0 z-30 w-full h-16 bg-slate-950/90 backdrop-blur border-b border-slate-800 px-4 sm:px-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="p-1.5 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 font-bold text-xs">
            RF
          </span>
          <span className="font-extrabold text-base text-white tracking-tight">
            ResumeForge
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button
              type="button"
              variant="outline"
              className="h-9 px-4 text-xs bg-slate-900 border-slate-800 text-slate-300 hover:text-white"
            >
              Dashboard
            </Button>
          </Link>
          <Link href="/onboarding">
            <Button
              type="button"
              className="h-9 px-4 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl"
            >
              Create Resume
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto w-full flex-1 p-4 sm:p-8 space-y-8">
        {/* Header Title & Subtitle */}
        <div className="space-y-2 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <Layout className="w-3.5 h-3.5" />
            <span>ATS Reader Tested & Verified</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Resume Templates
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Select an ATS-optimized template designed for your industry and target job.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
          {/* Category Filter Tabs */}
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                  selectedCategory === cat
                    ? "bg-indigo-600 text-white shadow"
                    : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates..."
              className="pl-9 h-9 text-xs bg-slate-950 border-slate-800 text-white"
            />
          </div>
        </div>

        {/* Template Grid */}
        {loading ? (
          <div className="py-16 text-center text-slate-400 space-y-3">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
            <p className="text-xs">Loading available templates...</p>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-3">
            <p className="text-sm font-semibold">No templates found matching your search criteria.</p>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              className="text-xs bg-slate-900 border-slate-800 text-slate-300"
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((tmpl) => (
              <div
                key={tmpl.id}
                className="group rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 overflow-hidden flex flex-col justify-between transition-all shadow-md"
              >
                {/* Thumbnail */}
                <div className="h-48 bg-slate-950 border-b border-slate-800 relative flex items-center justify-center overflow-hidden">
                  {tmpl.previewImage ? (
                    <img
                      src={tmpl.previewImage}
                      alt={tmpl.name}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full p-4 flex flex-col justify-between group-hover:bg-slate-950/80 transition-colors">
                      <div
                        className="h-2 w-full rounded-full"
                        style={{
                          background: tmpl.templateConfig?.styles?.primaryColor
                            ? `linear-gradient(to right, ${tmpl.templateConfig.styles.primaryColor}, #818cf8)`
                            : "linear-gradient(to right, #6366f1, #a855f7, #ec4899)",
                        }}
                      />
                      <div className="space-y-2 py-2">
                        <div className="h-2.5 w-1/3 bg-slate-700 rounded" />
                        <div className="h-2 w-1/4 bg-indigo-500/40 rounded" />
                        <div className="space-y-1.5 pt-2">
                          <div className="h-2 w-full bg-slate-800 rounded" />
                          <div className="h-2 w-5/6 bg-slate-800 rounded" />
                          <div className="h-2 w-2/3 bg-slate-800/60 rounded" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                        <span>A4 ATS OPTIMIZED</span>
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>ATS {tmpl.atsRating}%</span>
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Info & CTA */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                      {tmpl.category}
                    </span>
                    <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[10px] font-bold">
                      Verified
                    </Badge>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {tmpl.name}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {tmpl.description}
                    </p>
                  </div>

                  <Link href={`/onboarding?template=${tmpl.id}`} className="block pt-2">
                    <Button
                      type="button"
                      className="w-full h-9 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 shadow"
                    >
                      <span>Use This Template</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
