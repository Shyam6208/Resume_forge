"use client";

import { motion } from "framer-motion";
import {
  Zap,
  Mic,
  Globe,
  Send,
  TrendingUp,
  Target,
  FileSpreadsheet,
  Palette,
  Eye,
  ShieldCheck,
} from "lucide-react";

const FEATURES = [
  {
    icon: Zap,
    title: "1-Click AI Auto-Tailor",
    description:
      "Paste any Job Description and watch AI instantly rewrite your bullets with missing high-impact ATS keywords, jumping your match score from 65% to 95%+ in seconds.",
    accent: "border-t-amber-500",
    iconColor: "text-amber-400",
    tag: "AI Powered",
    featured: true,
  },
  {
    icon: Mic,
    title: "Live AI Mock Interview Suite",
    description:
      "Interactive 1-on-1 AI voice mock interview simulator with speech-to-text dictation, 2-minute answer countdown timers, STAR method helper chips, and 48-hour readiness scorecards.",
    accent: "border-t-purple-500",
    iconColor: "text-purple-400",
    tag: "Live Voice AI",
    featured: true,
  },
  {
    icon: Globe,
    title: "Real-Time Web Portfolio + QR Code",
    description:
      "Turn your resume into a live, hosted web portfolio (/r/your-slug) with real-time Supabase sync and downloadable SVG QR code for recruiters.",
    accent: "border-t-cyan-500",
    iconColor: "text-cyan-400",
    featured: false,
  },
  {
    icon: Send,
    title: "AI Recruiter Outreach",
    description:
      "Generate tailored LinkedIn InMail, Cold Emails to Hiring Managers, and Post-Interview Follow-Up messages personalized to your resume achievements.",
    accent: "border-t-blue-500",
    iconColor: "text-blue-400",
    featured: false,
  },
  {
    icon: TrendingUp,
    title: "AI Salary Estimator & Roadmap",
    description:
      "Benchmark real-time market compensation in LPA and USD across cities, plus get a prioritized 6-month skill development roadmap.",
    accent: "border-t-emerald-500",
    iconColor: "text-emerald-400",
    featured: false,
  },
  {
    icon: Target,
    title: "ATS Keyword Heatmap & Audit",
    description:
      "Rule-based deterministic scoring and visual keyword heatmaps that pinpoint exactly what recruiters and applicant tracking systems look for.",
    accent: "border-t-rose-500",
    iconColor: "text-rose-400",
    featured: false,
  },
  {
    icon: FileSpreadsheet,
    title: "PDF, DOCX & Plain Text Export",
    description:
      "Pixel-perfect A4 PDF, editable Microsoft Word DOCX, and ASCII Plain Text (.txt) formats with zero watermarks.",
    accent: "border-t-indigo-500",
    iconColor: "text-indigo-400",
    featured: false,
  },
  {
    icon: Palette,
    title: "Tested Pro Templates",
    description:
      "Minimalist White, Corporate Executive, Tech & Developer, and Fresher styles tested against Workday, Greenhouse, and Taleo ATS.",
    accent: "border-t-pink-500",
    iconColor: "text-pink-400",
    featured: false,
  },
];

export function FeaturesSection() {
  const featured = FEATURES.filter((f) => f.featured);
  const rest = FEATURES.filter((f) => !f.featured);

  return (
    <section id="features" className="py-24 px-4 sm:px-6 max-w-7xl mx-auto">
      <div className="space-y-4 max-w-2xl mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Next-Generation Career Suite</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Tools that turn applications
          <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
            into confirmed job offers.
          </span>
        </h2>
        <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-xl">
          From 1-click ATS auto-tailoring and real-time hosted web portfolios to live AI voice mock interviews — everything you need in one unified platform.
        </p>
      </div>

      {/* Bento grid — 2 featured large, 6 smaller */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        {featured.map((feat, idx) => {
          const Icon = feat.icon;
          return (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className={`group p-8 rounded-3xl bg-slate-900/70 border border-white/[0.08] ${feat.accent} border-t-2 hover:bg-slate-900/90 transition-all duration-300 relative overflow-hidden shadow-xl`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3.5 rounded-2xl bg-white/[0.05] border border-white/[0.08] group-hover:scale-110 transition-transform">
                  <Icon className={`w-7 h-7 ${feat.iconColor}`} />
                </div>
                {feat.tag && (
                  <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
                    {feat.tag}
                  </span>
                )}
              </div>

              <div className="space-y-2.5">
                <h3 className="text-xl font-bold text-white tracking-tight">{feat.title}</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {feat.description}
                </p>
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
              className={`group p-6 rounded-2xl bg-slate-900/40 border border-white/[0.06] ${feat.accent} border-t-2 hover:bg-slate-900/70 transition-all duration-200`}
            >
              <div className="space-y-3">
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05] w-fit group-hover:scale-110 transition-transform">
                  <Icon className={`w-5 h-5 ${feat.iconColor}`} />
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
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
