"use client";

import { useState, useMemo, useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import type { Resume, UserType } from "@/types/resume.types";
import { ResumeCard } from "./ResumeCard";
import { UploadResumeModal } from "./UploadResumeModal";
import { JobApplicationsBoard } from "./JobApplicationsBoard";
import { UserMenu } from "@/components/navigation/UserMenu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  FileText,
  User,
  Search,
  ArrowUpDown,
  Filter,
  LayoutTemplate,
  Trophy,
  FileArchive,
  Upload,
  Briefcase,
  ShieldAlert,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { calculateResumeScore } from "@/utils/score-calculator";

interface DashboardClientProps {
  initialResumes: Resume[];
  userEmail?: string;
  hasAdminError?: boolean;
}

type SortOption = "updated" | "created" | "score-high" | "score-low" | "name-asc" | "name-desc";
type FilterOption = "all" | "high-score" | "recent";

export function DashboardClient({
  initialResumes = [],
  userEmail = "",
  hasAdminError = false,
}: DashboardClientProps) {
  const [resumes, setResumes] = useState<Resume[]>(initialResumes);

  useEffect(() => {
    if (hasAdminError) {
      toast.error(
        "Admin access restricted: Your account does not have admin privileges. Please sign in with an authorized admin account.",
        { id: "admin-required-toast", duration: 6000 }
      );
    }
  }, [hasAdminError]);
  
  // Controls state
  const [mainTab, setMainTab] = useState<"resumes" | "applications">("resumes");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("updated");
  const [filterBy, setFilterBy] = useState<FilterOption>("all");

  // Hydration fix for skeletons (using React 18/19 useSyncExternalStore)
  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

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

  // Derive stats
  const stats = useMemo(() => {
    let bestScore = 0;
    const templates = new Set<string>();

    resumes.forEach((r) => {
      const score = calculateResumeScore(r.data, (r.targetJob as UserType) || "developer").score;
      if (score > bestScore) bestScore = score;
      if (r.templateId) templates.add(r.templateId);
    });

    return {
      total: resumes.length,
      bestScore,
      templatesUsed: templates.size,
    };
  }, [resumes]);

  // Derive filtered and sorted resumes
  const displayResumes = useMemo(() => {
    // 1. Filter
    let result = resumes.filter((r) => {
      // Search
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        r.title?.toLowerCase().includes(searchLower) ||
        r.targetJob?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;

      // Dropdown Filter
      if (filterBy === "high-score") {
        const score = calculateResumeScore(r.data, (r.targetJob as UserType) || "developer").score;
        return score >= 80;
      }
      if (filterBy === "recent") {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return new Date(r.updatedAt) >= thirtyDaysAgo;
      }
      
      return true;
    });

    // 2. Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "created":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "updated":
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case "score-high":
        case "score-low": {
          const scoreA = calculateResumeScore(a.data, (a.targetJob as UserType) || "developer").score;
          const scoreB = calculateResumeScore(b.data, (b.targetJob as UserType) || "developer").score;
          return sortBy === "score-high" ? scoreB - scoreA : scoreA - scoreB;
        }
        case "name-asc":
          return (a.title || "").localeCompare(b.title || "");
        case "name-desc":
          return (b.title || "").localeCompare(a.title || "");
        default:
          return 0;
      }
    });

    return result;
  }, [resumes, searchQuery, sortBy, filterBy]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Dashboard Top Header */}
      <header className="sticky top-0 z-30 w-full h-16 bg-background/90 backdrop-blur border-b border-white/[0.06] px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group" title="Go to Home Page">
            <span className="font-black text-base text-foreground tracking-tight">
              Resume<span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">Forge</span>
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <UserMenu />
        </div>
      </header>

      {/* Admin Access Required Warning Banner */}
      {hasAdminError && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 sm:px-8 py-3 text-xs sm:text-sm text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Admin Access Required:</strong> Your current signed-in account does not have administrator privileges.
            </span>
          </div>
          <Link
            href="/admin/login"
            className="inline-flex items-center justify-center px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold rounded-lg border border-amber-500/30 transition-colors self-start sm:self-auto text-xs"
          >
            Sign in to Admin Portal &rarr;
          </Link>
        </div>
      )}

      {/* Sub-Header Tab Navigation */}
      <div className="border-b border-white/[0.06] bg-background/60 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-2 pt-2">
          <button
            type="button"
            onClick={() => setMainTab("resumes")}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
              mainTab === "resumes"
                ? "border-cyan-500 text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileText className="w-4 h-4 text-cyan-400" />
            <span>My Resumes</span>
            {resumes.length > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 font-mono font-semibold">
                {resumes.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setMainTab("applications")}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
              mainTab === "applications"
                ? "border-amber-500 text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Briefcase className="w-4 h-4 text-emerald-400" />
            <span>Job Tracker</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold uppercase tracking-wider">
              New
            </span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto w-full flex-1 p-4 sm:p-6 lg:p-8 space-y-8">
        {mainTab === "applications" ? (
          <JobApplicationsBoard resumes={resumes} />
        ) : (
          <>
            {/* Page Title & Stats Row */}
            <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>My Resumes</span>
                {resumes.length > 0 && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/20 font-semibold">
                    {resumes.length}
                  </span>
                )}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Manage, edit, and optimize your ATS-ready resumes.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsUploadModalOpen(true)}
                className="h-10 px-5 text-xs bg-card border-white/[0.08] hover:bg-white/[0.06] hover:border-cyan-500/30 text-foreground/80 font-semibold rounded-xl shadow-sm flex items-center gap-2 w-full sm:w-auto transition-colors"
              >
                <Upload className="w-4 h-4 text-cyan-400" />
                <span>Upload Existing Resume</span>
              </Button>
              <Link href="/onboarding" className="w-full sm:w-auto shrink-0">
                <Button
                  type="button"
                  className="h-10 px-5 text-xs bg-gradient-to-r from-cyan-500 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 font-extrabold rounded-xl shadow-md shadow-cyan-500/20 flex items-center gap-2 w-full transition-transform hover:scale-105 active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create New Resume</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Row */}
          {resumes.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              <div className="bg-card border border-white/[0.06] rounded-xl p-4 flex items-center gap-4 transition-colors hover:bg-white/[0.03]">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
                  <FileArchive className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Total Resumes</p>
                  <p className="text-xl font-bold text-foreground">{stats.total}</p>
                </div>
              </div>
              <div className="bg-card border border-white/[0.06] rounded-xl p-4 flex items-center gap-4 transition-colors hover:bg-white/[0.03]">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Best Score</p>
                  <p className="text-xl font-bold text-foreground">{stats.bestScore > 0 ? `${stats.bestScore}/100` : "N/A"}</p>
                </div>
              </div>
              <div className="hidden md:flex bg-card border border-white/[0.06] rounded-xl p-4 items-center gap-4 transition-colors hover:bg-white/[0.03]">
                <div className="w-10 h-10 rounded-lg bg-white/[0.06] text-muted-foreground flex items-center justify-center shrink-0">
                  <LayoutTemplate className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Templates Used</p>
                  <p className="text-xl font-bold text-foreground">{stats.templatesUsed}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Toolbar: Search, Sort, Filter */}
        {resumes.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search resumes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 bg-card border-white/[0.08] text-sm text-foreground placeholder:text-muted-foreground/50 rounded-lg focus-visible:ring-cyan-500/40 w-full"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger className="h-10 px-4 inline-flex items-center justify-center border bg-card border-white/[0.08] text-foreground/80 hover:bg-white/[0.06] hover:text-foreground rounded-lg text-xs gap-2 shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/40">
                  <Filter className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {filterBy === "all" ? "All" : filterBy === "high-score" ? "High Score" : "Recent"}
                  </span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel className="text-xs text-muted-foreground">Filter By</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-800" />
                  <DropdownMenuItem onClick={() => setFilterBy("all")} className="text-xs hover:bg-slate-800 cursor-pointer">
                    All Resumes
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterBy("high-score")} className="text-xs hover:bg-slate-800 cursor-pointer">
                    High ATS Score (&ge;80)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterBy("recent")} className="text-xs hover:bg-slate-800 cursor-pointer">
                    Recently Updated
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger className="h-10 px-4 inline-flex items-center justify-center border bg-card border-white/[0.08] text-foreground/80 hover:bg-white/[0.06] hover:text-foreground rounded-lg text-xs gap-2 shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/40">
                  <ArrowUpDown className="w-4 h-4" />
                  <span className="hidden sm:inline">Sort</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel className="text-xs text-muted-foreground">Sort By</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-800" />
                  <DropdownMenuItem onClick={() => setSortBy("updated")} className="text-xs hover:bg-slate-800 cursor-pointer flex items-center justify-between">
                    Recently Updated
                    {sortBy === "updated" && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("created")} className="text-xs hover:bg-slate-800 cursor-pointer flex items-center justify-between">
                    Recently Created
                    {sortBy === "created" && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("score-high")} className="text-xs hover:bg-slate-800 cursor-pointer flex items-center justify-between">
                    Highest ATS Score
                    {sortBy === "score-high" && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("score-low")} className="text-xs hover:bg-slate-800 cursor-pointer flex items-center justify-between">
                    Lowest ATS Score
                    {sortBy === "score-low" && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-800" />
                  <DropdownMenuItem onClick={() => setSortBy("name-asc")} className="text-xs hover:bg-slate-800 cursor-pointer flex items-center justify-between">
                    Name A-Z
                    {sortBy === "name-asc" && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("name-desc")} className="text-xs hover:bg-slate-800 cursor-pointer flex items-center justify-between">
                    Name Z-A
                    {sortBy === "name-desc" && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        )}

        {/* Empty State - Absolute Zero Resumes */}
        {resumes.length === 0 ? (
          <div className="py-20 px-4 rounded-2xl bg-card border border-white/[0.06] text-center max-w-2xl mx-auto space-y-6 my-12 relative overflow-hidden">
            {/* Background subtle glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-600/10 blur-[80px] rounded-full pointer-events-none" />
            
            <div className="w-20 h-20 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto shadow-inner relative z-10">
              <FileText className="w-10 h-10" />
            </div>

            <div className="space-y-3 relative z-10">
              <h3 className="text-xl font-bold text-foreground">
                No resumes yet
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
                Create your first ATS-optimized resume and start applying with confidence.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 relative z-10 w-full px-4 sm:px-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsUploadModalOpen(true)}
                className="h-12 px-8 text-sm bg-card border-white/[0.08] hover:bg-white/[0.04] text-foreground/80 font-bold rounded-xl shadow-lg flex items-center gap-2 w-full sm:w-auto transition-colors backdrop-blur"
              >
                <Upload className="w-4 h-4 text-cyan-400" />
                <span>Upload Existing Resume</span>
              </Button>
              <Link href="/onboarding" className="w-full sm:w-auto">
                <Button
                  type="button"
                  className="h-12 px-8 text-sm bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 font-extrabold rounded-xl shadow-lg shadow-cyan-500/20 flex items-center gap-2 w-full transition-transform hover:scale-105 active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create New Resume</span>
                </Button>
              </Link>
            </div>
          </div>
        ) : displayResumes.length === 0 ? (
          /* Empty State - Filtered */
          <div className="py-16 text-center space-y-4">
            <div className="w-12 h-12 mx-auto bg-card rounded-full flex items-center justify-center text-muted-foreground border border-white/[0.06]">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <p className="text-foreground font-semibold">No resumes found</p>
              <p className="text-muted-foreground text-sm mt-1">Try adjusting your search or filters.</p>
            </div>
            <Button 
              variant="outline" 
              className="mt-2 text-xs bg-card border-white/[0.08] text-foreground/70 hover:bg-white/[0.04] hover:text-foreground"
              onClick={() => { setSearchQuery(""); setFilterBy("all"); }}
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          /* Resume Grid: Evergreen auto-fit */
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] gap-5 sm:gap-6">
            {!isMounted 
              ? Array(resumes.length || 3).fill(0).map((_, i) => (
                  <div key={`client-skel-${i}`} className="rounded-xl bg-card border border-white/[0.06] overflow-hidden flex flex-col h-[340px]">
                    {/* Top Visual Preview Placeholder */}
                    <div className="h-32 bg-background border-b border-white/[0.06] flex items-center justify-center relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none" />
                      <div className="w-12 h-16 bg-white/[0.06] rounded-sm animate-pulse motion-reduce:animate-none" />
                      <div className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-white/[0.04] animate-pulse motion-reduce:animate-none" />
                      <div className="absolute bottom-3 left-4 w-20 h-5 rounded-md bg-white/[0.06] animate-pulse motion-reduce:animate-none" />
                    </div>
                    
                    {/* Card Content Skeleton */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="h-5 w-3/4 bg-white/[0.06] rounded animate-pulse motion-reduce:animate-none" />
                          <div className="flex items-center justify-between">
                            <div className="h-3 w-1/2 bg-white/[0.04] rounded animate-pulse motion-reduce:animate-none" />
                            <div className="h-3 w-16 bg-white/[0.03] rounded animate-pulse motion-reduce:animate-none shrink-0" />
                          </div>
                        </div>
                        
                        {/* ATS Progress Bar Skeleton */}
                        <div className="space-y-3 pt-2">
                          <div className="flex justify-between items-center">
                            <div className="h-3 w-16 bg-white/[0.06] rounded animate-pulse motion-reduce:animate-none" />
                            <div className="h-4 w-12 bg-white/[0.06] rounded-full animate-pulse motion-reduce:animate-none" />
                          </div>
                          <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
                            <div className="h-full w-2/3 bg-white/[0.04] rounded-full animate-pulse motion-reduce:animate-none" />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Card Buttons Skeleton */}
                    <div className="p-5 pt-0 grid grid-cols-2 gap-3">
                      <div className="h-10 bg-white/[0.06] rounded-lg animate-pulse motion-reduce:animate-none" />
                      <div className="h-10 bg-cyan-500/15 rounded-lg animate-pulse motion-reduce:animate-none" />
                    </div>
                  </div>
                ))
              : displayResumes.map((resume) => (
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
        </>
      )}
      </main>

      {/* Dashboard Footer */}
      <footer className="w-full border-t border-white/[0.06] p-4 text-center text-xs text-muted-foreground mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 ResumeForge — Modern Resume Builder</span>
          <div className="flex items-center gap-4">
            <Link href="/onboarding" className="hover:text-foreground transition-colors">
              New Resume
            </Link>
            <Link href="/templates" className="hover:text-foreground transition-colors">
              Templates
            </Link>
          </div>
        </div>
      </footer>

      <UploadResumeModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
      />
    </div>
  );
}
