"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Mic,
  Globe,
  FileText,
  Zap,
  Check,
  QrCode,
  Flame,
  Volume2,
  Copy,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

type ShowcaseTab = "tailor" | "ats" | "voice" | "portfolio";

export function HeroSection() {
  const { isAuthenticated } = useAuth();
  const buildLink = isAuthenticated ? "/onboarding" : "/login?redirectTo=/onboarding";
  const [activeTab, setActiveTab] = useState<ShowcaseTab>("tailor");
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="relative flex flex-col justify-center items-center overflow-hidden px-4 sm:px-6 pt-20 pb-12">
      {/* Background Gradients & Glow (Science-Backed Sapphire & Emerald Lighting) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Soft radial sapphire center glow */}
        <div className="absolute top-1/6 left-1/2 -translate-x-1/2 w-[750px] h-[520px] bg-gradient-to-b from-blue-600/12 via-cyan-500/8 to-transparent rounded-full blur-[140px] -z-10" />
        <div className="absolute top-1/3 left-1/4 w-[380px] h-[380px] bg-emerald-500/8 rounded-full blur-[130px] -z-10" />
        <div className="absolute top-1/2 right-1/4 w-[420px] h-[420px] bg-indigo-500/10 rounded-full blur-[140px] -z-10" />
      </div>

      {/* Modern Grid Texture */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="max-w-6xl mx-auto w-full z-10 flex flex-col items-center text-center space-y-6">
        {/* Shimmer Announcement Pill */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-medium shadow-sm hover:bg-cyan-500/15 transition-colors cursor-pointer"
        >
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
          </span>
          <span className="font-semibold text-foreground">ResumeForge 2.0</span>
          <span className="text-muted-foreground/60">•</span>
          <span className="flex items-center gap-1 text-cyan-200/90">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            1-Click AI Auto-Tailor & Live Voice Mocks
          </span>
        </motion.div>

        {/* Dynamic Editorial Headline */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.08 }}
          className="space-y-3.5 max-w-4xl"
        >
          <h1 className="text-[clamp(2.1rem,3.8vw+0.6rem,4rem)] font-black text-foreground tracking-[-0.03em] leading-[1.08]">
            Architected to beat ATS parsers.{" "}
            <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
              Engineered to land the offer.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed font-normal">
            Paste any job description to auto-inject missing ATS keywords, simulate live recruiter voice interviews, and export pixel-perfect resumes without paywalls or watermarks.
          </p>
        </motion.div>

        {/* Action Row */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.18 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full sm:w-auto"
        >
          <Link href={buildLink} className="w-full sm:w-auto">
            <Button
              type="button"
              className="w-full sm:w-auto h-12 px-8 text-sm bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 font-extrabold rounded-xl shadow-lg shadow-cyan-500/20 transition-all hover:shadow-cyan-500/30 hover:scale-[1.01] flex items-center justify-center gap-2 group"
            >
              <span>Build Free Resume</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>

          <Link href="/templates" className="w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto h-12 px-7 text-sm bg-card/60 backdrop-blur-md border-white/[0.1] text-foreground hover:bg-white/[0.08] hover:border-cyan-500/30 font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>Explore 40+ ATS Templates</span>
            </Button>
          </Link>
        </motion.div>

        {/* Live Metrics Trust Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.28 }}
          className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground pt-1"
        >
          <span className="flex items-center gap-1.5 font-medium text-foreground/80">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            98% Average ATS Compatibility
          </span>
          <span className="hidden sm:inline text-white/10">•</span>
          <span className="flex items-center gap-1.5 font-medium text-foreground/80">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            100% Free Forever, Zero Watermarks
          </span>
          <span className="hidden sm:inline text-white/10">•</span>
          <span className="flex items-center gap-1.5 font-medium text-foreground/80">
            <Mic className="w-3.5 h-3.5 text-teal-400" />
            Live Voice Mock Interview Simulator
          </span>
        </motion.div>

        {/* ══════════════════════════════════════════════════════════════
            INTERACTIVE HERO STUDIO SHOWCASE
            ══════════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.32, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-5xl mt-4 sm:mt-6 text-left"
        >
          {/* Ambient Glow behind Studio Window */}
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 via-blue-500/15 to-emerald-500/20 rounded-2xl blur-xl opacity-75 -z-10" />

          {/* Floating Pill Badges (Left & Right) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="hidden lg:flex absolute -left-6 top-16 z-30 items-center gap-3 px-3.5 py-2 rounded-xl bg-card/95 backdrop-blur-xl border border-white/[0.12] shadow-2xl shadow-black/50"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black text-xs">
              98%
            </div>
            <div>
              <p className="text-[11px] font-bold text-foreground">ATS Screen Passed</p>
              <p className="text-[10px] text-muted-foreground">Workday & Greenhouse Verified</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="hidden lg:flex absolute -right-6 bottom-16 z-30 items-center gap-3 px-3.5 py-2.5 rounded-xl bg-card/95 backdrop-blur-xl border border-white/[0.12] shadow-2xl shadow-black/50"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Flame className="w-4 h-4 fill-amber-400" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-foreground">Interview Offer Received</p>
              <p className="text-[10px] text-muted-foreground">Stripe • Staff Engineer ($210k)</p>
            </div>
          </motion.div>

          {/* Main Studio Frame */}
          <div className="rounded-2xl border border-white/[0.1] bg-card/95 backdrop-blur-2xl shadow-2xl shadow-black/60 overflow-hidden">
            {/* Top Browser Chrome Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6 py-3 border-b border-white/[0.08] bg-background/80 gap-3">
              {/* Traffic light window controls */}
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-xs font-mono font-medium text-muted-foreground ml-2 hidden md:inline">
                  resumeforge.app/studio
                </span>
              </div>

              {/* Interactive Showcase Tabs */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-background/90 border border-white/[0.06] overflow-x-auto max-w-full">
                {[
                  { id: "tailor", label: "1-Click AI Tailor", icon: Zap },
                  { id: "ats", label: "ATS Scanner (98%)", icon: CheckCircle2 },
                  { id: "voice", label: "Voice Mock Prep", icon: Mic },
                  { id: "portfolio", label: "Live Portfolio + QR", icon: Globe },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id as ShowcaseTab)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                        isActive
                          ? "bg-gradient-to-r from-cyan-500 to-emerald-400 text-slate-950 font-bold shadow-md shadow-cyan-500/20"
                          : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isActive ? "text-slate-950" : "text-cyan-400"}`} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Sync Status Badge */}
              <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live Studio</span>
              </div>
            </div>

            {/* Showcase Interactive Canvas */}
            <div className="p-4 sm:p-7 min-h-[380px] flex flex-col justify-center">
              <AnimatePresence mode="wait">
                {/* 1. AI AUTO-TAILOR TAB */}
                {activeTab === "tailor" && (
                  <motion.div
                    key="tailor"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.25 }}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-5"
                  >
                    {/* Left: Job Target & Missing Keywords */}
                    <div className="lg:col-span-4 p-4 rounded-xl bg-background/60 border border-white/[0.06] space-y-3.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">Target Role</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 font-mono">Stripe • Staff SWE</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Job Description scanned. 4 missing high-frequency ATS keywords detected for this position:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {["Distributed Systems", "gRPC Microservices", "99.99% Availability", "Kafka Streaming"].map((kw) => (
                          <span
                            key={kw}
                            className="px-2 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-[10px] font-medium flex items-center gap-1"
                          >
                            <span className="w-1 h-1 rounded-full bg-cyan-400" />
                            {kw}
                          </span>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Original Score</span>
                        <span className="font-bold text-rose-400">58% Match</span>
                      </div>
                    </div>

                    {/* Right: Interactive Diff View */}
                    <div className="lg:col-span-8 p-5 rounded-xl bg-background/80 border border-white/[0.08] space-y-4">
                      {/* Before Diff */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-rose-400 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-rose-500/80" />
                            Before AI Optimization (Generic Bullet)
                          </span>
                          <span className="text-[10px] text-muted-foreground">Lacks metrics & ATS keywords</span>
                        </div>
                        <div className="p-3 rounded-lg bg-rose-500/5 border border-rose-500/15 text-xs text-foreground/70 line-through decoration-rose-500/50">
                          &quot;Worked on checkout services and helped the team optimize backend database queries for our e-commerce platform.&quot;
                        </div>
                      </div>

                      {/* After Diff */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                            Tailored Bullet with Quantified Impact (98% Match)
                          </span>
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            +40% ATS Boost
                          </span>
                        </div>
                        <div className="p-3.5 rounded-lg bg-emerald-500/5 border border-emerald-500/25 text-xs text-foreground leading-relaxed">
                          &quot;Architected high-throughput checkout microservices using <span className="text-cyan-300 font-semibold underline decoration-cyan-400/40">gRPC & Kafka Streaming</span>, reducing p99 latency by 44% and maintaining <span className="text-emerald-400 font-semibold underline decoration-emerald-400/40">99.99% availability</span> across $18M+ daily transactions.&quot;
                        </div>
                      </div>

                      {/* Bottom Action */}
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-muted-foreground">All 4 missing ATS keywords injected</span>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy("Architected high-throughput checkout microservices using gRPC & Kafka Streaming, reducing p99 latency by 44% and maintaining 99.99% availability across $18M+ daily transactions.")}
                          className="px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold text-foreground flex items-center gap-1.5 transition-colors border border-white/[0.08]"
                        >
                          {copied ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-muted-foreground" />
                              <span>Copy Sample</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 2. ATS SCANNER TAB */}
                {activeTab === "ats" && (
                  <motion.div
                    key="ats"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.25 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                  >
                    {/* Gauge Card */}
                    <div className="p-6 rounded-xl bg-background/80 border border-white/[0.08] flex flex-col items-center justify-center text-center space-y-3">
                      <div className="relative w-28 h-28 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.06)" strokeWidth="8" fill="none" />
                          <circle
                            cx="50"
                            cy="50"
                            r="42"
                            stroke="#06b6d4"
                            strokeWidth="8"
                            strokeDasharray="264"
                            strokeDashoffset="6"
                            strokeLinecap="round"
                            fill="none"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-2xl font-black text-foreground">98%</span>
                          <span className="text-[10px] text-emerald-400 font-semibold uppercase">Excellent</span>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-foreground">ATS Compatibility</h4>
                        <p className="text-xs text-muted-foreground">Tested against 2026 enterprise parsers</p>
                      </div>
                    </div>

                    {/* Verified Parsers */}
                    <div className="p-5 rounded-xl bg-background/80 border border-white/[0.08] space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">Enterprise Parsers</h4>
                      <div className="space-y-2">
                        {[
                          { name: "Workday Recruit", status: "100% Parsed", pass: true },
                          { name: "Greenhouse Software", status: "100% Parsed", pass: true },
                          { name: "Lever Hire", status: "100% Parsed", pass: true },
                          { name: "Oracle Taleo", status: "97% Parsed", pass: true },
                        ].map((p) => (
                          <div key={p.name} className="flex items-center justify-between p-2 rounded-lg bg-card border border-white/[0.04]">
                            <span className="text-xs font-medium text-foreground">{p.name}</span>
                            <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              {p.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Scoring Breakdown */}
                    <div className="p-5 rounded-xl bg-background/80 border border-white/[0.08] space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">Deterministic Checks</h4>
                      <div className="space-y-2.5">
                        {[
                          { label: "High-Value Action Verbs", score: "96%" },
                          { label: "Quantified Revenue & Impact", score: "94%" },
                          { label: "Technical Skills Alignment", score: "100%" },
                          { label: "A4 Single-Column Layout", score: "100%" },
                        ].map((m) => (
                          <div key={m.label} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">{m.label}</span>
                              <span className="font-semibold text-foreground">{m.score}</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full" style={{ width: m.score }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 3. VOICE MOCK INTERVIEW TAB */}
                {activeTab === "voice" && (
                  <motion.div
                    key="voice"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.25 }}
                    className="p-6 rounded-xl bg-background/80 border border-white/[0.08] space-y-5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                          <Volume2 className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-foreground">AI Technical Interviewer (Voice Mode)</span>
                            <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">Speaking</span>
                          </div>
                          <p className="text-[11px] text-muted-foreground">Evaluating STAR method, clarity, and quantitative depth</p>
                        </div>
                      </div>

                      {/* Equalizer Waveform in Cyan/Emerald */}
                      <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-card border border-white/[0.06]">
                        <span className="text-[10px] font-mono text-muted-foreground mr-2">01:42 / 02:00</span>
                        <div className="flex items-center gap-0.5 h-6">
                          <span className="w-1 bg-cyan-400 rounded-full eq-bar-1" />
                          <span className="w-1 bg-teal-400 rounded-full eq-bar-2" />
                          <span className="w-1 bg-emerald-400 rounded-full eq-bar-3" />
                          <span className="w-1 bg-cyan-400 rounded-full eq-bar-4" />
                          <span className="w-1 bg-teal-400 rounded-full eq-bar-5" />
                          <span className="w-1 bg-emerald-400 rounded-full eq-bar-2" />
                        </div>
                      </div>
                    </div>

                    {/* Question Box */}
                    <div className="p-4 rounded-xl bg-card border border-white/[0.06] space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">Current Question</span>
                      <p className="text-sm font-semibold text-foreground leading-snug">
                        &quot;Can you describe a challenging scenario where a distributed database hit a bottleneck in production, and how you traced and rectified the root cause?&quot;
                      </p>
                    </div>

                    {/* Real-time Feedback Chips */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3 rounded-lg bg-background/60 border border-white/[0.06]">
                        <span className="text-[10px] text-muted-foreground">STAR Methodology</span>
                        <p className="text-xs font-bold text-emerald-400 mt-0.5">Situation & Action Clear (9.4/10)</p>
                      </div>
                      <div className="p-3 rounded-lg bg-background/60 border border-white/[0.06]">
                        <span className="text-[10px] text-muted-foreground">Keywords Detected</span>
                        <p className="text-xs font-bold text-cyan-300 mt-0.5">Indexing, Connection Pool, p99</p>
                      </div>
                      <div className="p-3 rounded-lg bg-background/60 border border-white/[0.06]">
                        <span className="text-[10px] text-muted-foreground">Interview Readiness</span>
                        <p className="text-xs font-bold text-emerald-400 mt-0.5">Top 5% Candidate</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 4. WEB PORTFOLIO & QR TAB */}
                {activeTab === "portfolio" && (
                  <motion.div
                    key="portfolio"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.25 }}
                    className="grid grid-cols-1 md:grid-cols-12 gap-5"
                  >
                    {/* Live URL & Portfolio Preview */}
                    <div className="md:col-span-8 p-5 rounded-xl bg-background/80 border border-white/[0.08] space-y-3.5">
                      <div className="flex items-center justify-between p-2 rounded-lg bg-card border border-white/[0.06]">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-cyan-400" />
                          <span className="text-xs font-mono text-foreground font-semibold">resumeforge.me/@alex-chen</span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">Live & Hosted</span>
                      </div>

                      <div className="p-4 rounded-xl bg-card border border-white/[0.06] space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center font-bold text-slate-950 text-sm">
                            AC
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-foreground">Alex Chen</h4>
                            <p className="text-xs text-muted-foreground">Staff Software Engineer • Distributed Systems</p>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed pt-1">
                          Personal portfolio generated automatically from resume data with interactive project demos, downloadable A4 PDF, and direct recruiter contact buttons.
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <span>👁️</span> 142 recruiter views in the last 7 days
                        </span>
                        <Link href="/onboarding" className="text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1 font-semibold">
                          <span>Generate Mine</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>

                    {/* QR Code Section */}
                    <div className="md:col-span-4 p-5 rounded-xl bg-background/80 border border-white/[0.08] flex flex-col items-center justify-center text-center space-y-3">
                      <div className="p-3 bg-white rounded-xl shadow-lg shadow-black/30">
                        <QrCode className="w-24 h-24 text-neutral-900" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-foreground">Recruiter QR Badge</h4>
                        <p className="text-[10px] text-muted-foreground">Download SVG/PNG to print on physical resumes or business cards</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
