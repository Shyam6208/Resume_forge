"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import type { ResumeData } from "@/types/resume.types";
import { supabase } from "@/lib/supabase/client";
import {
  Mail,
  Phone,
  MapPin,
  Globe,
  Calendar,
  Award,
  Briefcase,
  GraduationCap,
  Code2,
  Download,
  ExternalLink,
  Share2,
  QrCode,
  Sparkles,
  Radio,
  Copy,
  Check,
  Printer,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";

function LinkedinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

interface PortfolioLiveClientProps {
  initialResume: {
    id: string;
    slug: string;
    title: string;
    data: ResumeData;
    target_job?: string;
    updated_at: string;
  };
}

const emptySubscribe = () => () => {};

export function PortfolioLiveClient({ initialResume }: PortfolioLiveClientProps) {
  const [resumeData, setResumeData] = useState<ResumeData>(initialResume.data);
  const [title, setTitle] = useState(initialResume.title);
  const [targetJob, setTargetJob] = useState(initialResume.target_job);
  const [lastSyncTime, setLastSyncTime] = useState<string>(initialResume.updated_at);
  const [isLivePulse, setIsLivePulse] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const isMounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  const slug = initialResume.slug;
  const qrCodeUrl = `/api/portfolio/qr?slug=${encodeURIComponent(slug)}`;

  // Real-time Supabase subscription
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const channel = (supabase as any)
      .channel(`public:resumes:id=eq.${initialResume.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "resumes",
          filter: `id=eq.${initialResume.id}`,
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (payload: any) => {
          if (payload.new) {
            if (payload.new.data) setResumeData(payload.new.data);
            if (payload.new.title) setTitle(payload.new.title);
            if (payload.new.target_job) setTargetJob(payload.new.target_job);
            setLastSyncTime(new Date().toISOString());

            // Trigger live pulse animation
            setIsLivePulse(true);
            toast("⚡ Resume updated live in real-time!", { icon: "⚡", duration: 3000 });
            setTimeout(() => setIsLivePulse(false), 3000);
          }
        }
      )
      .subscribe();

    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase as any).removeChannel(channel);
    };
  }, [initialResume.id]);

  const pi = resumeData.personalInfo;
  const candidateName = pi?.fullName || "Professional";
  const professionalTitle = pi?.professionalTitle || targetJob || title || "Software Professional";

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success("📋 Portfolio link copied!");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Could not copy to clipboard.");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-200 relative overflow-hidden">
      {/* Top Floating Realtime Bar */}
      <header className="sticky top-0 z-40 bg-[#0B0F17]/90 backdrop-blur-xl border-b border-white/[0.08] px-4 py-3 shadow-lg">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          {/* Brand & Live Indicator */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 rounded-lg bg-gradient-to-tr from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30 text-cyan-400 font-extrabold text-xs shadow-xs">
              RF
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-bold text-sm text-white truncate hidden sm:inline">
                {candidateName}
              </span>
              <div
                className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-all ${
                  isLivePulse
                    ? "bg-emerald-500/30 text-emerald-300 border-emerald-400 scale-105 shadow-lg shadow-emerald-500/20"
                    : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                }`}
              >
                <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                <span>LIVE SYNC ACTIVE</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowQRModal(true)}
              className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white border border-white/[0.08] text-xs flex items-center gap-1.5 transition-all shadow-sm"
              title="Show QR Code"
            >
              <QrCode className="w-4 h-4 text-cyan-400" />
              <span className="hidden md:inline font-semibold">QR Code</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white border border-white/[0.08] text-xs flex items-center gap-1.5 transition-all shadow-sm"
              title="Copy Portfolio Link"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-cyan-400" />}
              <span className="hidden md:inline font-semibold">{copied ? "Copied" : "Share"}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 hover:opacity-90 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/20 transition-all active:scale-95"
              title="Print or Save PDF"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print / PDF</span>
            </button>
          </div>
        </div>
      </header>

      {/* Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-cyan-500/8 rounded-full blur-[140px]" />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-emerald-500/8 rounded-full blur-[140px]" />
      </div>

      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6">
        {/* Header Hero Profile Card */}
        <section className="bg-slate-900/60 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl shadow-cyan-950/20">
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-cyan-500/10 to-transparent rounded-bl-full pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-start gap-6 relative z-10">
            {/* Avatar */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-cyan-400 via-teal-400 to-emerald-400 flex items-center justify-center text-slate-950 text-3xl sm:text-4xl font-black shrink-0 shadow-xl shadow-cyan-500/25">
              {candidateName.charAt(0).toUpperCase()}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  {candidateName}
                </h1>
                <span className="px-2.5 py-0.5 text-[10px] font-bold bg-cyan-500/10 text-cyan-300 rounded-full border border-cyan-500/30">
                  Verified Candidate
                </span>
              </div>

              <p className="text-cyan-300 font-semibold text-sm sm:text-base mt-1">
                {professionalTitle}
              </p>

              {/* Contact Info Pills */}
              <div className="flex flex-wrap gap-2.5 mt-3 text-xs text-slate-400">
                {pi?.email && (
                  <a
                    href={`mailto:${pi.email}`}
                    className="flex items-center gap-1.5 hover:text-white transition-colors bg-white/[0.05] px-2.5 py-1 rounded-lg border border-white/[0.08]"
                  >
                    <Mail className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{pi.email}</span>
                  </a>
                )}
                {pi?.phone && (
                  <span className="flex items-center gap-1.5 bg-white/[0.05] px-2.5 py-1 rounded-lg border border-white/[0.08]">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{pi.phone}</span>
                  </span>
                )}
                {(pi?.city || pi?.country) && (
                  <span className="flex items-center gap-1.5 bg-white/[0.05] px-2.5 py-1 rounded-lg border border-white/[0.08]">
                    <MapPin className="w-3.5 h-3.5 text-rose-400" />
                    <span>{[pi?.city, pi?.country].filter(Boolean).join(", ")}</span>
                  </span>
                )}
              </div>

              {/* Social Links */}
              <div className="flex gap-2.5 mt-4">
                {pi?.linkedin && (
                  <a
                    href={pi.linkedin.startsWith("http") ? pi.linkedin : `https://${pi.linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-white/[0.05] hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 transition-all border border-white/[0.08]"
                    title="LinkedIn"
                  >
                    <LinkedinIcon className="w-4 h-4" />
                  </a>
                )}
                {pi?.github && (
                  <a
                    href={pi.github.startsWith("http") ? pi.github : `https://${pi.github}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white transition-all border border-white/[0.08]"
                    title="GitHub"
                  >
                    <GithubIcon className="w-4 h-4" />
                  </a>
                )}
                {pi?.website && (
                  <a
                    href={pi.website.startsWith("http") ? pi.website : `https://${pi.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-white/[0.05] hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 transition-all border border-white/[0.08]"
                    title="Portfolio / Website"
                  >
                    <Globe className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Summary */}
          {resumeData.summary && (
            <div className="mt-6 border-t border-white/[0.08] pt-5">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                About & Executive Summary
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed font-normal">
                {resumeData.summary}
              </p>
            </div>
          )}
        </section>

        {/* Experience Section */}
        {resumeData.experience && resumeData.experience.length > 0 && (
          <section className="bg-slate-900/60 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-xl">
            <h2 className="flex items-center gap-2.5 text-lg font-bold text-white mb-6">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Briefcase className="w-5 h-5" />
              </div>
              <span>Professional Experience</span>
            </h2>

            <div className="space-y-6">
              {resumeData.experience.map((exp, i) => (
                <div key={i} className="relative pl-6 border-l-2 border-cyan-500/30 last:border-transparent pb-2">
                  <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-slate-950 border-2 border-cyan-400" />
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <h3 className="font-bold text-white text-base">{exp.position}</h3>
                    <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                      {exp.startDate} — {exp.isCurrentlyWorking ? "Present" : exp.endDate || ""}
                    </span>
                  </div>
                  <p className="text-cyan-300 text-xs font-semibold mt-0.5">
                    {exp.company} {exp.location ? `· ${exp.location}` : ""}
                  </p>

                  {exp.responsibilities && exp.responsibilities.length > 0 && (
                    <ul className="mt-3 space-y-1.5">
                      {exp.responsibilities.map((r, j) => (
                        <li key={j} className="text-xs sm:text-sm text-slate-300 flex items-start gap-2 leading-relaxed">
                          <span className="text-cyan-400 mt-1 shrink-0">•</span>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects Section */}
        {resumeData.projects && resumeData.projects.length > 0 && (
          <section className="bg-slate-900/60 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-xl">
            <h2 className="flex items-center gap-2.5 text-lg font-bold text-white mb-6">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Code2 className="w-5 h-5" />
              </div>
              <span>Featured Projects & Systems</span>
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              {resumeData.projects.map((proj, i) => (
                <div
                  key={i}
                  className="bg-slate-950/60 rounded-2xl p-5 border border-white/[0.06] hover:border-cyan-500/30 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-bold text-white text-base">{proj.name}</h3>
                      <div className="flex gap-2">
                        {proj.githubLink && (
                          <a
                            href={proj.githubLink.startsWith("http") ? proj.githubLink : `https://${proj.githubLink}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-400 hover:text-white transition-colors"
                            title="GitHub"
                          >
                            <GithubIcon className="w-4 h-4" />
                          </a>
                        )}
                        {proj.liveDemo && (
                          <a
                            href={proj.liveDemo.startsWith("http") ? proj.liveDemo : `https://${proj.liveDemo}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-400 hover:text-emerald-400 transition-colors"
                            title="Live Demo"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{proj.description}</p>
                  </div>

                  {proj.technologies && proj.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-white/[0.06]">
                      {proj.technologies.map((tech, j) => (
                        <span
                          key={j}
                          className="px-2.5 py-0.5 text-[11px] bg-cyan-500/10 text-cyan-300 rounded-lg border border-cyan-500/20 font-medium"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills Section */}
        {resumeData.skills && Object.values(resumeData.skills).some((arr) => arr && arr.length > 0) && (
          <section className="bg-slate-900/60 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-xl">
            <h2 className="flex items-center gap-2.5 text-lg font-bold text-white mb-6">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Award className="w-5 h-5" />
              </div>
              <span>Technical & Professional Skills</span>
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              {Object.entries(resumeData.skills).map(([category, skills]) => {
                if (!skills || !Array.isArray(skills) || skills.length === 0) return null;
                return (
                  <div key={category} className="bg-slate-950/60 rounded-2xl p-4 border border-white/[0.06]">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 capitalize">
                      {category}
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {skills.map((skill, j) => (
                        <span
                          key={j}
                          className="px-3 py-1 text-xs bg-white/[0.05] text-slate-200 rounded-lg border border-white/[0.08] font-medium hover:border-cyan-500/30 transition-colors"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Education Section */}
        {resumeData.education && resumeData.education.length > 0 && (
          <section className="bg-slate-900/60 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-xl">
            <h2 className="flex items-center gap-2.5 text-lg font-bold text-white mb-6">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span>Education</span>
            </h2>

            <div className="space-y-4">
              {resumeData.education.map((edu, i) => (
                <div key={i} className="bg-slate-950/60 rounded-2xl p-4 border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-white text-sm sm:text-base">
                      {edu.degree} {edu.branch ? `— ${edu.branch}` : ""}
                    </h3>
                    <p className="text-cyan-300 text-xs sm:text-sm font-medium mt-0.5">{edu.institution}</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400 shrink-0 font-mono">
                    <span>
                      {edu.startDate} — {edu.isCurrentlyStudying ? "Present" : edu.endDate || ""}
                    </span>
                    {edu.grade && <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">Grade: {edu.grade}</span>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="text-center py-10 text-xs text-slate-500 border-t border-white/[0.08]">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="p-1 rounded bg-gradient-to-tr from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30 text-cyan-400 font-extrabold text-xs">RF</span>
            <span>
              Real-time Portfolio powered by <span className="text-cyan-400 font-semibold">ResumeForge</span>
            </span>
          </div>
          <p className="text-[11px] text-slate-500" suppressHydrationWarning>
            {isMounted && lastSyncTime
              ? `Last synchronized: ${new Date(lastSyncTime).toLocaleTimeString()}`
              : "Real-time sync active"}
          </p>
        </footer>
      </main>

      {/* QR Code Modal */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-[#0B0F17]/95 border border-white/[0.08] backdrop-blur-2xl rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-center">
            <h3 className="text-base font-bold text-white">Scan Portfolio QR Code</h3>
            <p className="text-xs text-slate-400">
              Point your smartphone camera to open this portfolio instantly on mobile.
            </p>
            <div className="bg-white rounded-xl p-4 inline-block mx-auto shadow-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48 object-contain" />
            </div>
            <button
              onClick={() => setShowQRModal(false)}
              className="w-full py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white text-xs font-semibold border border-white/[0.08] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
