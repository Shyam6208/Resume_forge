"use client";

import { Star, ShieldCheck, CheckCircle2 } from "lucide-react";

interface Testimonial {
  name: string;
  role: string;
  company: string;
  offer: string;
  quote: string;
  avatar: string;
}

const ROW_1: Testimonial[] = [
  {
    name: "Rahul Sharma",
    role: "Senior Backend Engineer",
    company: "Stripe",
    offer: "Joined as L5 SWE",
    quote: "The 1-Click AI Auto-Tailor is absurdly good. I pasted Stripe's JD and it caught 8 missing distributed systems keywords. Got a recruiter callback within 48 hours.",
    avatar: "RS",
  },
  {
    name: "Priya Menon",
    role: "Full Stack Developer",
    company: "Microsoft",
    offer: "+48% Compensation Jump",
    quote: "Every other resume site hit me with a $24.99 paywall on the download page. ResumeForge gave me a clean, vector A4 PDF with 0 watermarks and an instant ATS score of 98%.",
    avatar: "PM",
  },
  {
    name: "Arjun Verma",
    role: "DevOps & Cloud Engineer",
    company: "Amazon AWS",
    offer: "SDE-II Offer Confirmed",
    quote: "The live voice mock interview feature prepared me for the exact leadership principles and system outage questions Amazon asked in round 2.",
    avatar: "AV",
  },
  {
    name: "Sarah Jenkins",
    role: "Product Manager",
    company: "Uber",
    offer: "Senior PM Offer",
    quote: "The ATS keyword heatmap showed me exactly why my old resume was getting discarded by Greenhouse. Tailored it in 5 minutes and landed 3 interviews.",
    avatar: "SJ",
  },
];

const ROW_2: Testimonial[] = [
  {
    name: "David Kim",
    role: "Frontend Architect",
    company: "Shopify",
    offer: "Staff Engineer ($215k)",
    quote: "Having a live hosted portfolio link with an SVG QR code printed on my resume blew the hiring manager away during my on-site interview.",
    avatar: "DK",
  },
  {
    name: "Neha Patel",
    role: "Data Scientist",
    company: "Razorpay",
    offer: "Data Scientist II",
    quote: "The quantifiable impact suggestions turned my generic 'analyzed data' bullets into 'optimized fraud ML models saving $3.2M'. Pure gold.",
    avatar: "NP",
  },
  {
    name: "Marcus Vance",
    role: "Site Reliability Engineer",
    company: "Netflix",
    offer: "Senior SRE",
    quote: "Finally a resume tool built by developers who understand real hiring pipelines instead of generic marketing fluff. Truly 10/10.",
    avatar: "MV",
  },
  {
    name: "Ananya Roy",
    role: "New Grad Software Engineer",
    company: "Google",
    offer: "L3 SWE New Grad",
    quote: "As a fresh graduate applying to 100+ openings, the free DOCX export and ATS scanner saved my job hunt. Best tool on the internet.",
    avatar: "AR",
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-28 px-4 sm:px-6 relative overflow-hidden bg-card/20 border-y border-white/[0.06]">
      {/* Header */}
      <div className="max-w-4xl mx-auto text-center space-y-3 mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Real Outcomes</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-foreground tracking-[-0.025em]">
          Engineered for candidates who want offers.
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
          Over 100,000 job seekers use ResumeForge to bypass automated filters and pass technical interviews.
        </p>
      </div>

      {/* Marquee Row 1 */}
      <div className="relative w-full overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)] mb-5">
        <div className="animate-marquee flex gap-5">
          {[...ROW_1, ...ROW_1].map((t, idx) => (
            <div
              key={`row1-${idx}`}
              className="w-[380px] sm:w-[420px] p-6 rounded-2xl bg-card border border-white/[0.08] hover:border-cyan-500/30 transition-all duration-200 flex flex-col justify-between space-y-4 shrink-0 shadow-lg shadow-black/30"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {t.offer}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed font-normal">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-white/[0.06]">
                <div className="w-9 h-9 rounded-full bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-xs shrink-0">
                  {t.avatar}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-foreground truncate">{t.name}</h4>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {t.role} • <span className="text-cyan-400 font-semibold">{t.company}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Marquee Row 2 (Reverse) */}
      <div className="relative w-full overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]">
        <div className="animate-marquee-reverse flex gap-5">
          {[...ROW_2, ...ROW_2].map((t, idx) => (
            <div
              key={`row2-${idx}`}
              className="w-[380px] sm:w-[420px] p-6 rounded-2xl bg-card border border-white/[0.08] hover:border-cyan-500/30 transition-all duration-200 flex flex-col justify-between space-y-4 shrink-0 shadow-lg shadow-black/30"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {t.offer}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed font-normal">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-white/[0.06]">
                <div className="w-9 h-9 rounded-full bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-xs shrink-0">
                  {t.avatar}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-foreground truncate">{t.name}</h4>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {t.role} • <span className="text-cyan-400 font-semibold">{t.company}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
