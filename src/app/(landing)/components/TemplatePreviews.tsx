"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TEMPLATES } from "@/config/templates.config";
import { ArrowRight, Sparkles } from "lucide-react";

export function TemplatePreviews() {
  const previewTemplates = TEMPLATES.slice(0, 6);

  return (
    <section className="py-20 px-4 sm:px-6 max-w-7xl mx-auto space-y-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Curated Design Collection</span>
          </h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            40+ Professional Templates
          </h3>
          <p className="text-xs sm:text-sm text-slate-400">
            Tested and optimized for maximum ATS readability and executive presentation.
          </p>
        </div>

        <Link href="/templates">
          <Button
            type="button"
            variant="outline"
            className="h-10 px-5 text-xs bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800 hover:text-white flex items-center gap-2 shrink-0"
          >
            <span>View All Templates</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      {/* Grid of 6 Templates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {previewTemplates.map((tmpl, idx) => (
          <motion.div
            key={tmpl.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: idx * 0.08 }}
            className="group rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden flex flex-col justify-between hover:border-indigo-500/50 transition-all shadow-md"
          >
            {/* Stylized Template Thumbnail Mockup */}
            <div className="h-44 bg-slate-950 p-4 border-b border-slate-800 relative overflow-hidden flex flex-col justify-between group-hover:bg-slate-950/80 transition-colors">
              <div className="h-2 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full opacity-80" />

              {/* Fake skeleton layout preview */}
              <div className="space-y-2 py-2">
                <div className="h-2 w-1/3 bg-slate-700 rounded" />
                <div className="h-1.5 w-1/4 bg-indigo-500/40 rounded" />
                <div className="space-y-1 pt-2">
                  <div className="h-1.5 w-full bg-slate-800 rounded" />
                  <div className="h-1.5 w-5/6 bg-slate-800 rounded" />
                  <div className="h-1.5 w-4/5 bg-slate-800/60 rounded" />
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span>FORMAT: A4</span>
                <span className="text-emerald-400 font-bold">ATS OPTIMIZED</span>
              </div>
            </div>

            {/* Template Info Card Header */}
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                  {tmpl.category}
                </span>
                <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[10px] font-bold">
                  ATS {tmpl.atsRating}%
                </Badge>
              </div>

              <div className="space-y-1">
                <h4 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                  {tmpl.name}
                </h4>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {tmpl.description}
                </p>
              </div>

              <Link href={`/onboarding?template=${tmpl.id}`} className="block pt-2">
                <Button
                  type="button"
                  size="sm"
                  className="w-full h-8 text-xs bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white font-medium rounded-xl transition-all"
                >
                  Use This Template
                </Button>
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
