"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, ShieldCheck, Zap, Star } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export function HeroSection() {
  const { isAuthenticated } = useAuth();
  const buildLink = isAuthenticated ? "/onboarding" : "/login?redirectTo=/onboarding";

  return (
    <section className="relative min-h-[100dvh] flex flex-col justify-center items-center overflow-hidden px-4 sm:px-6 pt-24 pb-20">
      {/* Gradient mesh background — organic, not a single blob */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/4 -left-1/4 w-[80%] h-[80%] bg-indigo-950/60 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 right-0 w-[50%] h-[60%] bg-purple-950/50 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 w-[40%] h-[40%] bg-violet-950/40 rounded-full blur-[100px]" />
      </div>

      {/* Subtle grid lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="max-w-5xl mx-auto w-full z-10 text-center space-y-10">
        {/* Announcement — subtle, not flashy */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-slate-400 text-xs font-medium backdrop-blur-sm"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>100% free — no credit card, no watermarks, no catch</span>
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="space-y-5"
        >
          <h1 className="text-[clamp(2.5rem,5vw+1rem,5rem)] font-extrabold text-white tracking-tight leading-[1.05] max-w-4xl mx-auto">
            Your resume,{" "}
            <span className="relative">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400">
                designed to land
              </span>
            </span>
            <br className="hidden sm:block" />
            interviews.
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-xl mx-auto leading-relaxed font-normal">
            ATS-optimized templates, real-time scoring, and instant PDF export.
            Built for job seekers who don&apos;t want to fight their tools.
          </p>
        </motion.div>

        {/* CTA row */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Link href={buildLink}>
            <Button
              type="button"
              className="h-12 px-8 text-sm bg-white text-slate-950 hover:bg-slate-100 font-bold rounded-xl shadow-xl shadow-white/10 transition-all hover:shadow-white/20 flex items-center gap-2"
            >
              <span>Build Your Resume</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>

          <Link href="/templates">
            <Button
              type="button"
              variant="outline"
              className="h-12 px-8 text-sm bg-white/[0.04] border-white/[0.1] text-slate-300 hover:bg-white/[0.08] hover:text-white font-medium rounded-xl backdrop-blur-sm transition-all"
            >
              Browse Templates
            </Button>
          </Link>
        </motion.div>

        {/* Trust strip — compact, horizontal */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-500"
        >
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500/70" />
            <span>99% ATS pass rate</span>
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-500/70" />
            <span>Zero watermarks</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-500/70" />
            <span>PDF + DOCX export</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-purple-500/70" />
            <span>40+ templates</span>
          </span>
        </motion.div>

        {/* App Mockup — realistic editor window, not skeleton cards */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-4xl mx-auto pt-4"
        >
          {/* Glow behind mockup */}
          <div className="absolute inset-x-10 -bottom-10 h-40 bg-indigo-600/15 blur-[60px] rounded-full" />

          {/* Window frame */}
          <div className="relative rounded-xl border border-white/[0.08] bg-slate-900/80 backdrop-blur-xl shadow-2xl shadow-black/40 overflow-hidden">
            {/* Title bar */}
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.06] bg-slate-900/60">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="px-4 py-0.5 rounded-md bg-white/[0.04] text-[10px] text-slate-500 font-mono">
                  resumeforge.app/editor
                </div>
              </div>
              <div className="w-14" />
            </div>

            {/* Editor layout */}
            <div className="flex min-h-[320px] sm:min-h-[380px]">
              {/* Sidebar */}
              <div className="hidden sm:flex flex-col w-52 border-r border-white/[0.06] bg-slate-950/40 p-3 gap-1">
                {["Personal Info", "Experience", "Education", "Skills", "Projects"].map(
                  (label, i) => (
                    <div
                      key={label}
                      className={`px-3 py-2 rounded-lg text-[11px] font-medium transition-colors ${
                        i === 1
                          ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/20"
                          : "text-slate-500 hover:text-slate-400"
                      }`}
                    >
                      {label}
                    </div>
                  )
                )}
                {/* Score widget */}
                <div className="mt-auto p-3 rounded-lg bg-emerald-500/[0.06] border border-emerald-500/10">
                  <div className="text-[10px] text-emerald-400/70 font-medium mb-1">
                    ATS Score
                  </div>
                  <div className="text-xl font-bold text-emerald-400">87%</div>
                  <div className="mt-1.5 h-1 rounded-full bg-slate-800 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "87%" }}
                      transition={{ duration: 1.5, delay: 1, ease: "easeOut" }}
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                    />
                  </div>
                </div>
              </div>

              {/* Main content area — faux A4 preview */}
              <div className="flex-1 p-4 sm:p-6 flex justify-center items-start bg-slate-950/20">
                <div className="w-full max-w-sm bg-white rounded-lg shadow-lg p-5 space-y-3">
                  {/* Name header */}
                  <div className="space-y-1">
                    <div className="h-4 w-32 rounded bg-slate-800" />
                    <div className="h-2 w-44 rounded bg-indigo-200/60" />
                  </div>
                  <div className="h-px bg-slate-200" />
                  {/* Experience section */}
                  <div className="space-y-2">
                    <div className="h-2.5 w-20 rounded bg-slate-700" />
                    <div className="space-y-1.5 pl-2 border-l-2 border-indigo-300">
                      <div className="h-2 w-full rounded bg-slate-200" />
                      <div className="h-2 w-5/6 rounded bg-slate-200" />
                      <div className="h-2 w-4/6 rounded bg-slate-100" />
                    </div>
                    <div className="space-y-1.5 pl-2 border-l-2 border-slate-200">
                      <div className="h-2 w-full rounded bg-slate-200" />
                      <div className="h-2 w-3/4 rounded bg-slate-200" />
                      <div className="h-2 w-5/6 rounded bg-slate-100" />
                    </div>
                  </div>
                  {/* Education */}
                  <div className="space-y-2">
                    <div className="h-2.5 w-16 rounded bg-slate-700" />
                    <div className="space-y-1.5">
                      <div className="h-2 w-3/4 rounded bg-slate-200" />
                      <div className="h-2 w-1/2 rounded bg-slate-100" />
                    </div>
                  </div>
                  {/* Skills */}
                  <div className="space-y-2">
                    <div className="h-2.5 w-12 rounded bg-slate-700" />
                    <div className="flex flex-wrap gap-1">
                      {[20, 16, 24, 14, 18, 22, 12].map((w, i) => (
                        <div
                          key={i}
                          className="h-4 rounded-full bg-indigo-50 border border-indigo-100"
                          style={{ width: `${w * 3}px` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
