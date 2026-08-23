"use client";

import { motion } from "framer-motion";
import { Layout, Edit3, Zap, Globe } from "lucide-react";

const STEPS = [
  {
    number: "01",
    icon: Layout,
    title: "Pick an ATS-tested layout",
    description:
      "Choose from Minimalist, Corporate Executive, Developer, or Fresher templates — all tested against top ATS parsers.",
    color: "bg-indigo-500",
    ring: "ring-indigo-500/30",
  },
  {
    number: "02",
    icon: Edit3,
    title: "Craft your experience",
    description:
      "Add experience, education, projects, and skills. Live preview updates on every keystroke with instant scoring.",
    color: "bg-violet-500",
    ring: "ring-violet-500/30",
  },
  {
    number: "03",
    icon: Zap,
    title: "1-Click AI Auto-Tailor",
    description:
      "Paste any Job Description and let AI automatically reframe your bullets, inject missing ATS keywords, and practice live mock questions.",
    color: "bg-emerald-500",
    ring: "ring-emerald-500/30",
  },
  {
    number: "04",
    icon: Globe,
    title: "Export & share live portfolio",
    description:
      "Download watermark-free A4 PDF / Word DOCX, or share your live hosted portfolio link (/r/[slug]) and downloadable QR code.",
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
            Four steps. Instant career edge.
          </h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            From blank page to a tailored resume and live web portfolio in minutes.
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
