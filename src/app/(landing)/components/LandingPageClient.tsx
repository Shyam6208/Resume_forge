"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { UserMenu } from "@/components/navigation/UserMenu";
import { Button } from "@/components/ui/button";
import { HeroSection } from "./HeroSection";
import { StatsSection } from "./StatsSection";
import { FeaturesSection } from "./FeaturesSection";
import { HowItWorksSection } from "./HowItWorksSection";
import { TemplatePreviews } from "./TemplatePreviews";
import { TestimonialsSection } from "./TestimonialsSection";
import { FAQSection } from "./FAQSection";
import { CTASection } from "./CTASection";
import { FooterSection } from "./FooterSection";
import { Sparkles, ArrowRight } from "lucide-react";

export function LandingPageClient() {
  const { isAuthenticated, loading } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white relative">
      {/* Subtle noise texture overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-[1] opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Sticky Glass Navbar */}
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? "h-14 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/60 shadow-lg shadow-black/20"
            : "h-16 bg-transparent border-b border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="p-1.5 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 font-bold text-xs group-hover:bg-indigo-600/30 transition-colors">
              RF
            </span>
            <span className="font-extrabold text-base text-white tracking-tight">
              ResumeForge
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {[
              { label: "Features", href: "#features" },
              { label: "Templates", href: "/templates" },
              { label: "How It Works", href: "#how-it-works" },
              { label: "FAQ", href: "#faq" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="relative px-3 py-2 text-[13px] font-medium text-slate-400 hover:text-white transition-colors group"
              >
                {item.label}
                <span className="absolute bottom-0 left-3 right-3 h-px bg-indigo-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {!loading && isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-[13px] font-medium text-slate-400 hover:text-white px-3 py-1.5 hidden sm:block transition-colors"
                >
                  Dashboard
                </Link>
                <Link href="/onboarding">
                  <Button
                    type="button"
                    className="h-9 px-5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all"
                  >
                    <span>Continue Building</span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  </Button>
                </Link>
                <UserMenu />
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-[13px] font-medium text-slate-400 hover:text-white px-3 py-1.5 transition-colors"
                >
                  Sign In
                </Link>
                <Link href="/login?redirectTo=/onboarding">
                  <Button
                    type="button"
                    className="h-9 px-5 text-xs bg-white text-slate-950 hover:bg-slate-100 font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all"
                  >
                    <span>Start Free</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Landing Page Sections */}
      <main className="flex-1 relative z-[2]">
        <HeroSection />
        <StatsSection />
        <FeaturesSection />
        <HowItWorksSection />
        <TemplatePreviews />
        <TestimonialsSection />
        <FAQSection />
        <CTASection />
      </main>

      {/* Footer */}
      <FooterSection />
    </div>
  );
}
