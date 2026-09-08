"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { TEMPLATES, TemplateConfig } from "@/config/templates.config";
import { ArrowRight } from "lucide-react";

/* Visual configs for template categories to make each card distinct */
const STYLE_MAP: Record<string, { bar: string; accent: string; badge: string }> = {
  modern: {
    bar: "bg-gradient-to-r from-indigo-500 to-violet-500",
    accent: "border-indigo-500/20",
    badge: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  },
  minimal: {
    bar: "bg-gradient-to-r from-slate-400 to-slate-600",
    accent: "border-slate-600/20",
    badge: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  },
  executive: {
    bar: "bg-gradient-to-r from-amber-500 to-orange-600",
    accent: "border-amber-500/20",
    badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  developer: {
    bar: "bg-gradient-to-r from-emerald-500 to-teal-500",
    accent: "border-emerald-500/20",
    badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  fresher: {
    bar: "bg-gradient-to-r from-cyan-500 to-sky-500",
    accent: "border-cyan-500/20",
    badge: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  },
  creative: {
    bar: "bg-gradient-to-r from-pink-500 to-rose-500",
    accent: "border-pink-500/20",
    badge: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  },
};

const DEFAULT_STYLE = {
  bar: "bg-gradient-to-r from-indigo-500 to-purple-500",
  accent: "border-indigo-500/20",
  badge: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
};

export function TemplatePreviews() {
  const [templates, setTemplates] = useState<TemplateConfig[]>(TEMPLATES);

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

  const previewTemplates = templates.slice(0, 4);

  return (
    <section className="py-24 px-4 sm:px-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
        <div className="space-y-3">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Templates that pass the scan.
          </h2>
          <p className="text-sm text-slate-400 max-w-md">
            Every template is tested against real ATS parsers. Pick one, customize it, and export.
          </p>
        </div>

        <Link href="/templates">
          <Button
            type="button"
            variant="outline"
            className="h-10 px-5 text-xs bg-white/[0.03] border-white/[0.08] text-slate-300 hover:bg-white/[0.06] hover:text-white flex items-center gap-2 shrink-0 rounded-xl transition-all"
          >
            <span>See all {templates.length}+ templates</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>

      {/* Grid of 4 templates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {previewTemplates.map((tmpl, idx) => {
          const cat = tmpl.category?.toLowerCase() ?? "";
          const style = STYLE_MAP[cat] ?? DEFAULT_STYLE;

          return (
            <motion.div
              key={tmpl.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className={`group rounded-2xl bg-slate-900/50 border border-white/[0.06] overflow-hidden hover:border-white/[0.12] transition-all duration-200`}
            >
              {/* Template thumbnail mockup / image */}
              <div className="relative h-48 bg-slate-950/60 flex flex-col justify-between overflow-hidden">
                {tmpl.previewImage ? (
                  <img
                    src={tmpl.previewImage}
                    alt={tmpl.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    {/* Gradient header bar */}
                    <div className={`h-1.5 w-full ${style.bar} rounded-full`} />

                    {/* Layout preview */}
                    <div className="flex-1 py-3 space-y-2">
                      <div className="h-2.5 w-2/5 rounded bg-slate-700/80" />
                      <div className="h-1.5 w-1/3 rounded bg-white/[0.06]" />
                      <div className="mt-2 space-y-1.5">
                        <div className="h-1.5 w-full rounded bg-white/[0.04]" />
                        <div className="h-1.5 w-5/6 rounded bg-white/[0.04]" />
                        <div className="h-1.5 w-3/4 rounded bg-white/[0.03]" />
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-600 font-mono flex justify-between">
                      <span>A4</span>
                      <span className="text-emerald-500/60 font-bold">ATS {tmpl.atsRating}%</span>
                    </div>
                  </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-slate-950/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Link href={`/onboarding?template=${tmpl.id}`}>
                    <Button
                      type="button"
                      size="sm"
                      className="h-9 px-5 text-xs bg-white text-slate-950 hover:bg-slate-100 font-bold rounded-xl shadow-lg transition-all"
                    >
                      Use Template
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Info */}
              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${style.badge}`}
                  >
                    {tmpl.category}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white group-hover:text-slate-200 transition-colors">
                  {tmpl.name}
                </h4>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
