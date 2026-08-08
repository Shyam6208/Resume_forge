"use client";

import { motion } from "framer-motion";
import { Layout, Download, CheckCircle2, ShieldCheck, Smartphone } from "lucide-react";

const STATS = [
  {
    icon: Layout,
    value: "40+",
    label: "Professional Templates",
    color: "text-indigo-400",
  },
  {
    icon: Download,
    value: "100K+",
    label: "Resumes Exported",
    color: "text-purple-400",
  },
  {
    icon: CheckCircle2,
    value: "99%",
    label: "ATS Compatible",
    color: "text-emerald-400",
  },
  {
    icon: ShieldCheck,
    value: "100%",
    label: "Free & Watermark-Free",
    color: "text-amber-400",
  },
  {
    icon: Smartphone,
    value: "Mobile",
    label: "Ready & Responsive",
    color: "text-cyan-400",
  },
];

export function StatsSection() {
  return (
    <section className="w-full bg-slate-900/90 border-y border-slate-800/80 py-10 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-6 sm:gap-8 text-center">
        {STATS.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="space-y-1.5 flex flex-col items-center"
            >
              <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 w-fit mb-1">
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {stat.value}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {stat.label}
              </span>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
