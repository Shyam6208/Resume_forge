"use client";

import { motion } from "framer-motion";
import {
  Eye,
  Palette,
  GripVertical,
  FileSpreadsheet,
  Target,
  Trophy,
  BookOpen,
  Smartphone,
} from "lucide-react";

const FEATURES = [
  {
    icon: Eye,
    title: "Live Preview",
    description:
      "Split-screen A4 preview updates on every keystroke. What you see is what recruiters get.",
    accent: "border-t-amber-500",
    iconColor: "text-amber-400",
    featured: true,
  },
  {
    icon: Target,
    title: "ATS Score Checker",
    description:
      "Paste a job description to instantly see your keyword match percentage and missing skills.",
    accent: "border-t-emerald-500",
    iconColor: "text-emerald-400",
    featured: true,
  },
  {
    icon: Palette,
    title: "40+ Templates",
    description:
      "Modern, Executive, Minimal, Developer, and Fresher styles — all ATS-tested.",
    accent: "border-t-indigo-500",
    iconColor: "text-indigo-400",
    featured: false,
  },
  {
    icon: GripVertical,
    title: "Drag & Drop",
    description: "Reorder sections with smooth drag handles. No fighting the layout.",
    accent: "border-t-purple-500",
    iconColor: "text-purple-400",
    featured: false,
  },
  {
    icon: FileSpreadsheet,
    title: "PDF + DOCX Export",
    description: "High-resolution A4 PDF and editable Word DOCX files. Download instantly with no paywalls.",
    accent: "border-t-cyan-500",
    iconColor: "text-cyan-400",
    featured: false,
  },
  {
    icon: Trophy,
    title: "Resume Scoring",
    description:
      "Rule-based scoring with actionable tips to fix critical issues and strengthen weak sections.",
    accent: "border-t-rose-500",
    iconColor: "text-rose-400",
    featured: false,
  },
  {
    icon: BookOpen,
    title: "Content Library",
    description: "Pre-written summaries and bullet points organized by role and industry.",
    accent: "border-t-pink-500",
    iconColor: "text-pink-400",
    featured: false,
  },
  {
    icon: Smartphone,
    title: "Mobile Ready",
    description:
      "Full editor on your phone with a tabbed interface to edit and export anywhere.",
    accent: "border-t-sky-500",
    iconColor: "text-sky-400",
    featured: false,
  },
];

export function FeaturesSection() {
  const featured = FEATURES.filter((f) => f.featured);
  const rest = FEATURES.filter((f) => !f.featured);

  return (
    <section id="features" className="py-24 px-4 sm:px-6 max-w-7xl mx-auto">
      <div className="space-y-4 max-w-2xl mb-14">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Tools that actually help
          <br />
          <span className="text-slate-500">you get hired.</span>
        </h2>
        <p className="text-sm text-slate-400 leading-relaxed max-w-lg">
          Not another generic builder. Every feature exists because job seekers asked for it.
        </p>
      </div>

      {/* Bento grid — 2 featured large, 6 smaller */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {featured.map((feat, idx) => {
          const Icon = feat.icon;
          return (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className={`group p-7 rounded-2xl bg-slate-900/60 border border-white/[0.06] ${feat.accent} border-t-2 hover:bg-slate-900/80 transition-all duration-200`}
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.06] shrink-0 group-hover:scale-110 transition-transform">
                  <Icon className={`w-6 h-6 ${feat.iconColor}`} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white">{feat.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {rest.map((feat, idx) => {
          const Icon = feat.icon;
          return (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: idx * 0.05 }}
              className={`group p-5 rounded-2xl bg-slate-900/40 border border-white/[0.05] ${feat.accent} border-t-2 hover:bg-slate-900/60 transition-all duration-200`}
            >
              <div className="space-y-3">
                <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.05] w-fit group-hover:scale-110 transition-transform">
                  <Icon className={`w-5 h-5 ${feat.iconColor}`} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white group-hover:text-slate-200 transition-colors">
                    {feat.title}
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
