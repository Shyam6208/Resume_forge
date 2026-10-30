"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Award, Users, CheckCircle, ShieldCheck } from "lucide-react";

const STATS = [
  { value: 100, suffix: "K+", label: "Resumes Built", icon: Users, desc: "Across 48+ countries" },
  { value: 98, suffix: "%", label: "ATS Pass Rate", icon: CheckCircle, desc: "Tested against 2026 parsers" },
  { value: 40, suffix: "+", label: "Pro Templates", icon: Award, desc: "All industry layouts" },
  { value: 0, suffix: "", label: "Hidden Paywalls", display: "Zero", icon: ShieldCheck, desc: "Watermark-free export" },
];

const COMPANIES = [
  "Google",
  "Microsoft",
  "Amazon",
  "Stripe",
  "Meta",
  "Razorpay",
  "Uber",
  "Netflix",
  "Apple",
  "Shopify",
  "Swiggy",
  "Atlassian",
];

function CountUp({ target, suffix, display }: { target: number; suffix: string; display?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView || display) return;
    let start = 0;
    const duration = 1600;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, target, display]);

  return (
    <span ref={ref} className="tabular-nums">
      {display ?? `${count}${suffix}`}
    </span>
  );
}

export function StatsSection() {
  return (
    <section className="relative w-full py-16 px-4 sm:px-6 border-y border-white/[0.06] bg-card/40 overflow-hidden">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Company Logo Ticker */}
        <div className="space-y-4 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-cyan-400/80">
            Candidates interviewed & hired at top tech companies
          </p>
          <div className="relative w-full overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]">
            <div className="animate-marquee flex items-center gap-12 py-2">
              {[...COMPANIES, ...COMPANIES].map((company, idx) => (
                <div
                  key={`${company}-${idx}`}
                  className="flex items-center gap-2 text-muted-foreground/70 hover:text-cyan-400 font-bold text-sm tracking-tight transition-colors cursor-pointer select-none"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/50" />
                  <span className="text-base">{company}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 4 Sleek Stat Cards with Glassmorphism */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="p-5 sm:p-6 rounded-2xl bg-card border border-white/[0.06] hover:border-cyan-500/30 transition-all duration-300 group shadow-lg shadow-black/20"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 uppercase font-semibold">Verified</span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-foreground tracking-tight group-hover:text-cyan-400 transition-colors">
                  <CountUp target={stat.value} suffix={stat.suffix} display={stat.display} />
                </div>
                <div className="text-xs font-bold text-foreground mt-1">{stat.label}</div>
                <p className="text-[11px] text-muted-foreground mt-0.5">{stat.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
