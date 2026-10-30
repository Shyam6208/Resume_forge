"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Zap,
  Mic,
  Globe,
  Send,
  Target,
  FileSpreadsheet,
  CheckCircle2,
  Sparkles,
  Volume2,
  Download,
  Copy,
  Check,
  QrCode,
  Flame,
  Layers,
} from "lucide-react";

export function FeaturesSection() {
  const [tailorState, setTailorState] = useState<"after" | "before">("after");
  const [exportFormat, setExportFormat] = useState<"pdf" | "docx" | "txt">("pdf");
  const [copiedOutreach, setCopiedOutreach] = useState(false);

  const handleCopyOutreach = () => {
    navigator.clipboard.writeText("Hi Sarah, I saw the Staff Frontend role at Stripe and tailored my experience in high-concurrency micro-frontends (reduced p99 latency by 44%). Would love to share my portfolio: resumeforge.me/@alex-chen");
    setCopiedOutreach(true);
    setTimeout(() => setCopiedOutreach(false), 2000);
  };

  return (
    <section id="features" className="py-28 px-4 sm:px-6 max-w-6xl mx-auto relative">
      {/* Background glow behind Bento */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-gradient-to-r from-blue-600/10 via-cyan-500/8 to-emerald-500/10 blur-[160px] pointer-events-none -z-10" />

      {/* Section Header */}
      <div className="space-y-4 max-w-2xl mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
          <Layers className="w-3.5 h-3.5" />
          <span>Interactive Bento Suite</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-foreground tracking-[-0.025em] leading-[1.1]">
          Tools that turn cold applications{" "}
          <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
            into confirmed offers.
          </span>
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          From deterministic ATS keyword auto-injection to live AI voice mock interview simulators — explore the interactive modules below.
        </p>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          HIGH-TECH BENTO GRID
          ══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        
        {/* BENTO CARD 1: 1-Click AI Auto-Tailor (Spans 8 columns on desktop) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="md:col-span-8 p-6 sm:p-7 rounded-2xl bg-card border border-white/[0.08] hover:border-cyan-500/30 transition-all duration-300 flex flex-col justify-between space-y-6 group relative overflow-hidden"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">1-Click ATS Auto-Tailor</h3>
                <p className="text-xs text-muted-foreground">Scans job description and re-engineers bullets with missing keywords</p>
              </div>
            </div>

            {/* Toggle state */}
            <div className="flex items-center p-1 rounded-lg bg-background border border-white/[0.06] self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setTailorState("before")}
                className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all ${
                  tailorState === "before"
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Original (60%)
              </button>
              <button
                type="button"
                onClick={() => setTailorState("after")}
                className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all ${
                  tailorState === "after"
                    ? "bg-gradient-to-r from-cyan-500 to-emerald-400 text-slate-950 font-extrabold shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                AI-Tailored (98%)
              </button>
            </div>
          </div>

          {/* Interactive Card Body */}
          <div className="p-4 rounded-xl bg-background/80 border border-white/[0.06] space-y-3">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground font-mono">Role: Lead Frontend Engineer</span>
              <span className={`font-bold flex items-center gap-1 ${tailorState === "after" ? "text-emerald-400" : "text-rose-400"}`}>
                {tailorState === "after" ? (
                  <>
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    <span>ATS Match: 98% (High Priority Recruiter Flag)</span>
                  </>
                ) : (
                  <span>ATS Match: 60% (Missed Keyword Filter)</span>
                )}
              </span>
            </div>

            {tailorState === "after" ? (
              <div className="p-3.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-xs sm:text-sm text-foreground leading-relaxed">
                &quot;Architected and shipped Next.js 15 micro-frontends with <span className="text-cyan-300 font-semibold underline decoration-cyan-400/40">Zustand & WebSockets</span>, slashing initial bundle by 48% and handling <span className="text-emerald-400 font-semibold underline decoration-emerald-400/40">45,000 req/sec</span> during flash sales.&quot;
              </div>
            ) : (
              <div className="p-3.5 rounded-lg bg-rose-500/5 border border-rose-500/20 text-xs sm:text-sm text-muted-foreground line-through decoration-rose-500/50 leading-relaxed">
                &quot;Built frontend features for our website using React and Redux, worked with other developers and participated in daily standups.&quot;
              </div>
            )}

            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[10px] text-muted-foreground self-center mr-1">Injected:</span>
              {["Next.js 15", "WebSockets", "45k req/sec", "Bundle Optimization"].map((tag) => (
                <span key={tag} className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-[10px] font-medium">
                  +{tag}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Powered by fine-tuned resume scoring models</span>
            <span className="text-cyan-400 font-semibold flex items-center gap-1">
              <span>Try with your own JD in editor</span>
              <Sparkles className="w-3 h-3" />
            </span>
          </div>
        </motion.div>

        {/* BENTO CARD 2: Real-time ATS Scorecard (Spans 4 columns) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="md:col-span-4 p-6 rounded-2xl bg-card border border-white/[0.08] hover:border-cyan-500/30 transition-all duration-300 flex flex-col justify-between space-y-5 group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">ATS Scorecard</h3>
              <p className="text-xs text-muted-foreground">Deterministic scoring engine</p>
            </div>
          </div>

          {/* Mini scorecard UI */}
          <div className="p-4 rounded-xl bg-background/80 border border-white/[0.06] space-y-3.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-3xl font-black text-emerald-400">98</span>
                <span className="text-xs text-muted-foreground">/100</span>
              </div>
              <span className="px-2 py-1 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                PASSED
              </span>
            </div>

            <div className="space-y-2">
              {[
                { label: "Workday Parsing", val: 100 },
                { label: "Greenhouse Compatibility", val: 100 },
                { label: "Impact Metric Density", val: 94 },
              ].map((item) => (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-mono text-foreground font-semibold">{item.val}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full" style={{ width: `${item.val}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Zero guess work. Know exactly how automated recruiters parse your headings, dates, and bullets.
          </p>
        </motion.div>

        {/* BENTO CARD 3: Voice Mock Interview (Spans 4 columns) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="md:col-span-4 p-6 rounded-2xl bg-card border border-white/[0.08] hover:border-cyan-500/30 transition-all duration-300 flex flex-col justify-between space-y-5 group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">AI Voice Mock Interview</h3>
              <p className="text-xs text-muted-foreground">Simulate real phone screens</p>
            </div>
          </div>

          {/* Equalizer Wave Card */}
          <div className="p-4 rounded-xl bg-background/80 border border-white/[0.06] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Audio Session
              </span>
              <span className="text-[10px] font-mono text-muted-foreground">01:45</span>
            </div>

            <div className="h-10 flex items-center justify-center gap-1 bg-card rounded-lg px-3">
              <span className="w-1 bg-cyan-400 rounded-full eq-bar-1" />
              <span className="w-1 bg-teal-400 rounded-full eq-bar-2" />
              <span className="w-1 bg-emerald-400 rounded-full eq-bar-3" />
              <span className="w-1 bg-cyan-400 rounded-full eq-bar-4" />
              <span className="w-1 bg-teal-400 rounded-full eq-bar-5" />
              <span className="w-1 bg-emerald-400 rounded-full eq-bar-3" />
              <span className="w-1 bg-cyan-400 rounded-full eq-bar-2" />
              <span className="w-1 bg-teal-400 rounded-full eq-bar-4" />
            </div>

            <p className="text-[11px] text-muted-foreground line-clamp-2">
              &quot;Tell me about an architectural trade-off you made between development velocity and system scalability.&quot;
            </p>
          </div>

          <div className="flex items-center justify-between text-xs text-cyan-400 font-semibold">
            <span>Includes STAR scorecards</span>
            <Volume2 className="w-4 h-4" />
          </div>
        </motion.div>

        {/* BENTO CARD 4: Export Studio (Spans 4 columns) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="md:col-span-4 p-6 rounded-2xl bg-card border border-white/[0.08] hover:border-cyan-500/30 transition-all duration-300 flex flex-col justify-between space-y-5 group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Clean Export Studio</h3>
              <p className="text-xs text-muted-foreground">PDF, Word DOCX & Plain Text</p>
            </div>
          </div>

          {/* Format selector */}
          <div className="p-4 rounded-xl bg-background/80 border border-white/[0.06] space-y-3">
            <div className="flex p-1 rounded-lg bg-card border border-white/[0.06] gap-1">
              {(["pdf", "docx", "txt"] as const).map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => setExportFormat(fmt)}
                  className={`flex-1 py-1 rounded text-[11px] font-bold uppercase transition-all ${
                    exportFormat === fmt
                      ? "bg-gradient-to-r from-cyan-500 to-emerald-400 text-slate-950 shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>

            <div className="p-3 rounded-lg bg-card/60 flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-foreground uppercase">{exportFormat} Document</p>
                <p className="text-[10px] text-emerald-400">0 Watermarks • Vector Fonts</p>
              </div>
              <Download className="w-4 h-4 text-cyan-400" />
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Print-ready A4 dimensions guaranteed to bypass formatting errors in older ATS databases.
          </p>
        </motion.div>

        {/* BENTO CARD 5: Hosted Portfolio + QR (Spans 4 columns) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="md:col-span-4 p-6 rounded-2xl bg-card border border-white/[0.08] hover:border-cyan-500/30 transition-all duration-300 flex flex-col justify-between space-y-5 group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Web Portfolio & QR</h3>
              <p className="text-xs text-muted-foreground">Instant public profile link</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-background/80 border border-white/[0.06] flex items-center gap-4">
            <div className="p-2 bg-white rounded-lg shrink-0">
              <QrCode className="w-12 h-12 text-black" />
            </div>
            <div className="space-y-1 text-xs">
              <p className="font-mono font-bold text-foreground">resumeforge.me/@you</p>
              <p className="text-[11px] text-muted-foreground">Download SVG QR code to embed directly into printed resumes.</p>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Real-time visitor counts</span>
            <span className="text-cyan-400 font-semibold">1-Click Share</span>
          </div>
        </motion.div>

        {/* BENTO CARD 6: Recruiter Outreach Generator (Spans 12 columns - Full width) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="md:col-span-12 p-6 sm:p-7 rounded-2xl bg-card border border-white/[0.08] hover:border-cyan-500/30 transition-all duration-300 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 group"
        >
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
              <Send className="w-4 h-4" />
              <span>Direct Recruiter Outreach</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-foreground">
              Auto-generate high-conversion LinkedIn InMail & cold emails
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Don&apos;t just apply and pray. Generate tailored introductory notes citing your exact resume achievements matched directly to the hiring manager&apos;s team goals.
            </p>
          </div>

          <div className="w-full lg:w-auto p-4 rounded-xl bg-background/80 border border-white/[0.06] flex flex-col sm:flex-row items-center gap-3">
            <div className="text-xs text-muted-foreground font-mono truncate max-w-xs">
              &quot;Hi Sarah, tailored my experience in high-concurrency micro-frontends...&quot;
            </div>
            <button
              type="button"
              onClick={handleCopyOutreach}
              className="w-full sm:w-auto px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 text-xs font-extrabold flex items-center justify-center gap-1.5 transition-colors shrink-0 shadow-md shadow-cyan-500/20"
            >
              {copiedOutreach ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied Note!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Cold Note</span>
                </>
              )}
            </button>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
