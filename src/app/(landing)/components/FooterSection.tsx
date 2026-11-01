"use client";

import Link from "next/link";
import { Heart } from "lucide-react";

export function FooterSection() {
  return (
    <footer className="w-full border-t border-white/[0.05] text-muted-foreground py-10 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="font-black text-sm text-foreground tracking-tight">
              Resume<span className="text-amber-400">Forge</span>
            </span>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap items-center gap-6 text-xs font-medium">
            {[
              { label: "Templates", href: "/templates" },
              { label: "Free ATS Checker", href: "/ats-checker" },
              { label: "Dashboard", href: "/dashboard" },
              { label: "Admin Portal", href: "/admin/login" },
              { label: "Privacy", href: "/dashboard" },
              { label: "Terms", href: "/dashboard" },
            ].map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Copyright */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground/60">
            <span>Made with</span>
            <Heart className="w-3 h-3 text-amber-500/60 fill-current" />
            <span>· © {new Date().getFullYear()}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
