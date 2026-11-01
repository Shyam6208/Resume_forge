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
    router.replace(newUrl, { scroll: false });
  }, [pathname, searchParams, router]);

  // Sync state from URL during render
  const [prevParams, setPrevParams] = useState(searchParams.toString());
  if (searchParams.toString() !== prevParams) {
    setPrevParams(searchParams.toString());
    const urlPage = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const urlSearch = searchParams.get("search") || "";
    setPage(urlPage);
    setSearch(urlSearch);
    setDebouncedSearch(urlSearch);
  }

  // Handle Search Input Debounce (300ms)
  const handleSearchChange = (val: string) => {
    setSearch(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      setDebouncedSearch(val);
      updateUrl(1, val);
    }, 300);
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

  // ── Data Fetching ────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setLoadingState("loading");
    setErrorMessage("");

    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
      });
      if (debouncedSearch.trim()) {
        params.set("search", debouncedSearch.trim());
      }

      const res = await fetch(`/api/admin/users?${params.toString()}`);

      if (res.status === 401 || res.status === 403) {
        throw new Error("Unauthorized");
      }

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to load users");
      }

      const data: UsersApiResponse = await res.json();
      setUsers(data.users);
      setTotalCount(data.totalCount);
      setLoadingState("loaded");
    } catch (err: unknown) {
      console.error("Fetch users error:", err);
      const msg = err instanceof Error ? err.message : "Unable to load users.";
      setErrorMessage(msg);
      setLoadingState("error");
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // ── Modal Handlers ───────────────────────────────────────────
  const handleViewDetails = (user: AdminUser) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  // ── Export CSV Handler ───────────────────────────────────────
  const handleExportCSV = async () => {
    setIsExporting(true);
    const toastId = toast.loading("Preparing CSV export...");

    try {
      const params = new URLSearchParams({
        page: "1",
        pageSize: "1000",
      });
      if (debouncedSearch.trim()) {
        params.set("search", debouncedSearch.trim());
      }

      const res = await fetch(`/api/admin/users?${params.toString()}`);
      if (!res.ok) throw new Error("Export failed");

      const data: UsersApiResponse = await res.json();

      const headers = ["ID", "Name", "Email", "Username", "Role", "Resumes", "Created At", "Updated At"];
      const csvRows = [headers.join(",")];

      for (const u of data.users) {
        const row = [
          `"${u.id}"`,
          `"${(u.name || "").replace(/"/g, '""')}"`,
          `"${u.email}"`,
          `"${u.username || ""}"`,
          u.is_admin ? "Admin" : "User",
          u.resume_count,
          `"${u.created_at}"`,
          `"${u.updated_at}"`,
        ];
        csvRows.push(row.join(","));
      }

      const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `resumeforge_users_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Users exported successfully!", { id: toastId });
    } catch {
      toast.error("Failed to export users CSV.", { id: toastId });
    } finally {
      setIsExporting(false);
    }
  };

  // ── Render States ────────────────────────────────────────────

  if (loadingState === "loading" && users.length === 0) {
    return <UsersSkeleton />;
  }

  if (loadingState === "error" && users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-[calc(100vh-100px)]">
        <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center mb-6 border border-rose-500/20">
          <AlertCircle className="w-8 h-8 text-rose-400" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Unable to load users.</h2>
        <p className="text-muted-foreground max-w-md mb-8 whitespace-pre-wrap">{errorMessage}</p>
        <button
          onClick={fetchUsers}
          className="px-6 py-2.5 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 text-sm font-bold rounded-xl shadow-lg shadow-cyan-500/20 transition-all active:scale-[0.98]"
        >
          Try Again
        </button>
      </div>
    );
  }

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("ellipsis");
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (page < totalPages - 2) pages.push("ellipsis");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <PageHeader
        count={totalCount}
        onExport={handleExportCSV}
        isExporting={isExporting}
      />

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-muted-foreground" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by name, email, or username..."
            className="w-full h-11 pl-10 pr-10 bg-card/85 border border-white/[0.08] rounded-xl text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/40 transition-all"
          />
          {search && (
            <button
              onClick={handleClearSearch}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {debouncedSearch && (
        <div className="flex flex-wrap items-center gap-2 px-1">
          <span className="text-xs font-semibold text-muted-foreground">Active Filters:</span>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs font-medium text-cyan-300">
            <span>Search: <strong className="text-foreground font-semibold">{debouncedSearch}</strong></span>
            <button 
              onClick={handleClearSearch}
              className="ml-1 p-0.5 hover:bg-cyan-500/20 rounded-md transition-colors text-cyan-400 hover:text-cyan-300"
            >
              <XCircle className="w-3.5 h-3.5" />
            </button>
          </div>
          <Button
            variant="ghost"
            onClick={handleClearSearch}
            className="h-7 px-3 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-white/[0.06] rounded-xl ml-auto sm:ml-0"
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
            <div className="hidden md:block rounded-3xl bg-card/85 backdrop-blur-xl border border-white/[0.08] shadow-xl overflow-hidden">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-xs text-muted-foreground">
                  <thead className="bg-background/80 border-b border-white/[0.08] text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
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
                  <tbody className="divide-y divide-white/[0.06]">
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
                <p className="text-[11px] text-muted-foreground">
                  Showing {(page - 1) * PAGE_SIZE + 1}–
                  {Math.min(page * PAGE_SIZE, totalCount)} of {totalCount} users
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    disabled={page === 1}
                    onClick={() => handlePageChange(page - 1)}
                    className="w-9 h-9 p-0 bg-card border-white/[0.08] hover:bg-white/[0.06] text-foreground disabled:opacity-50 disabled:pointer-events-none rounded-xl"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  
                  <div className="hidden sm:flex items-center gap-1">
                    {getPageNumbers().map((p, i) => 
                      p === "ellipsis" ? (
                        <span key={`ell-${i}`} className="w-9 text-center text-muted-foreground text-sm">
                          ...
                        </span>
                      ) : (
                        <Button
                          key={p}
                          variant={page === p ? "default" : "outline"}
                          onClick={() => handlePageChange(p as number)}
                          className={`w-9 h-9 p-0 font-bold rounded-xl text-sm ${
                            page === p 
                              ? "bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 border-transparent shadow-sm" 
                              : "bg-card border-white/[0.08] text-muted-foreground hover:text-foreground hover:bg-white/[0.06]"
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
                    className="w-9 h-9 p-0 bg-card border-white/[0.08] hover:bg-white/[0.06] text-foreground disabled:opacity-50 disabled:pointer-events-none rounded-xl"
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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight flex items-center gap-2">
          <span>Users</span>
          {count > 0 && (
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold">
              {count}
            </span>
          )}
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Manage registered ResumeForge accounts and permissions
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          onClick={onExport}
          disabled={isExporting || count === 0}
          className="h-10 px-4 text-xs font-semibold bg-card border-white/[0.08] hover:bg-white/[0.06] text-foreground rounded-xl"
        >
          {isExporting ? (
            <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin text-cyan-400" />
          ) : (
            <Download className="w-3.5 h-3.5 mr-2 text-cyan-400" />
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
    <tr className="hover:bg-white/[0.02] transition-colors">
      {/* Name + Avatar */}
      <td className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30 text-cyan-300 flex items-center justify-center text-[10px] font-bold shrink-0 overflow-hidden">
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
            <p className="font-bold text-foreground text-xs truncate max-w-[140px]">
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
      <td className="p-4 text-foreground font-mono text-[11px] truncate max-w-[180px]">
        {user.email || "—"}
      </td>

      {/* Resume Count */}
      <td className="p-4 text-center">
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-foreground">
          <FileText className="w-3 h-3 text-cyan-400" />
          {user.resume_count}
        </span>
      </td>

      {/* Joined */}
      <td className="p-4 text-muted-foreground text-[11px]">{createdAt}</td>

      {/* Last Updated */}
      <td className="p-4 text-muted-foreground text-[11px]">{updatedAt}</td>

      {/* Status */}
      <td className="p-4">
        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
          Active
        </span>
      </td>

      {/* Actions */}
      <td className="p-4 text-right">
        <DropdownMenu>
          <DropdownMenuTrigger
            className="h-8 w-8 flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-colors"
            aria-label="User actions"
          >
            <MoreVertical className="w-4 h-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="bg-card/95 backdrop-blur-xl border-white/[0.1] text-foreground min-w-[150px] shadow-2xl"
          >
            <DropdownMenuItem
              onClick={() => onViewDetails(user)}
              className="text-xs gap-2 cursor-pointer focus:bg-white/[0.06] focus:text-foreground"
            >
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onViewDetails(user)}
              className="text-xs gap-2 cursor-pointer focus:bg-white/[0.06] focus:text-foreground"
            >
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
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
    <div className="rounded-2xl bg-card/85 backdrop-blur-xl border border-white/[0.08] p-4 space-y-3 shadow-lg">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30 text-cyan-300 flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden">
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
            <p className="text-sm font-bold text-foreground truncate">
              {displayName}
            </p>
            <p className="text-[11px] text-muted-foreground font-mono truncate">
              {user.email}
            </p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            className="h-8 w-8 flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-colors shrink-0"
            aria-label="User actions"
          >
            <MoreVertical className="w-4 h-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="bg-card/95 backdrop-blur-xl border-white/[0.1] text-foreground min-w-[150px] shadow-2xl"
          >
            <DropdownMenuItem
              onClick={() => onViewDetails(user)}
              className="text-xs gap-2 cursor-pointer focus:bg-white/[0.06] focus:text-foreground"
            >
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onViewDetails(user)}
              className="text-xs gap-2 cursor-pointer focus:bg-white/[0.06] focus:text-foreground"
            >
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              View Resumes
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid grid-cols-3 gap-2 text-[11px]">
        <div className="space-y-0.5">
          <p className="text-muted-foreground font-semibold">Resumes</p>
          <p className="text-foreground font-bold">{user.resume_count}</p>
        </div>
        <div className="space-y-0.5">
          <p className="text-muted-foreground font-semibold">Joined</p>
          <p className="text-foreground font-bold">{createdAt}</p>
        </div>
        <div className="space-y-0.5">
          <p className="text-muted-foreground font-semibold">Status</p>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 inline-block">
            Active
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onViewDetails(user)}
        className="w-full h-10 flex items-center justify-center gap-2 text-xs font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 rounded-xl hover:bg-cyan-500/20 transition-colors"
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
    <div className="rounded-3xl bg-card/85 backdrop-blur-xl border border-white/[0.08] shadow-xl p-12 text-center space-y-4">
      <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto">
        <Users className="w-6 h-6 text-cyan-400" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-bold text-foreground">
          {hasSearch ? "No users match your search." : "No users found"}
        </p>
        <p className="text-xs text-muted-foreground">
          {hasSearch
            ? "Try adjusting your search terms."
            : "User profiles will appear here once people sign up."}
        </p>
      </div>
      {hasSearch && (
        <Button
          onClick={onClear}
          variant="outline"
          className="h-10 px-4 text-xs bg-card border-white/[0.08] hover:bg-white/[0.06] text-foreground font-semibold rounded-xl"
        >
          <XCircle className="w-3.5 h-3.5 mr-1.5" />
          Clear Search
        </Button>
      )}
    </div>
  );
}
