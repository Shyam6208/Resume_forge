"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles, CheckCircle2, FileText, ShieldCheck, Zap } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";

export function HeroSection() {
  const { isAuthenticated } = useAuth();
  const buildLink = isAuthenticated ? "/onboarding" : "/login?redirectTo=/onboarding";

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/40 to-slate-950 flex flex-col justify-center items-center overflow-hidden px-4 sm:px-6 pt-20 pb-16">
      {/* Background Animated Grid Lines & Glow Orbs */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-[600px] h-[350px] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none"
      />

      <div className="max-w-6xl mx-auto w-full z-10 text-center space-y-8">
        {/* Top Announcement Badge */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold backdrop-blur"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Next-Gen ATS Resume Builder — 100% Free Forever</span>
        </motion.div>

        {/* Hero Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] max-w-4xl mx-auto"
        >
          Create a Professional Resume in{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
            Minutes
          </span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed"
        >
          ATS-friendly templates. No watermark. No AI bloat. Completely free.
        </motion.p>

        {/* Feature Highlights Pills */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="flex flex-wrap justify-center gap-4 text-xs font-medium text-slate-400"
        >
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>99% ATS Pass Guarantee</span>
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>Zero Watermarks</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>PDF & DOCX Instant Export</span>
          </span>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
        >
          <Link href={buildLink}>
            <Button
              type="button"
              className="h-12 px-8 text-sm bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-xl shadow-indigo-600/30 transition-all transform hover:scale-105 flex items-center gap-2"
            >
              <span>Create Resume</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>

          <Link href="/templates">
            <Button
              type="button"
              variant="outline"
              className="h-12 px-8 text-sm bg-slate-900/80 border-slate-800 text-slate-200 hover:bg-slate-800 hover:text-white font-semibold rounded-2xl backdrop-blur transition-all"
            >
              <span>Browse Templates</span>
            </Button>
          </Link>
        </motion.div>

        {/* 3 Floating Resume Cards Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative max-w-4xl mx-auto pt-10 grid grid-cols-1 sm:grid-cols-3 gap-6"
        >
          {/* Mock Card 1 */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-2xl backdrop-blur text-left space-y-3 relative overflow-hidden"
          >
            <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Alex Morgan</span>
              <Badge className="bg-emerald-500/20 text-emerald-300 text-[9px] border-emerald-500/30">
                ATS 95%
              </Badge>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">Senior Full Stack Developer</p>
            <div className="space-y-1.5 pt-1">
              <div className="h-1.5 w-full bg-slate-800 rounded" />
              <div className="h-1.5 w-4/5 bg-slate-800 rounded" />
              <div className="h-1.5 w-2/3 bg-slate-800/60 rounded" />
            </div>
          </motion.div>

          {/* Mock Card 2 (Center featured) */}
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="p-5 rounded-2xl bg-slate-900 border border-indigo-500/50 shadow-2xl shadow-indigo-500/10 text-left space-y-3 sm:-translate-y-4 relative"
          >
            <div className="h-1.5 w-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Priya Sharma</span>
              <Badge className="bg-indigo-500/20 text-indigo-300 text-[9px] border-indigo-500/30">
                Score: 92
              </Badge>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">Product Manager</p>
            <div className="space-y-1.5 pt-1">
              <div className="h-1.5 w-full bg-indigo-500/30 rounded" />
              <div className="h-1.5 w-5/6 bg-indigo-500/20 rounded" />
              <div className="h-1.5 w-3/4 bg-indigo-500/10 rounded" />
            </div>
          </motion.div>

          {/* Mock Card 3 */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-2xl backdrop-blur text-left space-y-3 relative overflow-hidden"
          >
            <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 to-rose-500 rounded-full" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Rahul Verma</span>
              <Badge className="bg-amber-500/20 text-amber-300 text-[9px] border-amber-500/30">
                Fresher Pro
              </Badge>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">Computer Science Graduate</p>
            <div className="space-y-1.5 pt-1">
              <div className="h-1.5 w-full bg-slate-800 rounded" />
              <div className="h-1.5 w-3/4 bg-slate-800 rounded" />
              <div className="h-1.5 w-1/2 bg-slate-800/60 rounded" />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
