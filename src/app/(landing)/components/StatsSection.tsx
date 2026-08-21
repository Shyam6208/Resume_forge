"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

const STATS = [
  { value: 40, suffix: "+", label: "Templates" },
  { value: 100, suffix: "K+", label: "Resumes Created" },
  { value: 99, suffix: "%", label: "ATS Compatible" },
  { value: 0, suffix: "", label: "Watermarks", display: "Zero" },
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
    <section className="relative w-full py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-y-6"
        >
          {STATS.map((stat, idx) => (
            <div key={stat.label} className="flex items-center">
              <div className="text-center px-6 sm:px-10">
                <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  <CountUp target={stat.value} suffix={stat.suffix} display={stat.display} />
                </div>
                <div className="text-xs text-slate-500 font-medium mt-1">{stat.label}</div>
              </div>
              {idx < STATS.length - 1 && (
                <div className="hidden sm:block w-px h-8 bg-slate-800" />
              )}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
