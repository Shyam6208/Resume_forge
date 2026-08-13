"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Search,
  FileText,
  MoreVertical,
  Eye,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  XCircle,
  LayoutTemplate,
  ArrowUpDown,
  Download,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { TEMPLATES } from "@/config/templates.config";
import { ResumeDetailsModal, type ResumeListItem } from "./ResumeDetailsModal";
import { AdminResumesSkeleton } from "./AdminResumesSkeleton";

// ── Types ──────────────────────────────────────────────────────

interface ResumesApiResponse {
  resumes: ResumeListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
}

interface UserOption {
  id: string;
  name: string | null;
  email: string;
}

type LoadingState = "loading" | "loaded" | "error";

const PAGE_SIZE = 20;

const SORT_OPTIONS = [
  { value: "updated_desc", label: "Recently Updated" },
  { value: "created_desc", label: "Recently Created" },
  { value: "updated_asc", label: "Oldest Updated" },
  { value: "created_asc", label: "Oldest Created" },
  { value: "title_asc", label: "Name A–Z" },
  { value: "title_desc", label: "Name Z–A" },
] as const;

// ── Component ──────────────────────────────────────────────────

export function AdminResumesClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [resumes, setResumes] = useState<ResumeListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  
  // Initialize from URL
  const [page, setPage] = useState(Math.max(1, parseInt(searchParams.get("page") || "1", 10)));
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(searchParams.get("search") || "");
  const [userId, setUserId] = useState(searchParams.get("userId") || "");
  const [templateId, setTemplateId] = useState(searchParams.get("templateId") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "updated_desc");
  const [loadingState, setLoadingState] = useState<LoadingState>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  // User filter options
  const [userOptions, setUserOptions] = useState<UserOption[]>([]);
  const [usersLoaded, setUsersLoaded] = useState(false);

  // Details modal
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Debounce ref
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── URL Synchronization ──────────────────────────────────────
  const updateUrl = useCallback((
    newPage: number,
    newSearch: string,
    newUserId: string,
    newTemplateId: string,
    newSort: string
  ) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (newPage > 1) params.set("page", String(newPage));
    else params.delete("page");
    
    if (newSearch) params.set("search", newSearch);
    else params.delete("search");

    if (newUserId) params.set("userId", newUserId);
    else params.delete("userId");

    if (newTemplateId) params.set("templateId", newTemplateId);
    else params.delete("templateId");

    if (newSort !== "updated_desc") params.set("sort", newSort);
    else params.delete("sort");
    
    const newUrl = `${pathname}${params.toString() ? '?' + params.toString() : ''}`;
    router.replace(newUrl, { scroll: false });
  }, [pathname, searchParams, router]);

  // Sync state from URL (handles Browser Back/Forward)
  useEffect(() => {
    const urlPage = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const urlSearch = searchParams.get("search") || "";
    const urlUserId = searchParams.get("userId") || "";
    const urlTemplateId = searchParams.get("templateId") || "";
    const urlSort = searchParams.get("sort") || "updated_desc";
    
    if (urlPage !== page) setPage(urlPage);
    if (urlSearch !== debouncedSearch) {
      setDebouncedSearch(urlSearch);
      setSearch(urlSearch);
    }
    if (urlUserId !== userId) setUserId(urlUserId);
    if (urlTemplateId !== templateId) setTemplateId(urlTemplateId);
    if (urlSort !== sort) setSort(urlSort);
  }, [searchParams]);

  // ── Debounced search (300ms) ─────────────────────────────────
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (search !== debouncedSearch) {
        setDebouncedSearch(search);
        setPage(1);
        updateUrl(1, search, userId, templateId, sort);
      }
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, debouncedSearch, userId, templateId, sort, updateUrl]);

  // ── Load user options for the filter dropdown ────────────────
  useEffect(() => {
    if (usersLoaded) return;
    const loadUsers = async () => {
      try {
        const res = await fetch("/api/admin/users?page=1&pageSize=100");
        if (res.ok) {
          const data = await res.json();
          if (data.users) {
            setUserOptions(
              (data.users as Array<{ id: string; name: string | null; email: string; username?: string | null }>).map((u) => ({
                id: u.id,
                name: u.name || u.username || u.email?.split("@")[0] || "User",
                email: u.email,
              }))
            );
          }
        }
      } catch {
        // Silently fail — filter just won't have user options
      }
      setUsersLoaded(true);
    };
    loadUsers();
  }, [usersLoaded]);

  // ── Fetch resumes from admin API ─────────────────────────────
  const fetchResumes = useCallback(async () => {
    setLoadingState("loading");
    setErrorMessage("");
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
        sort,
      });
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (userId) params.set("userId", userId);
      if (templateId) params.set("templateId", templateId);

      const res = await fetch(`/api/admin/resumes?${params.toString()}`);

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          (body as { error?: string }).error || `Request failed (${res.status})`
        );
      }

      const data: ResumesApiResponse = await res.json();
      setResumes(data.resumes);
      setTotalCount(data.totalCount);
      setLoadingState("loaded");
    } catch (err) {
      console.error("Failed to fetch admin resumes:", err);
      setErrorMessage(
        err instanceof Error ? err.message : "Unable to load resumes."
      );
      setLoadingState("error");
    }
  }, [page, debouncedSearch, userId, templateId, sort]);

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  // ── Pagination helpers ───────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const getPageNumbers = (): (number | "ellipsis")[] => {
    const pages: (number | "ellipsis")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("ellipsis");
      for (
        let i = Math.max(2, page - 1);
        i <= Math.min(totalPages - 1, page + 1);
        i++
      ) {
        pages.push(i);
      }
      if (page < totalPages - 2) pages.push("ellipsis");
      pages.push(totalPages);
    }
    return pages;
  };

  // ── Handlers ─────────────────────────────────────────────────
  const handleViewDetails = (id: string) => {
    setSelectedResumeId(id);
    setModalOpen(true);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    updateUrl(newPage, debouncedSearch, userId, templateId, sort);
  };

  const handleFilterChange = (key: 'userId' | 'templateId' | 'sort', value: string) => {
    let newUserId = userId;
    let newTemplateId = templateId;
    let newSort = sort;

    if (key === 'userId') newUserId = value;
    if (key === 'templateId') newTemplateId = value;
    if (key === 'sort') newSort = value;

    // Reset page to 1 on filter changes
    setPage(1);
    
    if (key === 'userId') setUserId(value);
    if (key === 'templateId') setTemplateId(value);
    if (key === 'sort') setSort(value);

    updateUrl(1, debouncedSearch, newUserId, newTemplateId, newSort);
  };

  const handleClearSearch = () => {
    setSearch("");
    setDebouncedSearch("");
    setUserId("");
    setTemplateId("");
    setSort("updated_desc");
    setPage(1);
    updateUrl(1, "", "", "", "updated_desc");
  };

  const handleExportCSV = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (userId) params.set("userId", userId);
      if (templateId) params.set("templateId", templateId);
      params.set("sort", sort);
      
      const res = await fetch(`/api/admin/resumes/export?${params.toString()}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to export resumes");
      }
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = "resumes.csv";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast.success("Resumes exported successfully");
    } catch (err) {
      console.error("Export error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to export resumes");
    } finally {
      setIsExporting(false);
    }
  };

  const hasActiveFilters = !!debouncedSearch || !!userId || !!templateId || sort !== "updated_desc";

  // ── Render states ────────────────────────────────────────────

  if (loadingState === "loading" && resumes.length === 0) {
    return <AdminResumesSkeleton />;
  }

  if (loadingState === "error") {
    return (
      <div className="space-y-6">
        <PageHeader 
          count={0} 
          onExport={handleExportCSV} 
          isExporting={isExporting} 
        />
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6 text-red-400" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-white">Unable to load resumes.</p>
            <p className="text-xs text-slate-400">{errorMessage}</p>
          </div>
          <Button
            onClick={fetchResumes}
            className="h-9 px-4 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        count={totalCount} 
        onExport={handleExportCSV} 
        isExporting={isExporting} 
      />

      {/* Search + Filters toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search resumes by title, role, or owner..."
            className="w-full h-10 pl-10 pr-9 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-colors"
          />
        </div>
      </div>

      {/* Active Filters Row */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 px-1">
          <span className="text-xs font-semibold text-slate-500">Active Filters:</span>
          {debouncedSearch && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/50 border border-slate-700 text-xs font-medium text-slate-300">
              <span>Search: <strong className="text-white font-semibold">{debouncedSearch}</strong></span>
              <button onClick={() => { setSearch(""); updateUrl(1, "", userId, templateId, sort); }} className="ml-1 p-0.5 hover:bg-slate-700 rounded-md transition-colors text-slate-400 hover:text-slate-300">
                <XCircle className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          {userId && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs font-medium text-indigo-300">
              <span>User: <strong className="text-white font-semibold">{userOptions.find((u) => u.id === userId)?.name || "Unknown"}</strong></span>
              <button onClick={() => handleFilterChange('userId', "")} className="ml-1 p-0.5 hover:bg-indigo-500/20 rounded-md transition-colors text-indigo-400 hover:text-indigo-300">
                <XCircle className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          {templateId && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-xs font-medium text-purple-300">
              <span>Template: <strong className="text-white font-semibold">{TEMPLATES.find((t) => t.id === templateId)?.name || "Unknown"}</strong></span>
              <button onClick={() => handleFilterChange('templateId', "")} className="ml-1 p-0.5 hover:bg-purple-500/20 rounded-md transition-colors text-purple-400 hover:text-purple-300">
                <XCircle className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          {sort !== "updated_desc" && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs font-medium text-amber-300">
              <span>Sort: <strong className="text-white font-semibold">{
                [
                  { value: "updated_desc", label: "Recently Updated" },
                  { value: "updated_asc", label: "Oldest Updated" },
                  { value: "created_desc", label: "Recently Created" },
                  { value: "created_asc", label: "Oldest Created" },
                  { value: "title_asc", label: "Title (A-Z)" },
                  { value: "title_desc", label: "Title (Z-A)" }
                ].find(s => s.value === sort)?.label
              }</strong></span>
              <button onClick={() => handleFilterChange('sort', "updated_desc")} className="ml-1 p-0.5 hover:bg-amber-500/20 rounded-md transition-colors text-amber-400 hover:text-amber-300">
                <XCircle className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          <Button
            variant="ghost"
            onClick={handleClearSearch}
            className="h-7 px-3 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg ml-auto sm:ml-0"
          >
            Clear Filters
          </Button>
        </div>
      )}

      {/* Loading overlay for subsequent fetches */}
      <div className={loadingState === "loading" ? "opacity-60 pointer-events-none transition-opacity" : "transition-opacity"}>
        {resumes.length === 0 ? (
          <div className="text-center p-12 text-slate-500">No resumes found.</div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="p-4">Resume</th>
                      <th className="p-4">Owner</th>
                      <th className="p-4">Target Role</th>
                      <th className="p-4">Template</th>
                      <th className="p-4 text-center">ATS</th>
                      <th className="p-4">Last Updated</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {resumes.map((r) => (
                      <ResumeRow
                        key={r.id}
                        resume={r}
                        onViewDetails={handleViewDetails}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {resumes.map((r) => (
                <ResumeCard
                  key={r.id}
                  resume={r}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4">
                <p className="text-[11px] text-slate-500">
                  Showing {(page - 1) * PAGE_SIZE + 1}–
                  {Math.min(page * PAGE_SIZE, totalCount)} of {totalCount} resumes
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    disabled={page === 1}
                    onClick={() => handlePageChange(page - 1)}
                    className="w-9 h-9 p-0 bg-slate-900/50 border-slate-800 hover:bg-slate-800 text-slate-300 disabled:opacity-50 disabled:pointer-events-none rounded-xl"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  
                  <div className="hidden sm:flex items-center gap-1">
                    {getPageNumbers().map((p, i) => 
                      p === "ellipsis" ? (
                        <span key={`ell-${i}`} className="w-9 text-center text-slate-500 text-sm">
                          ...
                        </span>
                      ) : (
                        <Button
                          key={p}
                          variant={page === p ? "default" : "outline"}
                          onClick={() => handlePageChange(p as number)}
                          className={`w-9 h-9 p-0 font-semibold rounded-xl text-sm ${
                            page === p 
                              ? "bg-purple-500 hover:bg-purple-600 text-white border-transparent" 
                              : "bg-slate-900/50 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800"
                          }`}
                        >
                          {p}
                        </Button>
                      )
                    )}
                  </div>

                  <Button
                    variant="outline"
                    disabled={page === totalPages || totalPages === 0}
                    onClick={() => handlePageChange(page + 1)}
                    className="w-9 h-9 p-0 bg-slate-900/50 border-slate-800 hover:bg-slate-800 text-slate-300 disabled:opacity-50 disabled:pointer-events-none rounded-xl"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Resume Details Modal */}
      <ResumeDetailsModal
        resumeId={selectedResumeId}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onVisibilityChange={(resumeId, newIsPublic) => {
          setResumes((prev) =>
            prev.map((r) =>
              r.id === resumeId ? { ...r, is_public: newIsPublic } : r
            )
          );
        }}
      />
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────

function PageHeader({ 
  count,
  onExport,
  isExporting
}: { 
  count: number;
  onExport: () => void;
  isExporting: boolean;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <span>Resumes</span>
          {count > 0 && (
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 font-semibold">
              {count}
            </span>
          )}
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Manage user resumes and templates
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          onClick={onExport}
          disabled={isExporting || count === 0}
          className="h-9 px-4 text-xs font-semibold bg-slate-900 border-slate-700 hover:bg-slate-800 text-white rounded-xl"
        >
          {isExporting ? (
            <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
          ) : (
            <Download className="w-3.5 h-3.5 mr-2 text-purple-400" />
          )}
          Export CSV
        </Button>
      </div>
    </div>
  );
}

function ResumeRow({
  resume,
  onViewDetails,
}: {
  resume: ResumeListItem;
  onViewDetails: (id: string) => void;
}) {
  const templateName =
    TEMPLATES.find((t) => t.id === resume.template_id)?.name || "Unknown";

  const updatedAt = resume.updated_at
    ? new Date(resume.updated_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

  return (
    <tr className="hover:bg-slate-800/40 transition-colors">
      {/* Resume title */}
      <td className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-white text-xs truncate max-w-[180px]">
              {resume.title}
            </p>
            {resume.is_public && (
              <span className="text-[9px] font-bold text-emerald-400">Public</span>
            )}
          </div>
        </div>
      </td>

      {/* Owner */}
      <td className="p-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-slate-200 truncate max-w-[120px]">
            {resume.owner_name}
          </p>
          <p className="text-[10px] text-slate-500 font-mono truncate max-w-[120px]">
            {resume.owner_email}
          </p>
        </div>
      </td>

      {/* Target Role */}
      <td className="p-4 text-[11px] text-slate-300 truncate max-w-[120px]">
        {resume.target_job || <span className="text-slate-500 italic">—</span>}
      </td>

      {/* Template */}
      <td className="p-4">
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-300 px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700">
          <LayoutTemplate className="w-3 h-3 text-indigo-400" />
          {templateName}
        </span>
      </td>

      {/* ATS Score — not calculated for list (no persisted score) */}
      <td className="p-4 text-center">
        <span className="text-[11px] text-slate-500">—</span>
      </td>

      {/* Last Updated */}
      <td className="p-4 text-[11px] text-slate-400">{updatedAt}</td>

      {/* Actions */}
      <td className="p-4 text-right">
        <DropdownMenu>
          <DropdownMenuTrigger
            className="h-7 w-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Resume actions"
          >
            <MoreVertical className="w-4 h-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="bg-slate-950 border-slate-800 text-slate-200 min-w-[150px]"
          >
            <DropdownMenuItem
              onClick={() => onViewDetails(resume.id)}
              className="text-xs gap-2 cursor-pointer focus:bg-slate-800 focus:text-white"
            >
              <Eye className="w-3.5 h-3.5" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => window.open(`/admin/resumes/${resume.id}/view`, "_blank")}
              className="text-xs gap-2 cursor-pointer focus:bg-slate-800 focus:text-white"
            >
              <FileText className="w-3.5 h-3.5" />
              View Resume
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
}

function ResumeCard({
  resume,
  onViewDetails,
}: {
  resume: ResumeListItem;
  onViewDetails: (id: string) => void;
}) {
  const templateName =
    TEMPLATES.find((t) => t.id === resume.template_id)?.name || "Unknown";

  const updatedAt = resume.updated_at
    ? new Date(resume.updated_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : "—";

  return (
    <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 space-y-3 shadow-lg">
      {/* Top row */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-white truncate">{resume.title}</p>
            <p className="text-[11px] text-slate-400 truncate">
              {resume.owner_name}
            </p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
            aria-label="Resume actions"
          >
            <MoreVertical className="w-4 h-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="bg-slate-950 border-slate-800 text-slate-200 min-w-[150px]"
          >
            <DropdownMenuItem
              onClick={() => onViewDetails(resume.id)}
              className="text-xs gap-2 cursor-pointer focus:bg-slate-800 focus:text-white"
            >
              <Eye className="w-3.5 h-3.5" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => window.open(`/admin/resumes/${resume.id}/view`, "_blank")}
              className="text-xs gap-2 cursor-pointer focus:bg-slate-800 focus:text-white"
            >
              <FileText className="w-3.5 h-3.5" />
              View Resume
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Target role */}
      {resume.target_job && (
        <p className="text-[11px] text-slate-400">
          Target: <span className="text-slate-300 font-medium">{resume.target_job}</span>
        </p>
      )}

      {/* Info grid */}
      <div className="grid grid-cols-3 gap-2 text-[11px]">
        <div className="space-y-0.5">
          <p className="text-slate-500 font-semibold">Template</p>
          <p className="text-white font-bold truncate">{templateName}</p>
        </div>
        <div className="space-y-0.5">
          <p className="text-slate-500 font-semibold">ATS Score</p>
          <p className="text-slate-500">—</p>
        </div>
        <div className="space-y-0.5">
          <p className="text-slate-500 font-semibold">Updated</p>
          <p className="text-white font-bold">{updatedAt}</p>
        </div>
      </div>

      {/* View Details button */}
      <button
        type="button"
        onClick={() => onViewDetails(resume.id)}
        className="w-full h-9 flex items-center justify-center gap-2 text-xs font-semibold text-purple-300 bg-purple-500/10 border border-purple-500/20 rounded-xl hover:bg-purple-500/20 transition-colors"
      >
        <Eye className="w-3.5 h-3.5" />
        View Details
      </button>
    </div>
  );
}

function EmptyState({
  hasFilters,
  onClear,
}: {
  hasFilters: boolean;
  onClear: () => void;
}) {
  return (
    <div className="rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl p-12 text-center space-y-4">
      <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto">
        <FileText className="w-6 h-6 text-purple-400" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-bold text-white">
          {hasFilters
            ? "No resumes match the selected filters."
            : "No resumes found"}
        </p>
        <p className="text-xs text-slate-400">
          {hasFilters
            ? "Try adjusting your search or filter criteria."
            : "Resumes will appear here once users create them."}
        </p>
      </div>
      {hasFilters && (
        <Button
          onClick={onClear}
          variant="outline"
          className="h-9 px-4 text-xs bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-200 font-semibold rounded-xl"
        >
          <XCircle className="w-3.5 h-3.5 mr-1.5" />
          Clear Filters
        </Button>
      )}
    </div>
  );
}
