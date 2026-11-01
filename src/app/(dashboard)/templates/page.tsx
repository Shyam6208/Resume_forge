"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { TEMPLATES as BUILTIN_TEMPLATES, TemplateConfig } from "@/config/templates.config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { UserMenu } from "@/components/navigation/UserMenu";
import {
  Layout,
  Search,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Sparkles,
  ShieldCheck,
  FileText,
  SlidersHorizontal,
  ChevronRight,
  Zap,
} from "lucide-react";

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

  const filteredTemplates = useMemo(() => {
    return templates.filter((tmpl) => {
      const matchesCategory =
        selectedCategory === "all" || tmpl.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchesSearch =
        tmpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tmpl.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tmpl.tags && tmpl.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())));
      return matchesCategory && matchesSearch;
    });
  }, [templates, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-100">
      {/* Top Floating Glass Header */}
      <header className="sticky top-0 z-40 w-full h-16 bg-background/85 backdrop-blur-xl border-b border-white/[0.08] px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center text-slate-950 font-black text-xs shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              RF
            </div>
            <span className="font-extrabold text-base tracking-tight text-foreground">
              Resume<span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">Forge</span>
            </span>
          </Link>
          <span className="text-muted-foreground/40 hidden sm:inline">/</span>
          <span className="text-xs font-semibold text-muted-foreground hidden sm:inline">Template Library</span>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button
              type="button"
              variant="outline"
              className="h-9 px-4 text-xs bg-card/60 border-white/[0.08] hover:bg-white/[0.06] hover:border-cyan-500/30 text-foreground font-semibold rounded-xl"
            >
              Dashboard
            </Button>
          </Link>
          <Link href="/onboarding">
            <Button
              type="button"
              className="h-9 px-4 text-xs bg-gradient-to-r from-cyan-500 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 font-extrabold rounded-xl shadow-md shadow-cyan-500/20"
            >
              Build Resume
            </Button>
          </Link>
          <UserMenu />
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto w-full flex-1 p-4 sm:p-8 space-y-8">
        {/* Header Hero Area with Ambient Light */}
        <div className="relative rounded-3xl p-6 sm:p-10 border border-white/[0.08] bg-card/60 backdrop-blur-xl overflow-hidden space-y-4 text-center max-w-4xl mx-auto shadow-2xl shadow-black/40">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-gradient-to-r from-cyan-500/20 via-blue-500/15 to-emerald-500/20 blur-3xl rounded-full pointer-events-none" />

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>100% Workday, Greenhouse & Taleo Verified</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-foreground tracking-[-0.03em] leading-tight">
            ATS-Engineered Resume Templates
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Every template is meticulously crafted to ensure single-column parser stream compliance, high scanability, and zero watermark restrictions.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 pt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5 text-foreground/80 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Standard A4 Margins
            </span>
            <span className="flex items-center gap-1.5 text-foreground/80 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
              Zero Nested Graphics
            </span>
            <span className="flex items-center gap-1.5 text-foreground/80 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Vector PDF Export
            </span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-card/80 p-3.5 sm:p-4 rounded-2xl border border-white/[0.08] shadow-lg shadow-black/20">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold capitalize whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? "bg-gradient-to-r from-cyan-500 to-emerald-400 text-slate-950 font-extrabold shadow-md shadow-cyan-500/20"
                      : "bg-background/80 border border-white/[0.06] text-muted-foreground hover:text-foreground hover:bg-white/[0.05]"
                  }`}
                >
                  {cat === "all" ? "All Templates" : cat}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72 shrink-0">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, role, skill..."
              className="pl-10 h-10 text-xs bg-background/90 border-white/[0.08] text-foreground rounded-xl focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/30"
            />
          </div>
        </div>

        {/* Templates Grid */}
        {loading ? (
          <div className="py-24 text-center text-muted-foreground space-y-3">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
            <p className="text-xs font-medium">Loading verified resume layouts...</p>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="py-24 text-center text-muted-foreground space-y-4 rounded-3xl border border-white/[0.06] bg-card/40 p-8">
            <p className="text-base font-bold text-foreground">No templates match your search criteria.</p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Try adjusting your search query or reset the category filters.
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              className="text-xs bg-card border-white/[0.1] text-foreground hover:bg-white/[0.06] rounded-xl font-semibold"
            >
              Reset All Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredTemplates.map((tmpl, idx) => {
                const atsRating = tmpl.atsRating ?? 96;
                return (
                  <motion.div
                    key={tmpl.id}
                    layout
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.35, delay: idx * 0.04 }}
                    className="group rounded-2xl bg-card border border-white/[0.08] hover:border-cyan-500/40 transition-all duration-300 overflow-hidden shadow-xl shadow-black/30 flex flex-col justify-between hover:shadow-cyan-500/5 hover:-translate-y-1"
                  >
                    {/* Realistic A4 Document Canvas Preview */}
                    <div className="h-60 bg-slate-950/80 p-4 border-b border-white/[0.06] relative overflow-hidden flex items-center justify-center">
                      <div className="w-full h-full bg-white rounded-lg p-3.5 shadow-md flex flex-col justify-between text-slate-900 transform group-hover:scale-[1.03] transition-transform duration-300 select-none">
                        {/* Header bar */}
                        <div className="space-y-1.5 border-b border-slate-200 pb-2">
                          <div className="h-2.5 w-1/3 bg-slate-800 rounded font-bold" />
                          <div className="h-1.5 w-1/2 bg-slate-400 rounded" />
                        </div>

                        {/* Experience block */}
                        <div className="space-y-1.5 py-1">
                          <div className="h-2 w-1/4 bg-slate-700 rounded font-semibold" />
                          <div className="h-1.5 w-full bg-slate-200 rounded" />
                          <div className="h-1.5 w-5/6 bg-slate-200 rounded" />
                        </div>

                        {/* Skills chips preview */}
                        <div className="space-y-1">
                          <div className="h-2 w-1/5 bg-slate-700 rounded font-semibold" />
                          <div className="flex gap-1">
                            <div className="h-2.5 w-8 bg-slate-100 rounded border border-slate-200" />
                            <div className="h-2.5 w-10 bg-slate-100 rounded border border-slate-200" />
                            <div className="h-2.5 w-9 bg-slate-100 rounded border border-slate-200" />
                          </div>
                        </div>

                        {/* Bottom ATS badge */}
                        <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 pt-1 border-t border-slate-100">
                          <span>A4 • SINGLE COLUMN</span>
                          <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                            ATS {atsRating}%
                          </span>
                        </div>
                      </div>

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                        <Link href={`/onboarding?template=${tmpl.id}`} className="w-full">
                          <Button
                            type="button"
                            className="w-full h-10 text-xs bg-gradient-to-r from-cyan-500 to-emerald-400 text-slate-950 font-extrabold rounded-xl shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-1.5"
                          >
                            <span>Use This Template</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                      </div>
                    </div>

                    {/* Template Card Details */}
                    <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-400">
                            {tmpl.category}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3" />
                            {atsRating}% ATS
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-foreground group-hover:text-cyan-300 transition-colors">
                          {tmpl.name}
                        </h3>

                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {tmpl.description}
                        </p>
                      </div>

                      {/* Action Button */}
                      <Link href={`/onboarding?template=${tmpl.id}`} className="block pt-2">
                        <Button
                          type="button"
                          className="w-full h-9 text-xs bg-white/[0.06] hover:bg-gradient-to-r hover:from-cyan-500 hover:to-emerald-400 hover:text-slate-950 text-foreground font-bold rounded-xl transition-all border border-white/[0.08] hover:border-transparent flex items-center justify-center gap-1.5"
                        >
                          <span>Select Template</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}
