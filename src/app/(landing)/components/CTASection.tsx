"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export function CTASection() {
  const { isAuthenticated } = useAuth();
  const buildLink = isAuthenticated ? "/onboarding" : "/login?redirectTo=/onboarding";

  return (
    <section className="py-24 px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="relative max-w-5xl mx-auto rounded-3xl overflow-hidden"
      >
        {/* Animated gradient background */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, #312e81 0%, #4c1d95 30%, #1e1b4b 60%, #0f172a 100%)",
          }}
        />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] bg-[size:2rem_2rem] pointer-events-none" />

        {/* Soft glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[40%] bg-indigo-500/20 blur-[80px] rounded-full" />

        <div className="relative z-10 py-16 sm:py-20 px-6 sm:px-12 text-center space-y-6">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight max-w-2xl mx-auto">
            Your next interview starts
            <br />
            with a better resume.
          </h2>

          <p className="text-sm sm:text-base text-indigo-200/70 max-w-md mx-auto">
            Free forever. No credit card. No watermark. No excuses.
          </p>

          <div className="pt-2">
            <Link href={buildLink}>
              <Button
                type="button"
                className="h-13 px-10 text-sm bg-white text-slate-950 hover:bg-slate-100 font-extrabold rounded-xl shadow-xl shadow-white/10 transition-all hover:shadow-white/20 hover:scale-[1.02] flex items-center gap-2 mx-auto"
              >
                <span>Start Building — It&apos;s Free</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
