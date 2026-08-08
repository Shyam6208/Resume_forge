"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Resume } from "@/types/resume.types";
import { ResumeCard } from "./ResumeCard";
import { Button } from "@/components/ui/button";
import { Plus, Sparkles, FileText, ArrowRight, User } from "lucide-react";

interface DashboardClientProps {
  initialResumes: Resume[];
  userEmail?: string;
}

export function DashboardClient({
  initialResumes = [],
  userEmail = "",
}: DashboardClientProps) {
  const router = useRouter();
  const [resumes, setResumes] = useState<Resume[]>(initialResumes);

  const handleUpdate = (updatedResume: Resume) => {
    setResumes((prev) =>
      prev.map((r) => (r.id === updatedResume.id ? updatedResume : r))
    );
  };

  const handleDelete = (resumeId: string) => {
    setResumes((prev) => prev.filter((r) => r.id !== resumeId));
  };

  const handleDuplicate = (newResume: Resume) => {
    setResumes((prev) => [newResume, ...prev]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Dashboard Top Header */}
      <header className="sticky top-0 z-30 w-full h-16 bg-slate-950/90 backdrop-blur border-b border-slate-800 px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group" title="Go to Home Page">
            <span className="p-1.5 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 font-bold text-xs group-hover:bg-indigo-600/30 transition-colors">
              RF
            </span>
            <span className="font-extrabold text-base text-white tracking-tight">
              ResumeForge
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {userEmail && (
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full">
              <User className="w-3.5 h-3.5 text-indigo-400" />
              <span className="truncate max-w-[150px]">{userEmail}</span>
            </div>
          )}

          <Link href="/onboarding">
            <Button
              type="button"
              className="h-9 px-4 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-md flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Resume</span>
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto w-full flex-1 p-4 sm:p-8 space-y-8">
        {/* Page Title & Subtitle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>My Resumes</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-semibold">
                {resumes.length}
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Manage, edit, score, and export your ATS-optimized resume documents.
            </p>
          </div>

          {resumes.length > 0 && (
            <Link href="/onboarding">
              <Button
                type="button"
                className="h-10 px-5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-md flex items-center gap-2 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Resume</span>
              </Button>
            </Link>
          )}
        </div>

        {/* Empty State */}
        {resumes.length === 0 ? (
          <div className="py-16 px-4 rounded-3xl bg-slate-900/40 border border-slate-800 text-center max-w-lg mx-auto space-y-5 my-8">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto shadow-inner">
              <FileText className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">
                No resumes yet — let's build your first one!
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
                Get started with our 3-step wizard. We'll automatically optimize section order and ATS keyword matching for your target job.
              </p>
            </div>

            <Link href="/onboarding" className="inline-block pt-2">
              <Button
                type="button"
                className="h-11 px-8 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Create Resume Now</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        ) : (
          /* Resume Grid: 3 cols desktop, 2 tablet, 1 mobile */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resumes.map((resume) => (
              <ResumeCard
                key={resume.id}
                resume={resume}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
                onDuplicate={handleDuplicate}
              />
            ))}
          </div>
        )}
      </main>

      {/* Dashboard Footer */}
      <footer className="w-full border-t border-slate-800/80 p-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 ResumeForge — Modern Resume Builder</span>
          <div className="flex items-center gap-4">
            <Link href="/onboarding" className="hover:text-slate-300 transition-colors">
              New Resume
            </Link>
            <Link href="/templates" className="hover:text-slate-300 transition-colors">
              Templates
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
