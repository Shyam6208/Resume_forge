"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Star,
  Mic,
  Globe,
  Radio,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export function HeroSection() {
  const { isAuthenticated } = useAuth();
  const buildLink = isAuthenticated ? "/onboarding" : "/login?redirectTo=/onboarding";

  return (
    <section className="relative min-h-[100dvh] flex flex-col justify-center items-center overflow-hidden px-4 sm:px-6 pt-24 pb-20">
      {/* Gradient mesh background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/4 -left-1/4 w-[80%] h-[80%] bg-indigo-950/60 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 right-0 w-[50%] h-[60%] bg-purple-950/50 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 w-[40%] h-[40%] bg-violet-950/40 rounded-full blur-[100px]" />
      </div>

      {/* Subtle grid lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="max-w-5xl mx-auto w-full z-10 text-center space-y-10">
        {/* Announcement */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.1] text-slate-300 text-xs font-semibold backdrop-blur-sm shadow-sm"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>✨ New: 1-Click AI Auto-Tailor & Live Voice Mock Interviews</span>
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="space-y-5"
        >
          <h1 className="text-[clamp(2.5rem,5vw+1rem,5rem)] font-extrabold text-white tracking-tight leading-[1.05] max-w-4xl mx-auto">
            The AI Resume & Career Suite{" "}
            <br className="hidden sm:block" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-violet-400 to-pink-400">
              engineered to land interviews.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed font-normal">
            1-Click Job Match Auto-Tailor, voice-enabled AI Mock Simulator, real-time hosted web portfolios with QR codes, and clean watermark-free exports.
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
              className="h-12 px-8 text-sm bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold rounded-xl shadow-xl shadow-indigo-500/25 transition-all hover:scale-[1.02] flex items-center gap-2"
            >
              <span>Build & Auto-Tailor Free</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>

          <Link href="/templates">
            <Button
              type="button"
              variant="outline"
              className="h-12 px-8 text-sm bg-white/[0.04] border-white/[0.1] text-slate-300 hover:bg-white/[0.08] hover:text-white font-medium rounded-xl backdrop-blur-sm transition-all"
            >
              Browse ATS Templates
            </Button>
          </Link>
        </motion.div>

        {/* Trust strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2.5 text-xs text-slate-400"
        >
          <span className="flex items-center gap-1.5 bg-white/[0.03] px-3 py-1 rounded-full border border-white/[0.05]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>95%+ ATS Score Optimization</span>
          </span>
          <span className="flex items-center gap-1.5 bg-white/[0.03] px-3 py-1 rounded-full border border-white/[0.05]">
            <Mic className="w-3.5 h-3.5 text-purple-400" />
            <span>AI Voice Mock Interviews</span>
          </span>
          <span className="flex items-center gap-1.5 bg-white/[0.03] px-3 py-1 rounded-full border border-white/[0.05]">
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>Live Portfolio + QR Code</span>
          </span>
          <span className="flex items-center gap-1.5 bg-white/[0.03] px-3 py-1 rounded-full border border-white/[0.05]">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>100% Free & No Watermarks</span>
          </span>
        </motion.div>

        {/* App Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-4xl mx-auto pt-4"
        >
          {/* Glow behind mockup */}
          <div className="absolute inset-x-10 -bottom-10 h-40 bg-indigo-600/20 blur-[70px] rounded-full" />

          {/* Window frame */}
          <div className="relative rounded-2xl border border-white/[0.1] bg-slate-900/90 backdrop-blur-2xl shadow-2xl shadow-black/60 overflow-hidden">
            {/* Title bar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.08] bg-slate-950/60">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-xs font-bold text-white ml-2">ResumeForge Studio</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-bold text-emerald-400">
                  <Radio className="w-2.5 h-2.5 text-emerald-400 animate-pulse" />
                  <span>Real-time Sync</span>
                </span>
                <div className="px-3 py-0.5 rounded-md bg-white/[0.04] text-[10px] text-slate-400 font-mono hidden sm:block">
                  resumeforge.app/editor
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white text-[10px] font-bold">
                  Auto-Tailored 94%
                </span>
              </div>
            </div>

            {/* Editor layout */}
            <div className="flex min-h-[320px] sm:min-h-[380px]">
              {/* Sidebar */}
              <div className="hidden sm:flex flex-col w-56 border-r border-white/[0.06] bg-slate-950/50 p-3 gap-1.5">
                {[
                  { label: "Personal Profile", active: false },
                  { label: "Experience & Highlights", active: true },
                  { label: "AI Auto-Tailor (JD)", active: false, badge: "✨ AI" },
                  { label: "Live Voice Mock Prep", active: false, badge: "🎙️ Live" },
                  { label: "Share Live Portfolio", active: false, badge: "🌐 QR" },
                ].map((item, i) => (
                  <div
                    key={item.label}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                      item.active
                        ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/20">
                        {item.badge}
                      </span>
                    )}
                  </div>
                ))}

                {/* Score widget */}
                <div className="mt-auto p-3.5 rounded-xl bg-emerald-500/[0.08] border border-emerald-500/20">
                  <div className="flex items-center justify-between text-[11px] text-emerald-400 font-bold mb-1">
                    <span>ATS Match Score</span>
                    <span>94% (Exceptional)</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "94%" }}
                      transition={{ duration: 1.5, delay: 1, ease: "easeOut" }}
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400"
                    />
                  </div>
                </div>
              </div>

              {/* Main content area — preview */}
              <div className="flex-1 p-5 sm:p-6 flex justify-center items-start bg-slate-950/30">
                <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-6 space-y-3.5 text-left">
                  {/* Name header */}
                  <div className="space-y-1">
                    <div className="h-4 w-40 rounded bg-slate-900 font-bold" />
                    <div className="h-2.5 w-56 rounded bg-indigo-500/40" />
                  </div>
                  <div className="h-px bg-slate-200" />
                  {/* Experience section */}
                  <div className="space-y-2">
                    <div className="h-3 w-28 rounded bg-slate-800" />
                    <div className="space-y-1.5 pl-2.5 border-l-2 border-indigo-500">
                      <div className="h-2 w-full rounded bg-slate-200" />
                      <div className="h-2 w-11/12 rounded bg-slate-200" />
                      <div className="h-2 w-4/5 rounded bg-emerald-100" />
                    </div>
                  </div>
                  {/* Skills */}
                  <div className="space-y-1.5">
                    <div className="h-2.5 w-16 rounded bg-slate-800" />
                    <div className="flex flex-wrap gap-1.5">
                      {[24, 20, 28, 16, 22].map((w, i) => (
                        <div
                          key={i}
                          className="h-4 rounded-md bg-indigo-100 border border-indigo-200"
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
