"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, Sparkles, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export function CTASection() {
  const { isAuthenticated } = useAuth();
  const buildLink = isAuthenticated ? "/onboarding" : "/login?redirectTo=/onboarding";

  return (
    <section className="py-28 px-4 sm:px-6 relative">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative max-w-5xl mx-auto rounded-3xl overflow-hidden border border-cyan-500/30 p-8 sm:p-16 text-center space-y-8 shadow-2xl shadow-black/60"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(6, 182, 212, 0.18) 0%, rgba(15, 21, 35, 0.95) 75%)",
        }}
      >
        {/* Subtle mesh & ambient light */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[550px] h-[320px] bg-gradient-to-r from-blue-600/25 to-emerald-500/20 blur-[130px] rounded-full pointer-events-none" />

        {/* Shimmer Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Instant Access • No Hidden Trials • No Watermarks</span>
        </div>

        {/* Bold Title */}
        <div className="space-y-4 max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-foreground tracking-[-0.03em] leading-[1.08]">
            Your next interview starts with{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
              an unfair advantage.
            </span>
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Join over 100,000 candidates who use ResumeForge to bypass ATS filters, tailor their experience in 1 click, and land offers at top companies.
          </p>
        </div>

        {/* CTA Button */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link href={buildLink} className="w-full sm:w-auto">
            <Button
              type="button"
              className="w-full sm:w-auto h-13 px-9 text-sm bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 font-extrabold rounded-xl shadow-xl shadow-cyan-500/25 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <span>Build Your Resume Now — It&apos;s Free</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground pt-4 border-t border-white/[0.08]">
          <span className="flex items-center gap-1.5 font-medium text-foreground/80">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Zero Credit Card Required
          </span>
          <span className="flex items-center gap-1.5 font-medium text-foreground/80">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            Watermark-Free Vector PDF & DOCX
          </span>
          <span className="flex items-center gap-1.5 font-medium text-foreground/80">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Workday & Greenhouse Compliant
          </span>
        </div>
      </motion.div>
    </section>
  );
}
