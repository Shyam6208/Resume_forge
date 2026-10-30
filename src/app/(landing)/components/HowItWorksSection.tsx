"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Layout,
  Edit3,
  Zap,
  Globe,
  Check,
  X,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const STEPS = [
  {
    step: "01",
    title: "Pick an ATS-tested layout",
    desc: "Select from 40+ single-column and multi-section layouts verified against Workday, Greenhouse, and Taleo.",
    icon: Layout,
    highlight: "Tested on 10,000+ real job applications",
  },
  {
    step: "02",
    title: "AI drafts your impact metrics",
    desc: "Add your roles or import existing PDFs. AI instantly converts weak duties into quantifiable achievements with revenue, latency, or user impact.",
    icon: Edit3,
    highlight: "Formula: Action Verb + Context + Quantified Result",
  },
  {
    step: "03",
    title: "1-Click job description tailoring",
    desc: "Paste the specific job link or text. ResumeForge automatically flags missing technical keywords and updates your bullets in real time.",
    icon: Zap,
    highlight: "Jumps typical match scores from 60% to 95%+",
  },
  {
    step: "04",
    title: "Export free & practice voice interview",
    desc: "Download pixel-perfect vector A4 PDF or Word DOCX without paywalls or watermarks. Then launch AI voice mock interviews to rehearse before the call.",
    icon: Globe,
    highlight: "Zero paywalls, zero watermarks forever",
  },
];

const COMPARISON = [
  {
    feature: "Watermark-Free PDF Export",
    resumeforge: "100% Free Forever",
    others: "Paywalled ($24.99/mo after 1 page)",
    positive: true,
  },
  {
    feature: "Job Description 1-Click Tailor",
    resumeforge: "Included (Full Bullet Rewrite)",
    others: "Not Available or Premium Add-on",
    positive: true,
  },
  {
    feature: "Deterministic ATS Parser Checks",
    resumeforge: "Workday, Greenhouse & Taleo Verified",
    others: "Basic spell check only",
    positive: true,
  },
  {
    feature: "Live AI Voice Mock Interviews",
    resumeforge: "Interactive Mic Simulator + Timer",
    others: "None",
    positive: true,
  },
  {
    feature: "Hosted Web Portfolio + QR Code",
    resumeforge: "Live resumeforge.me link included",
    others: "None",
    positive: true,
  },
  {
    feature: "Word DOCX & Plain Text Export",
    resumeforge: "Yes, included",
    others: "Requires Pro tier",
    positive: true,
  },
];

export function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section id="how-it-works" className="py-28 px-4 sm:px-6 max-w-6xl mx-auto space-y-24">
      {/* ══════════════════════════════════════════════════════════════
          HOW IT WORKS PIPELINE
          ══════════════════════════════════════════════════════════════ */}
      <div>
        <div className="text-center space-y-3 mb-16 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Workflow</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-foreground tracking-[-0.025em]">
            From blank page to interview-ready in four steps.
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            No endless tweaking or guessing what recruiters want. Follow the proven blueprint.
          </p>
        </div>

        {/* Step Selector Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STEPS.map((s, idx) => {
            const Icon = s.icon;
            const isCurrent = activeStep === idx;
            return (
              <div
                key={s.step}
                onClick={() => setActiveStep(idx)}
                className={`p-6 rounded-2xl border transition-all duration-300 cursor-pointer text-left flex flex-col justify-between space-y-5 ${
                  isCurrent
                    ? "bg-card border-cyan-500/50 shadow-xl shadow-cyan-500/10 scale-[1.02]"
                    : "bg-card/50 border-white/[0.06] hover:border-white/[0.15] hover:bg-card"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                      isCurrent
                        ? "bg-gradient-to-tr from-cyan-500 to-emerald-400 text-slate-950 shadow-md shadow-cyan-500/20"
                        : "bg-white/[0.05] text-muted-foreground"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="font-mono text-xs text-muted-foreground font-bold">{s.step}</span>
                </div>

                <div className="space-y-2">
                  <h3 className="font-bold text-base text-foreground">{s.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>

                <div className="pt-2 border-t border-white/[0.05] text-[11px] text-cyan-400 font-medium flex items-center gap-1">
                  <span>{s.highlight}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          COMPARISON TABLE: ResumeForge vs Traditional Builders
          ══════════════════════════════════════════════════════════════ */}
      <div className="p-7 sm:p-10 rounded-3xl bg-card border border-white/[0.08] space-y-8 relative overflow-hidden shadow-2xl shadow-black/40">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 blur-[120px] pointer-events-none" />

        <div className="space-y-2 max-w-xl">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Why ResumeForge?</span>
          <h3 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            Stop paying $24/month for basic resume templates.
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Most builders trick you into building your resume, then hold your download hostage behind a surprise subscription paywall. We don&apos;t do that.
          </p>
        </div>

        {/* Comparison Grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-white/[0.08]">
                <th className="pb-4 font-bold text-muted-foreground uppercase text-[11px] tracking-wider">Feature</th>
                <th className="pb-4 font-extrabold text-emerald-400 uppercase text-[11px] tracking-wider w-1/3">
                  ResumeForge (Free)
                </th>
                <th className="pb-4 font-bold text-muted-foreground/60 uppercase text-[11px] tracking-wider w-1/3">
                  Typical Builders (Resume.io, etc.)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {COMPARISON.map((row) => (
                <tr key={row.feature} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 font-semibold text-foreground pr-4">{row.feature}</td>
                  <td className="py-4 font-bold text-emerald-400">
                    <div className="flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{row.resumeforge}</span>
                    </div>
                  </td>
                  <td className="py-4 text-muted-foreground/80">
                    <div className="flex items-center gap-1.5">
                      <X className="w-4 h-4 text-rose-400/80 shrink-0" />
                      <span>{row.others}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/[0.08]">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>No credit card required. No trials that secretly bill you.</span>
          </div>
          <Link href="/onboarding">
            <Button
              type="button"
              className="h-10 px-6 text-xs bg-gradient-to-r from-cyan-500 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 font-extrabold rounded-xl shadow-md shadow-cyan-500/20 transition-all flex items-center gap-1.5"
            >
              <span>Build Watermark-Free Resume</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
