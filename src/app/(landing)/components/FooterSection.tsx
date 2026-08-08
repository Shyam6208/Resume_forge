"use client";

import Link from "next/link";
import { Heart, Globe } from "lucide-react";

export function FooterSection() {
  return (
    <footer className="w-full bg-slate-950 border-t border-slate-800 text-slate-400 py-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-900 pb-8">
          {/* Logo & Tagline */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 font-bold text-xs">
                RF
              </span>
              <span className="font-extrabold text-lg text-white tracking-tight">
                ResumeForge
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm">
              Free, ATS-optimized, watermark-free resume builder designed for students, freshers, and experienced professionals.
            </p>
          </div>

          {/* Links Row */}
          <div className="flex flex-wrap items-center gap-6 text-xs font-semibold text-slate-300">
            <Link href="/onboarding" className="hover:text-indigo-400 transition-colors">
              About
            </Link>
            <Link href="/templates" className="hover:text-indigo-400 transition-colors">
              Templates
            </Link>
            <Link href="/dashboard" className="hover:text-indigo-400 transition-colors">
              Privacy
            </Link>
            <Link href="/dashboard" className="hover:text-indigo-400 transition-colors">
              Terms
            </Link>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 transition-colors flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              <span>GitHub</span>
            </a>
          </div>
        </div>

        {/* Bottom copyright & tagline */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p className="flex items-center gap-1 font-medium text-slate-400">
            <span>Made with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-current" />
            <span>— Free Forever</span>
          </p>

          <p className="text-slate-500">
            © {new Date().getFullYear()} ResumeForge. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
