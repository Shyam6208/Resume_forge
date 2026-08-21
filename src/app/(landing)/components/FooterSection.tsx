"use client";

import Link from "next/link";
import { Heart } from "lucide-react";

export function FooterSection() {
  return (
    <footer className="w-full border-t border-white/[0.05] text-slate-500 py-10 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-600/15 border border-indigo-500/20 text-indigo-400 font-bold text-xs">
              RF
            </span>
            <span className="font-extrabold text-sm text-white tracking-tight">
              ResumeForge
            </span>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap items-center gap-6 text-xs font-medium">
            {[
              { label: "Templates", href: "/templates" },
              { label: "Free ATS Checker", href: "/ats-checker" },
              { label: "Dashboard", href: "/dashboard" },
              { label: "Privacy", href: "/dashboard" },
              { label: "Terms", href: "/dashboard" },
            ].map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-slate-500 hover:text-slate-300 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Copyright */}
          <div className="flex items-center gap-1 text-xs text-slate-600">
            <span>Made with</span>
            <Heart className="w-3 h-3 text-rose-500/60 fill-current" />
            <span>· © {new Date().getFullYear()}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
