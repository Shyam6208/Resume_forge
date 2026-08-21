"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const TESTIMONIALS = [
  {
    quote:
      "I was mass-applying to TCS, Infosys, and Wipro — the ATS checker caught 12 missing keywords I didn't even think of. Got called for 3 interviews the same week.",
    name: "Rahul S.",
    role: "B.Tech Graduate, 2025",
    initials: "RS",
    color: "bg-indigo-600",
    featured: true,
  },
  {
    quote:
      "My ATS score went from 45% to 87%. The suggestions were specific — not vague 'add more keywords' advice.",
    name: "Priya M.",
    role: "Full Stack Developer",
    initials: "PM",
    color: "bg-violet-600",
    featured: false,
  },
  {
    quote:
      "Clean PDF, no watermark, exported in seconds. Exactly what I needed for my MBA application.",
    name: "Ankit K.",
    role: "MBA Candidate",
    initials: "AK",
    color: "bg-emerald-600",
    featured: false,
  },
];

export function TestimonialsSection() {
  const featured = TESTIMONIALS.find((t) => t.featured);
  const rest = TESTIMONIALS.filter((t) => !t.featured);

  return (
    <section className="py-24 px-4 sm:px-6 bg-slate-900/30">
      <div className="max-w-6xl mx-auto">
        <div className="space-y-3 mb-14">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            People who landed interviews.
          </h2>
          <p className="text-sm text-slate-400 max-w-md">
            Real results from job seekers who used ResumeForge.
          </p>
        </div>

        {/* Asymmetric layout — 1 large + 2 stacked */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Featured — takes 3 columns */}
          {featured && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-3 p-8 rounded-2xl bg-slate-950/60 border border-white/[0.06] border-l-2 border-l-indigo-500 flex flex-col justify-between space-y-8"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-0.5 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-base sm:text-lg text-slate-200 leading-relaxed font-normal">
                  &ldquo;{featured.quote}&rdquo;
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-white/[0.06]">
                <div
                  className={`w-10 h-10 rounded-full font-bold text-xs text-white flex items-center justify-center shrink-0 ${featured.color}`}
                >
                  {featured.initials}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{featured.name}</h4>
                  <span className="text-xs text-slate-500">{featured.role}</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Smaller cards — stacked in 2 columns */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            {rest.map((t, idx) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 + idx * 0.1 }}
                className="flex-1 p-6 rounded-2xl bg-slate-950/40 border border-white/[0.05] flex flex-col justify-between space-y-5"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-3 border-t border-white/[0.05]">
                  <div
                    className={`w-8 h-8 rounded-full font-bold text-[10px] text-white flex items-center justify-center shrink-0 ${t.color}`}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{t.name}</h4>
                    <span className="text-[11px] text-slate-500">{t.role}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
