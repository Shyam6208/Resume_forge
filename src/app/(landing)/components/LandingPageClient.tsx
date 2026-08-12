"use client";

import Link from "next/link";
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Sticky Glass Navbar */}
      <header className="fixed top-0 inset-x-0 z-50 h-16 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="p-1.5 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 font-bold text-xs">
            RF
          </span>
          <span className="font-extrabold text-base text-white tracking-tight">
            ResumeForge
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/templates"
            className="text-xs font-semibold text-slate-300 hover:text-white hidden sm:block px-3 py-1.5"
          >
            Templates
          </Link>

          {!loading && isAuthenticated ? (
            <>
              <Link
                href="/dashboard"
                className="text-xs font-semibold text-slate-300 hover:text-white hidden sm:block px-3 py-1.5"
              >
                Dashboard
              </Link>
              <Link href="/onboarding">
                <Button
                  type="button"
                  className="h-9 px-4 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md flex items-center gap-1.5"
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
                className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5"
              >
                Sign In
              </Link>
              <Link href="/login?redirectTo=/onboarding">
                <Button
                  type="button"
                  className="h-9 px-4 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md flex items-center gap-1.5"
                >
                  <span>Build Resume</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Landing Page Sections */}
      <main className="flex-1 space-y-4">
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
