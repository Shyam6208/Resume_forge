"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Search,
  RefreshCw,
  XCircle,
  AlertCircle,
  Activity,
  UserPlus,
  FileText,
  Edit3,
  FileCode2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ActivityEvent {
  id: string;
  type: string;
  timestamp: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  resource?: {
    id: string;
    title: string;
  } | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  actionDetails?: any;
}

interface ActivityResponse {
  events: ActivityEvent[];
  totalCount: number;
  page: number;
  pageSize: number;
  days: number;
}

const PAGE_SIZE = 20;

const ACTIVITY_TYPES = [
  { value: "all", label: "All Activity" },
  { value: "user_registered", label: "User Registrations" },
  { value: "resume_created", label: "Resume Creations" },
  { value: "resume_updated", label: "Resume Updates" },
  { value: "template_created", label: "Template Created" },
  { value: "template_updated", label: "Template Updated" },
  { value: "template_deleted", label: "Template Deleted" },
  { value: "template_published", label: "Template Published" },
  { value: "template_unpublished", label: "Template Unpublished" },
  { value: "template_archived", label: "Template Archived" },
];

const DATE_RANGES = [
  { value: "7", label: "Last 7 Days" },
  { value: "30", label: "Last 30 Days" },
  { value: "90", label: "Last 90 Days" },
];

