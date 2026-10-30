"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { TEMPLATES, TemplateConfig } from "@/config/templates.config";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";

const CATEGORIES = [
  { id: "all", label: "All Layouts" },
  { id: "developer", label: "Tech & Software" },
  { id: "executive", label: "Corporate Executive" },
  { id: "minimal", label: "Minimalist ATS" },
  { id: "modern", label: "Modern Standard" },
];

export function TemplatePreviews() {
  const [templates, setTemplates] = useState<TemplateConfig[]>(TEMPLATES);
  const [selectedCat, setSelectedCat] = useState("all");

  useEffect(() => {
    fetch("/api/templates")
      .then((res) => res.json())
      .then((data) => {
        if (data.templates && Array.isArray(data.templates)) {
          setTemplates(data.templates);
        }
      })
      .catch(() => {});
  }, []);

  const filtered = selectedCat === "all"
    ? templates.slice(0, 8)
    : templates.filter((t) => t.category?.toLowerCase() === selectedCat).slice(0, 8);

  return (
    <section className="py-28 px-4 sm:px-6 max-w-6xl mx-auto space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-3 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tested Layouts</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-foreground tracking-[-0.025em]">
            Architected for recruiters & ATS parsers alike.
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            No unreadable tables, nested graphics, or broken fonts. Every template compiles into standard searchable text streams.
          </p>
        </div>

        <Link href="/templates">
          <Button
            type="button"
            variant="outline"
            className="h-11 px-6 text-xs bg-card border-white/[0.1] text-foreground hover:bg-white/[0.08] hover:border-cyan-500/30 flex items-center gap-2 rounded-xl transition-all font-bold"
          >
            <span>Browse All {templates.length}+ Templates</span>
            <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
          </Button>
        </Link>
      </div>

      {/* Category Pills Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCat(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
              selectedCat === cat.id
                ? "bg-gradient-to-r from-cyan-500 to-emerald-400 text-slate-950 font-extrabold shadow-md shadow-cyan-500/20"
                : "bg-card/70 border border-white/[0.06] text-muted-foreground hover:text-foreground hover:bg-card"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <AnimatePresence mode="popLayout">
          {filtered.map((tmpl, idx) => (
            <motion.div
              key={tmpl.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="group rounded-2xl bg-card border border-white/[0.08] hover:border-cyan-500/40 transition-all duration-300 overflow-hidden shadow-xl shadow-black/20 flex flex-col justify-between"
            >
              {/* Document Thumbnail Preview */}
              <div className="relative h-64 bg-neutral-900/80 p-5 flex flex-col justify-between overflow-hidden border-b border-white/[0.06]">
                {/* Mini Realistic Resume Mockup Canvas */}
                <div className="w-full h-full bg-white rounded-lg p-4 shadow-lg flex flex-col justify-between text-neutral-900 transform group-hover:scale-[1.03] transition-transform duration-300">
                  {/* Top Candidate Bar */}
                  <div className="space-y-1">
                    <div className="h-3 w-1/2 bg-neutral-900 rounded font-black text-[9px] flex items-center px-1 text-white">
                      ALEX RIVERA
                    </div>
                    <div className="h-1.5 w-2/3 bg-cyan-600/60 rounded" />
                    <div className="h-1 w-full bg-neutral-200 rounded" />
                  </div>

                  {/* Experience Lines */}
                  <div className="space-y-1.5 py-1">
                    <div className="h-2 w-1/3 bg-neutral-800 rounded" />
                    <div className="space-y-1 pl-1.5 border-l border-cyan-500">
                      <div className="h-1.5 w-full bg-neutral-200 rounded" />
                      <div className="h-1.5 w-11/12 bg-neutral-200 rounded" />
                      <div className="h-1.5 w-3/4 bg-neutral-200 rounded" />
                    </div>
                  </div>

                  {/* Skills Chips */}
                  <div className="flex gap-1 pt-1">
                    <div className="h-2.5 w-8 bg-cyan-50 rounded text-[7px] text-cyan-900 font-bold flex items-center justify-center">
                      Python
                    </div>
                    <div className="h-2.5 w-8 bg-cyan-50 rounded text-[7px] text-cyan-900 font-bold flex items-center justify-center">
                      React
                    </div>
                    <div className="h-2.5 w-8 bg-cyan-50 rounded text-[7px] text-cyan-900 font-bold flex items-center justify-center">
                      AWS
                    </div>
                  </div>
                </div>

                {/* Hover Quick Action Overlay */}
                <div className="absolute inset-0 bg-background/85 backdrop-blur-sm flex flex-col items-center justify-center gap-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-4">
                  <Link href={`/onboarding?template=${tmpl.id}`} className="w-full">
                    <Button
                      type="button"
                      className="w-full h-10 text-xs bg-gradient-to-r from-cyan-500 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 font-extrabold rounded-xl shadow-lg shadow-cyan-500/20 transition-all"
                    >
                      Use This Template
                    </Button>
                  </Link>
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    Bypasses 2026 ATS Filters
                  </span>
                </div>
              </div>

              {/* Template Meta */}
              <div className="p-4 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 font-mono">
                    {tmpl.category}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    ATS {tmpl.atsRating ?? 98}%
                  </span>
                </div>
                <h4 className="text-sm font-bold text-foreground group-hover:text-cyan-400 transition-colors">
                  {tmpl.name}
                </h4>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}
