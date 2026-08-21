"use client";

import { motion } from "framer-motion";
import { Layout, Edit3, Target, Download } from "lucide-react";

const STEPS = [
  {
    number: "01",
    icon: Layout,
    title: "Pick a template",
    description:
      "Choose from 40+ ATS-optimized layouts — minimalist, corporate, developer, or fresher. All tested against real applicant tracking systems.",
    color: "bg-indigo-500",
    ring: "ring-indigo-500/30",
  },
  {
    number: "02",
    icon: Edit3,
    title: "Fill in your details",
    description:
      "Add experience, education, projects, and skills. The split-screen preview shows your resume updating in real time.",
    color: "bg-violet-500",
    ring: "ring-violet-500/30",
  },
  {
    number: "03",
    icon: Target,
    title: "Check your ATS score",
    description:
      "Paste your target job description to get a keyword match percentage and specific suggestions to improve your score.",
    color: "bg-emerald-500",
    ring: "ring-emerald-500/30",
  },
  {
    number: "04",
    icon: Download,
    title: "Download for free",
    description:
      "Export a high-resolution PDF or editable DOCX — no watermark, no paywall, no sign-up friction.",
    color: "bg-amber-500",
    ring: "ring-amber-500/30",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center space-y-3 mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Four steps. One resume.
          </h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            From template to download in under ten minutes.
          </p>
        </div>

        {/* Vertical timeline */}
        <div className="relative">
          {/* Connector line */}
          <div className="absolute left-6 sm:left-8 top-0 bottom-0 w-px bg-gradient-to-b from-indigo-500/40 via-violet-500/20 to-amber-500/40" />

          <div className="space-y-10">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className="relative flex items-start gap-5 sm:gap-6"
                >
                  {/* Number circle on the timeline */}
                  <div
                    className={`relative z-10 w-12 h-12 sm:w-16 sm:h-16 rounded-full ${step.color} ring-4 ${step.ring} flex items-center justify-center shrink-0 shadow-lg`}
                  >
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>

                  {/* Content */}
                  <div className="pt-1 sm:pt-3 space-y-1.5">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-mono text-slate-600 tracking-wider">
                        {step.number}
                      </span>
                      <h3 className="text-base sm:text-lg font-bold text-white">
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-sm text-slate-400 leading-relaxed max-w-md">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
