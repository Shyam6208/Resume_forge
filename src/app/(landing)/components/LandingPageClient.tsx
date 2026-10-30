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
import { ArrowRight, Sparkles, Menu, X } from "lucide-react";

export function LandingPageClient() {
  const { isAuthenticated, loading } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-100 relative">
      {/* ══════════════════════════════════════════════════════════════
          FLOATING PILL GLASSMORPHIC NAVBAR (UI-Lab Style)
          ══════════════════════════════════════════════════════════════ */}
      <header className="fixed top-0 inset-x-0 z-50 px-4 sm:px-6 pt-3 pointer-events-none">
        <div
          className={`max-w-5xl mx-auto px-4 sm:px-6 py-2.5 rounded-full transition-all duration-300 pointer-events-auto flex items-center justify-between border ${
            scrolled
              ? "bg-card/90 backdrop-blur-xl border-white/[0.12] shadow-2xl shadow-black/50"
              : "bg-card/60 backdrop-blur-lg border-white/[0.08] shadow-lg shadow-black/20"
          }`}
        >
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center text-slate-950 font-black text-sm shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              RF
            </div>
            <span className="font-extrabold text-base tracking-tight text-foreground">
              Resume<span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">Forge</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { label: "Features", href: "#features" },
              { label: "Templates", href: "/templates" },
              { label: "ATS Checker", href: "/ats-checker" },
              { label: "How It Works", href: "#how-it-works" },
              { label: "FAQ", href: "#faq" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="px-3.5 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-white/[0.06] rounded-full transition-all"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* CTA & User Menu */}
          <div className="flex items-center gap-2.5">
            {!loading && isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-xs font-semibold text-muted-foreground hover:text-foreground px-3 py-1.5 hidden sm:block transition-colors"
                >
                  Dashboard
                </Link>
                <Link href="/onboarding">
                  <Button
                    type="button"
                    className="h-8 sm:h-9 px-4 sm:px-5 text-xs bg-gradient-to-r from-cyan-500 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 font-extrabold rounded-full shadow-md shadow-cyan-500/20 transition-all flex items-center gap-1.5"
                  >
                    <span>Editor</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
                <UserMenu />
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-xs font-semibold text-muted-foreground hover:text-foreground px-3 py-1.5 transition-colors hidden sm:block"
                >
                  Sign In
                </Link>
                <Link href="/login?redirectTo=/onboarding">
                  <Button
                    type="button"
                    className="h-8 sm:h-9 px-4 sm:px-5 text-xs bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 font-extrabold rounded-full shadow-md shadow-cyan-500/20 transition-all flex items-center gap-1.5"
                  >
                    <span>Start Free</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </>
            )}

            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground md:hidden"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-2 p-4 rounded-2xl bg-card border border-white/[0.1] shadow-2xl pointer-events-auto space-y-3">
            {[
              { label: "Features", href: "#features" },
              { label: "Templates", href: "/templates" },
              { label: "ATS Checker", href: "/ats-checker" },
              { label: "How It Works", href: "#how-it-works" },
              { label: "FAQ", href: "#faq" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-semibold text-foreground hover:bg-white/[0.05] rounded-lg"
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* Main Sections */}
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
