"use client";

import { motion } from "framer-motion";
import { Layout, Edit3, Target, Download, ArrowRight } from "lucide-react";

const STEPS = [
  {
    number: "1",
    icon: Layout,
    title: "Choose Template",
    description: "Pick from ATS-optimized minimalist, corporate, developer, or fresher templates.",
    color: "bg-indigo-600 text-white",
  },
  {
    number: "2",
    icon: Edit3,
    title: "Fill Information",
    description: "Enter your work experience, education, projects, skills, and achievements.",
    color: "bg-purple-600 text-white",
  },
  {
    number: "3",
    icon: Target,
    title: "Check ATS Score",
    description: "Paste your target job description to verify keyword match & score suggestions.",
    color: "bg-emerald-600 text-white",
  },
  {
    number: "4",
    icon: Download,
    title: "Download Free PDF",
    description: "Export high-resolution watermark-free PDF or Word DOCX document instantly.",
    color: "bg-amber-600 text-white",
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-20 px-4 sm:px-6 bg-slate-900/60 border-y border-slate-800/80">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="text-xs font-bold uppercase tracking-wider text-purple-400">
            Simple 4-Step Process
          </h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            How It Works — Ready in 4 Simple Steps
          </h3>
          <p className="text-xs sm:text-sm text-slate-400">
            Building a job-winning resume has never been faster or easier.
          </p>
        </div>

        {/* 4 Steps Flow */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="relative p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-4 group hover:border-slate-700 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`w-9 h-9 rounded-xl font-bold text-xs flex items-center justify-center shadow ${step.color}`}
                  >
                    {step.number}
                  </span>
                  <Icon className="w-5 h-5 text-slate-500 group-hover:text-slate-300 transition-colors" />
                </div>

                <div className="space-y-1.5 pt-2">
                  <h4 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {step.title}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Connecting arrow indicator for desktop (except last item) */}
                {idx < STEPS.length - 1 && (
                  <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 p-1 rounded-full bg-slate-900 border border-slate-800 text-slate-500">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
