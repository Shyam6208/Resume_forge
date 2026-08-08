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
    title: "⚡ Live Preview",
    description: "Instant split-screen A4 print preview updates live as you type.",
    color: "text-amber-400",
  },
  {
    icon: Palette,
    title: "🎨 40+ Templates",
    description: "Modern, Executive, Minimal, Developer & Fresher template styles.",
    color: "text-indigo-400",
  },
  {
    icon: GripVertical,
    title: "↕️ Drag & Drop",
    description: "Reorder resume sections effortlessly with smooth drag-and-drop handles.",
    color: "text-purple-400",
  },
  {
    icon: FileSpreadsheet,
    title: "📄 PDF + DOCX Free",
    description: "Export high-resolution A4 PDFs and fully editable Word DOCX files.",
    color: "text-emerald-400",
  },
  {
    icon: Target,
    title: "📊 ATS Checker",
    description: "Paste target job descriptions to analyze keyword match percentages in real-time.",
    color: "text-cyan-400",
  },
  {
    icon: Trophy,
    title: "🏆 Resume Score",
    description: "Rule-based score calculation with actionable critical & tip suggestions.",
    color: "text-amber-400",
  },
  {
    icon: BookOpen,
    title: "📚 Content Library",
    description: "Pre-written executive summaries and bullet points by industry role.",
    color: "text-pink-400",
  },
  {
    icon: Smartphone,
    title: "📱 Mobile Friendly",
    description: "Full feature parity on smartphones and tablets with tabbed editor mode.",
    color: "text-blue-400",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20 px-4 sm:px-6 max-w-7xl mx-auto space-y-12">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
          Features Built For Success
        </h2>
        <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Everything You Need to Get Hired
        </h3>
        <p className="text-xs sm:text-sm text-slate-400">
          Engineered with essential tools to format, optimize, score, and download your resume.
        </p>
      </div>

      {/* 4x2 Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {FEATURES.map((feat, idx) => {
          const Icon = feat.icon;
          return (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              whileHover={{ y: -5 }}
              className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-indigo-500/50 hover:bg-slate-900 transition-all duration-200 shadow-md group flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 w-fit group-hover:scale-110 transition-transform">
                  <Icon className={`w-6 h-6 ${feat.color}`} />
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {feat.title}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
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
