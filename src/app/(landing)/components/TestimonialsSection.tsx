"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const TESTIMONIALS = [
  {
    quote: "Got my first job at TCS! The fresher basic template put my college projects right at the top and passed the screening cleanly.",
    name: "Rahul S.",
    role: "Fresher / Graduate",
    initials: "RS",
    color: "bg-indigo-600",
    rating: 5,
  },
  {
    quote: "My ATS score jumped from 45% to 87% after adding missing skills suggested by the ATS checker. Landed 3 interviews in a week!",
    name: "Priya M.",
    role: "Full Stack Developer",
    initials: "PM",
    color: "bg-purple-600",
    rating: 5,
  },
  {
    quote: "Perfect for my MBA applications. The corporate template is super clean, no watermarks, and exported instantly to PDF & DOCX.",
    name: "Ankit K.",
    role: "MBA Candidate",
    initials: "AK",
    color: "bg-emerald-600",
    rating: 5,
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-20 px-4 sm:px-6 bg-slate-900/40 border-y border-slate-800/80">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Success Stories
          </h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Loved by Job Seekers & Professionals
          </h3>
          <p className="text-xs sm:text-sm text-slate-400">
            Here is how ResumeForge helped candidates pass ATS screeners and land top roles.
          </p>
        </div>

        {/* 3 Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, idx) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-6 relative group hover:border-slate-700 transition-colors"
            >
              <Quote className="w-8 h-8 text-slate-800 absolute top-4 right-4 pointer-events-none group-hover:text-indigo-500/20 transition-colors" />

              <div className="space-y-3 relative z-10">
                {/* 5 Stars */}
                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>

                <p className="text-xs sm:text-sm text-slate-300 italic leading-relaxed">
                  "{t.quote}"
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2 border-t border-slate-900">
                <div
                  className={`w-10 h-10 rounded-full font-bold text-xs text-white flex items-center justify-center shrink-0 ${t.color}`}
                >
                  {t.initials}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{t.name}</h4>
                  <span className="text-xs text-slate-400">{t.role}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