export function AdminActivityClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  
  const [page, setPage] = useState(Math.max(1, parseInt(searchParams.get("page") || "1", 10)));
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(searchParams.get("search") || "");
  const [typeFilter, setTypeFilter] = useState(searchParams.get("type") || "all");
  const [daysFilter, setDaysFilter] = useState(searchParams.get("days") || "30");
  
  const [loadingState, setLoadingState] = useState<"loading" | "loaded" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── URL Synchronization ──────────────────────────────────────
  const updateUrl = useCallback((
    newPage: number,
    newSearch: string,
    newType: string,
    newDays: string
  ) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (newPage > 1) params.set("page", String(newPage));
    else params.delete("page");
    
    if (newSearch) params.set("search", newSearch);
    else params.delete("search");

    if (newType !== "all") params.set("type", newType);
    else params.delete("type");

    if (newDays !== "30") params.set("days", newDays);
    else params.delete("days");

    const newUrl = `${pathname}${params.toString() ? '?' + params.toString() : ''}`;
    router.replace(newUrl, { scroll: false });
  }, [pathname, searchParams, router]);

  // Sync state from URL (handles Browser Back/Forward)
  useEffect(() => {
    const urlPage = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const urlSearch = searchParams.get("search") || "";
    const urlType = searchParams.get("type") || "all";
    const urlDays = searchParams.get("days") || "30";
    
    if (urlPage !== page) setPage(urlPage);
    if (urlSearch !== debouncedSearch) {
      setDebouncedSearch(urlSearch);
      setSearch(urlSearch);
    }
    if (urlType !== typeFilter) setTypeFilter(urlType);
    if (urlDays !== daysFilter) setDaysFilter(urlDays);
  }, [searchParams]);

  // Debounced Search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (search !== debouncedSearch) {
        setDebouncedSearch(search);
        setPage(1);
        updateUrl(1, search, typeFilter, daysFilter);
      }
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, debouncedSearch, typeFilter, daysFilter, updateUrl]);

  const fetchActivity = useCallback(async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    else setLoadingState("loading");
    setErrorMessage("");

    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
        days: daysFilter,
        type: typeFilter,
      });
      if (debouncedSearch) params.set("search", debouncedSearch);

      const res = await fetch(`/api/admin/activity?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch activity (${res.status})`);
      }

      const data: ActivityResponse = await res.json();
      setEvents(data.events);
      setTotalCount(data.totalCount);
      setLoadingState("loaded");
    } catch (err) {
      console.error(err);
      setErrorMessage(err instanceof Error ? err.message : "Unable to load activity.");
      setLoadingState("error");
    } finally {
      if (isRefresh) setIsRefreshing(false);
    }
  }, [page, daysFilter, typeFilter, debouncedSearch]);

  useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

  const handleFilterChange = (key: 'type' | 'days', value: string) => {
    let newType = typeFilter;
    let newDays = daysFilter;

    if (key === 'type') newType = value;
    if (key === 'days') newDays = value;

    setPage(1);
    
    if (key === 'type') setTypeFilter(value);
    if (key === 'days') setDaysFilter(value);

    updateUrl(1, debouncedSearch, newType, newDays);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    updateUrl(newPage, debouncedSearch, typeFilter, daysFilter);
  };

  const handleClearFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setTypeFilter("all");
    setDaysFilter("30");
    setPage(1);
    updateUrl(1, "", "all", "30");
  };

  const hasFilters = !!debouncedSearch || typeFilter !== "all" || daysFilter !== "30";

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

  // Render Helpers
  const getEventIcon = (type: string) => {
    if (type === "user_registered") return <UserPlus className="w-4 h-4 text-emerald-400" />;
    if (type === "resume_created") return <FileText className="w-4 h-4 text-indigo-400" />;
    if (type === "resume_updated") return <Edit3 className="w-4 h-4 text-amber-400" />;
    if (type.startsWith("template_")) return <FileCode2 className="w-4 h-4 text-purple-400" />;
    return <Activity className="w-4 h-4 text-slate-400" />;
  };

  const getEventLabel = (type: string) => {
    const option = ACTIVITY_TYPES.find(t => t.value === type);
    if (option) return option.label;
    // Format "some_event_name" -> "Some Event Name"
    return type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between pt-4">
        <p className="text-[11px] text-slate-500">
          Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, totalCount)} of {totalCount} events
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
    );
  };

  if (loadingState === "error") {
    return (
      <div className="space-y-6">
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6 text-red-400" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-white">Unable to load activity logs.</p>
            <p className="text-xs text-slate-400">{errorMessage}</p>
          </div>
          <Button onClick={() => fetchActivity(false)} className="h-9 px-4 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl">
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Audit & Activity</span>
            {totalCount > 0 && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-semibold">
                {totalCount} events
              </span>
            )}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Monitor secure, chronological system events within a bounded timeframe
          </p>
        </div>
        <Button
          onClick={() => fetchActivity(true)}
          disabled={isRefreshing}
          className="h-10 px-4 text-xs bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl border border-slate-700"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by user or resource..."
            className="w-full h-10 pl-10 pr-9 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
          {search && (
            <button
              onClick={() => { setSearch(""); setDebouncedSearch(""); setPage(1); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filters */}
        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          className="h-10 px-3 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        >
          {ACTIVITY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>

        <select
          value={daysFilter}
          onChange={(e) => { setDaysFilter(e.target.value); setPage(1); }}
          className="h-10 px-3 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        >
          {DATE_RANGES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
        </select>
      </div>

      {/* Main Content */}
      <div className={loadingState === "loading" && events.length === 0 ? "opacity-50 pointer-events-none" : ""}>
        {events.length === 0 && loadingState === "loaded" ? (
          <div className="rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto">
              <Activity className="w-6 h-6 text-indigo-400" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-white">No activity found</p>
              <p className="text-xs text-slate-400">There are no events matching your filters in the selected time range.</p>
            </div>
            {hasFilters && (
              <Button onClick={handleClearFilters} variant="outline" className="h-9 px-4 text-xs bg-slate-900 border-slate-800 text-slate-200 font-semibold rounded-xl">
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Desktop Table view */}
            <div className="hidden md:block rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="p-4 w-48">Action</th>
                    <th className="p-4 w-64">User</th>
                    <th className="p-4">Resource</th>
                    <th className="p-4 w-48 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {events.map(event => (
                    <tr key={event.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {getEventIcon(event.type)}
                          <span className="font-semibold text-slate-200">{getEventLabel(event.type)}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="min-w-0">
                          <p className="font-medium text-slate-200 truncate">{event.user?.name || "Unknown user"}</p>
                          <p className="text-[10px] text-slate-500 truncate">{event.user?.email || "Unknown email"}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        {event.resource ? (
                          <div className="flex items-center gap-2">
                            {event.type.startsWith("template") ? (
                              <FileCode2 className="w-3.5 h-3.5 text-slate-500" />
                            ) : (
                              <FileText className="w-3.5 h-3.5 text-slate-500" />
                            )}
                            <span className="font-medium text-slate-300 truncate">{event.resource.title}</span>
                          </div>
                        ) : (
                          <span className="text-slate-600 italic">No resource linked</span>
                        )}
                      </td>
                      <td className="p-4 text-right text-[11px] text-slate-400">
                        {new Date(event.timestamp).toLocaleString(undefined, { 
                          month: 'short', day: 'numeric', year: 'numeric', 
                          hour: 'numeric', minute: '2-digit' 
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {events.map(event => (
                <div key={event.id} className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getEventIcon(event.type)}
                      <span className="text-xs font-bold text-slate-200">{getEventLabel(event.type)}</span>
                    </div>
                    <span className="text-[10px] text-slate-500">
                      {new Date(event.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                    </span>
                  </div>
                  
                  <div className="bg-slate-950 rounded-xl p-3 space-y-2 text-xs">
                    <div>
                      <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-0.5">User</p>
                      <p className="text-slate-300 truncate">{event.user?.name || "Unknown user"} <span className="text-slate-500">({event.user?.email})</span></p>
                    </div>
                    {event.resource && (
                      <div>
                        <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-0.5">Resource</p>
                        <p className="text-slate-300 font-medium truncate">{event.resource.title}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {renderPagination()}
          </div>
        )}
      </div>
    </div>
  );
}
