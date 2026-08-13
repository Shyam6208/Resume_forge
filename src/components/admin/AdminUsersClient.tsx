"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Search,
  Users,
  User,
  ShieldCheck,
  MoreVertical,
  Eye,
  FileText,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  XCircle,
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
import { UserDetailsModal, type UserForModal } from "./UserDetailsModal";
import { UsersSkeleton } from "./UsersSkeleton";

// ── Types ──────────────────────────────────────────────────────

interface AdminUser {
  id: string;
  name: string | null;
  email: string;
  avatar_url: string | null;
  username: string | null;
  user_type: string | null;
  is_admin: boolean;
  is_guest: boolean;
  created_at: string;
  updated_at: string;
  resume_count: number;
}

interface UsersApiResponse {
  users: AdminUser[];
  totalCount: number;
  page: number;
  pageSize: number;
}

type LoadingState = "loading" | "loaded" | "error";

const PAGE_SIZE = 20;

// ── Component ──────────────────────────────────────────────────

export function AdminUsersClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  
  // Initialize from URL
  const [page, setPage] = useState(Math.max(1, parseInt(searchParams.get("page") || "1", 10)));
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(searchParams.get("search") || "");
  const [loadingState, setLoadingState] = useState<LoadingState>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  // User details modal
  const [selectedUser, setSelectedUser] = useState<UserForModal | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Debounce ref
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── URL Synchronization ──────────────────────────────────────
  const updateUrl = useCallback((newPage: number, newSearch: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (newPage > 1) params.set("page", String(newPage));
    else params.delete("page");
    
    if (newSearch) params.set("search", newSearch);
    else params.delete("search");
    
    const newUrl = `${pathname}${params.toString() ? '?' + params.toString() : ''}`;
    // We use push but could use replace depending on history preference
    router.replace(newUrl, { scroll: false });
  }, [pathname, searchParams, router]);

  // Sync state from URL (handles Browser Back/Forward)
  useEffect(() => {
    const urlPage = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const urlSearch = searchParams.get("search") || "";
    
    if (urlPage !== page) setPage(urlPage);
    if (urlSearch !== debouncedSearch) {
      setDebouncedSearch(urlSearch);
      setSearch(urlSearch);
    }
  }, [searchParams]);

  // ── Debounced search (300ms) ─────────────────────────────────
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (search !== debouncedSearch) {
        setDebouncedSearch(search);
        setPage(1);
        updateUrl(1, search);
      }
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, debouncedSearch, updateUrl]);

  // ── Fetch users from admin API ───────────────────────────────
  const fetchUsers = useCallback(async () => {
    setLoadingState("loading");
    setErrorMessage("");
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
      });
      if (debouncedSearch) {
        params.set("search", debouncedSearch);
      }

      const res = await fetch(`/api/admin/users?${params.toString()}`);

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          (body as { error?: string }).error || `Request failed (${res.status})`
        );
      }

      const data: UsersApiResponse = await res.json();
      setUsers(data.users);
      setTotalCount(data.totalCount);
      setLoadingState("loaded");
    } catch (err) {
      console.error("Failed to fetch admin users:", err);
      setErrorMessage(
        err instanceof Error ? err.message : "Unable to load users."
      );
      setLoadingState("error");
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

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

  // ── Action handlers ──────────────────────────────────────────
  const handleViewDetails = (user: AdminUser) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleClearSearch = () => {
    setSearch("");
    setDebouncedSearch("");
    setPage(1);
    updateUrl(1, "");
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    updateUrl(newPage, debouncedSearch);
  };

  const handleExportCSV = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) {
        params.set("search", debouncedSearch);
      }
      const res = await fetch(`/api/admin/users/export?${params.toString()}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to export users");
      }
      
      // Download the CSV file
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = "users.csv";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast.success("Users exported successfully");
    } catch (err) {
      console.error("Export error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to export users");
    } finally {
      setIsExporting(false);
    }
  };

  // ── Render states ────────────────────────────────────────────

  if (loadingState === "loading" && users.length === 0) {
    return <UsersSkeleton />;
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
            <p className="text-sm font-bold text-white">
              Unable to load users.
            </p>
            <p className="text-xs text-slate-400">{errorMessage}</p>
          </div>
          <Button
            onClick={fetchUsers}
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

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-slate-500" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or username..."
            className="w-full h-10 pl-10 pr-10 bg-slate-900/50 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
          />
          {search && (
            <button
              onClick={handleClearSearch}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {debouncedSearch && (
        <div className="flex flex-wrap items-center gap-2 px-1">
          <span className="text-xs font-semibold text-slate-500">Active Filters:</span>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs font-medium text-indigo-300">
            <span>Search: <strong className="text-white font-semibold">{debouncedSearch}</strong></span>
            <button 
              onClick={handleClearSearch}
              className="ml-1 p-0.5 hover:bg-indigo-500/20 rounded-md transition-colors text-indigo-400 hover:text-indigo-300"
            >
              <XCircle className="w-3.5 h-3.5" />
            </button>
          </div>
          <Button
            variant="ghost"
            onClick={handleClearSearch}
            className="h-7 px-3 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg ml-auto sm:ml-0"
          >
            Clear Filters
          </Button>
        </div>
      )}

      <div className={loadingState === "loading" ? "opacity-60 pointer-events-none transition-opacity" : "transition-opacity"}>
        {users.length === 0 ? (
          <EmptyState hasSearch={!!debouncedSearch} onClear={handleClearSearch} />
        ) : (
          <>
            <div className="hidden md:block rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="p-4">Name</th>
                      <th className="p-4">Email</th>
                      <th className="p-4 text-center">Resumes</th>
                      <th className="p-4">Joined</th>
                      <th className="p-4">Last Updated</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {users.map((u) => (
                      <UserRow
                        key={u.id}
                        user={u}
                        onViewDetails={handleViewDetails}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="md:hidden space-y-3">
              {users.map((u) => (
                <UserCard
                  key={u.id}
                  user={u}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4">
                <p className="text-[11px] text-slate-500">
                  Showing {(page - 1) * PAGE_SIZE + 1}–
                  {Math.min(page * PAGE_SIZE, totalCount)} of {totalCount} users
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
                              ? "bg-indigo-500 hover:bg-indigo-600 text-white border-transparent" 
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

      {/* User Details Modal */}
      <UserDetailsModal
        user={selectedUser}
        open={modalOpen}
        onOpenChange={setModalOpen}
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
          <span>Users</span>
          {count > 0 && (
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-semibold">
              {count}
            </span>
          )}
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Manage registered ResumeForge users
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
            <Download className="w-3.5 h-3.5 mr-2 text-indigo-400" />
          )}
          Export CSV
        </Button>
      </div>
    </div>
  );
}

function UserRow({
  user,
  onViewDetails,
}: {
  user: AdminUser;
  onViewDetails: (u: AdminUser) => void;
}) {
  const displayName =
    user.name || user.username || user.email?.split("@")[0] || "User";
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const createdAt = user.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

  const updatedAt = user.updated_at
    ? new Date(user.updated_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

  return (
    <tr className="hover:bg-slate-800/40 transition-colors">
      {/* Name + Avatar */}
      <td className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center text-[10px] font-bold shrink-0 overflow-hidden">
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{initials}</span>
            )}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-white text-xs truncate max-w-[140px]">
              {displayName}
            </p>
            {user.is_admin && (
              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-400">
                <ShieldCheck className="w-2.5 h-2.5" />
                Admin
              </span>
            )}
          </div>
        </div>
      </td>

      {/* Email */}
      <td className="p-4 text-slate-300 font-mono text-[11px] truncate max-w-[180px]">
        {user.email || "—"}
      </td>

      {/* Resume Count */}
      <td className="p-4 text-center">
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-300">
          <FileText className="w-3 h-3 text-slate-500" />
          {user.resume_count}
        </span>
      </td>

      {/* Joined */}
      <td className="p-4 text-slate-400 text-[11px]">{createdAt}</td>

      {/* Last Updated */}
      <td className="p-4 text-slate-400 text-[11px]">{updatedAt}</td>

      {/* Status */}
      <td className="p-4">
        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
          Active
        </span>
      </td>

      {/* Actions */}
      <td className="p-4 text-right">
        <DropdownMenu>
          <DropdownMenuTrigger
            className="h-7 w-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="User actions"
          >
            <MoreVertical className="w-4 h-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="bg-slate-950 border-slate-800 text-slate-200 min-w-[150px]"
          >
            <DropdownMenuItem
              onClick={() => onViewDetails(user)}
              className="text-xs gap-2 cursor-pointer focus:bg-slate-800 focus:text-white"
            >
              <Eye className="w-3.5 h-3.5" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onViewDetails(user)}
              className="text-xs gap-2 cursor-pointer focus:bg-slate-800 focus:text-white"
            >
              <FileText className="w-3.5 h-3.5" />
              View Resumes
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
}

function UserCard({
  user,
  onViewDetails,
}: {
  user: AdminUser;
  onViewDetails: (u: AdminUser) => void;
}) {
  const displayName =
    user.name || user.username || user.email?.split("@")[0] || "User";
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const createdAt = user.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : "—";

  return (
    <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 space-y-3 shadow-lg">
      {/* Top row: avatar + name + actions */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden">
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{initials}</span>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-white truncate">
              {displayName}
            </p>
            <p className="text-[11px] text-slate-400 font-mono truncate">
              {user.email}
            </p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
            aria-label="User actions"
          >
            <MoreVertical className="w-4 h-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="bg-slate-950 border-slate-800 text-slate-200 min-w-[150px]"
          >
            <DropdownMenuItem
              onClick={() => onViewDetails(user)}
              className="text-xs gap-2 cursor-pointer focus:bg-slate-800 focus:text-white"
            >
              <Eye className="w-3.5 h-3.5" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onViewDetails(user)}
              className="text-xs gap-2 cursor-pointer focus:bg-slate-800 focus:text-white"
            >
              <FileText className="w-3.5 h-3.5" />
              View Resumes
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-3 gap-2 text-[11px]">
        <div className="space-y-0.5">
          <p className="text-slate-500 font-semibold">Resumes</p>
          <p className="text-white font-bold">{user.resume_count}</p>
        </div>
        <div className="space-y-0.5">
          <p className="text-slate-500 font-semibold">Joined</p>
          <p className="text-white font-bold">{createdAt}</p>
        </div>
        <div className="space-y-0.5">
          <p className="text-slate-500 font-semibold">Status</p>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 inline-block">
            Active
          </span>
        </div>
      </div>

      {/* View Details button */}
      <button
        type="button"
        onClick={() => onViewDetails(user)}
        className="w-full h-9 flex items-center justify-center gap-2 text-xs font-semibold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 rounded-xl hover:bg-indigo-500/20 transition-colors"
      >
        <User className="w-3.5 h-3.5" />
        View Details
      </button>
    </div>
  );
}

function EmptyState({
  hasSearch,
  onClear,
}: {
  hasSearch: boolean;
  onClear: () => void;
}) {
  return (
    <div className="rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl p-12 text-center space-y-4">
      <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto">
        <Users className="w-6 h-6 text-indigo-400" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-bold text-white">
          {hasSearch ? "No users match your search." : "No users found"}
        </p>
        <p className="text-xs text-slate-400">
          {hasSearch
            ? "Try adjusting your search terms."
            : "User profiles will appear here once people sign up."}
        </p>
      </div>
      {hasSearch && (
        <Button
          onClick={onClear}
          variant="outline"
          className="h-9 px-4 text-xs bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-200 font-semibold rounded-xl"
        >
          <XCircle className="w-3.5 h-3.5 mr-1.5" />
          Clear Search
        </Button>
      )}
    </div>
  );
}
