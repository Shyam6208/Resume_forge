"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { AdminAnalyticsData } from "@/app/api/admin/analytics/route";
import { AdminAnalyticsSkeleton } from "./AdminAnalyticsSkeleton";
import { TEMPLATES } from "@/config/templates.config";
import { Users, FileText, Download, FileCode2, RefreshCw, AlertTriangle, Clock, TrendingUp, Shield, BarChart3, UserPlus, Eye, EyeOff, Activity, AlertCircle, Database, UserMinus, FileX } from "lucide-react";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const DATE_RANGES = [
  { label: "7 Days", value: 7 },
  { label: "30 Days", value: 30 },
  { label: "90 Days", value: 90 },
];

export function AdminAnalyticsClient() {
  const [data, setData] = useState<AdminAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [days, setDays] = useState<number>(30);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchAnalytics = useCallback(async (daysToFetch: number, showRefresh: boolean = false) => {
    if (showRefresh) setIsRefreshing(true);
    else setIsLoading(true);
    
    setError(null);
    
    try {
      const res = await fetch(`/api/admin/analytics?days=${daysToFetch}`);
      if (res.status === 401 || res.status === 403) {
        throw new Error("Unauthorized");
      }
      if (!res.ok) {
        let errStr = "Failed to load analytics";
        try {
          const errJson = await res.json();
          errStr = errJson.details || errJson.error || errStr;
          console.error("Analytics Error Data:", errJson);
        } catch (e) {
          // ignore
        }
        throw new Error(errStr);
      }
      
      const json: AdminAnalyticsData = await res.json();
      setData(json);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Unable to load analytics.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics(days, false);
  }, [days, fetchAnalytics]);

  const handleRefresh = () => {
    if (isLoading || isRefreshing) return;
    fetchAnalytics(days, true);
  };

  const templateStats = useMemo(() => {
    if (!data) return { mostUsed: null, leastUsed: null, unused: [] };
    
    const sorted = [...data.templateUsage].sort((a, b) => b.count - a.count);
    const mostUsed = sorted.length > 0 ? sorted[0] : null;
    const leastUsed = sorted.length > 0 ? sorted[sorted.length - 1] : null;
    
    const usedIds = new Set(data.templateUsage.map(t => t.templateId));
    const unused = TEMPLATES.filter(t => !usedIds.has(t.id));
    
    return { mostUsed, leastUsed, unused };
  }, [data]);

  if (isLoading) {
    return <AdminAnalyticsSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-[calc(100vh-100px)]">
        <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6 border border-red-500/20">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Unable to load analytics.</h2>
        <p className="text-slate-400 max-w-md mb-8 whitespace-pre-wrap">
          {error}
        </p>
        <button
          onClick={() => fetchAnalytics(days, false)}
          className="mt-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Common chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#0f172a", // slate-900
        titleColor: "#f8fafc",
        bodyColor: "#cbd5e1",
        borderColor: "#1e293b",
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: {
          color: "#1e293b", // slate-800
        },
        ticks: {
          color: "#64748b", // slate-500
          maxTicksLimit: 7, // Prevent overcrowding
        }
      },
      y: {
        grid: {
          color: "#1e293b",
        },
        ticks: {
          color: "#64748b",
          precision: 0, // only show whole numbers for counts
        },
        beginAtZero: true
      }
    },
    interaction: {
      intersect: false,
      mode: "index" as const,
    },
  };

  const userGrowthData = {
    labels: data.userGrowth.map(d => {
      const date = new Date(d.date);
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: "Users Joined",
        data: data.userGrowth.map(d => d.count),
        borderColor: "#818cf8", // indigo-400
        backgroundColor: "rgba(129, 140, 248, 0.1)",
        borderWidth: 2,
        pointBackgroundColor: "#818cf8",
        pointBorderColor: "#1e293b",
        pointBorderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
        fill: true,
        tension: 0.4
      }
    ]
  };

  const resumeTrendData = {
    labels: data.resumeCreation.map(d => {
      const date = new Date(d.date);
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: "Resumes Created",
        data: data.resumeCreation.map(d => d.count),
        backgroundColor: "#c084fc", // purple-400
        borderRadius: 4,
        barPercentage: 0.6,
      }
    ]
  };

  const publicPercentage = data.totalResumes > 0 ? Math.round((data.publicResumes / data.totalResumes) * 100) : 0;
  const privatePercentage = data.totalResumes > 0 ? 100 - publicPercentage : 0;

  const renderPOPTrend = (current: number, prev: number | null) => {
    if (prev === null) return null;
    if (prev === 0 && current === 0) {
      return <span className="text-xs text-slate-500 bg-slate-800/50 px-2 py-0.5 rounded">No activity</span>;
    }
    if (prev === 0 && current > 0) {
      return <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">No previous data</span>;
    }
    const diff = current - prev;
    const percentage = ((diff / prev) * 100).toFixed(0);
    const isPositive = diff > 0;
    const isNeutral = diff === 0;

    if (isNeutral) {
      return <span className="text-xs text-slate-400 bg-slate-800/50 px-2 py-0.5 rounded">0% vs prev period</span>;
    }

    return (
      <span className={`text-xs px-2 py-0.5 rounded ${isPositive ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'}`}>
        {isPositive ? '+' : ''}{percentage}% vs prev period
      </span>
    );
  };

  const formattedLastUpdated = new Date(data.lastUpdated).toLocaleTimeString(undefined, { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true
  });
  
  const lastUpdatedDate = new Date(data.lastUpdated).toLocaleDateString();
  const isToday = lastUpdatedDate === new Date().toLocaleDateString();
  const dateStr = isToday ? "Today at" : `${lastUpdatedDate} at`;

  return (
    <div className="space-y-8">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Admin Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time analytics and system metrics.
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="flex flex-wrap items-center gap-3 bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-1">
              {DATE_RANGES.map(range => (
                <button
                  key={range.value}
                  onClick={() => setDays(range.value)}
                  className={`px-4 py-2 text-xs font-semibold rounded-xl transition-colors ${
                    days === range.value
                      ? "bg-slate-800 text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
            <div className="w-px h-6 bg-slate-800 hidden sm:block mx-1"></div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing || isLoading}
              className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all disabled:opacity-50"
              title="Refresh Analytics"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-indigo-400" : ""}`} />
            </button>
          </div>
          <div className="text-xs text-slate-500 mr-2">
            Last updated: {dateStr} {formattedLastUpdated}
          </div>
        </div>
      </div>

      {/* ROW 1: 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { title: "Total Users", value: data.totalUsers, label: "All Time", icon: Users, color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20" },
          { title: "Total Resumes", value: data.totalResumes, label: "All Time", icon: FileText, color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
          { title: "Total Downloads", value: data.totalDownloads, label: "All Time", icon: Download, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
          { title: "Templates Used", value: `${data.templatesUsed} / ${TEMPLATES.length}`, label: "All Time", icon: FileCode2, color: "text-pink-400 bg-pink-500/10 border-pink-500/20" }
        ].map((card, i) => (
          <div key={i} className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3 flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-slate-400">{card.title}</p>
              </div>
              <p className="text-3xl font-bold text-white">{card.value}</p>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Clock className="w-3.5 h-3.5" />
                <span>{card.label}</span>
              </div>
            </div>
            <div className={`p-4 rounded-xl border ${card.color}`}>
              <card.icon className="w-7 h-7" />
            </div>
          </div>
        ))}
      </div>

      {/* ROW 2: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-white">User Growth</h2>
              <p className="text-sm text-slate-400">New signups over last {days} days</p>
            </div>
          </div>
          <div className="h-64">
            <Line data={userGrowthData} options={chartOptions} />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-white">Resumes Created</h2>
              <p className="text-sm text-slate-400">New resumes over last {days} days</p>
            </div>
          </div>
          <div className="h-64">
            <Bar data={resumeTrendData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* ROW 3: User Analytics & Resume Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Analytics */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <h2 className="text-lg font-bold text-white mb-4">User Analytics</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                  <UserPlus className="w-5 h-5 text-indigo-400" />
                  <span className="text-slate-300 font-medium">New Users ({days} days)</span>
                </div>
                <div className="ml-8">{renderPOPTrend(data.newUsers, data.prevNewUsers)}</div>
              </div>
              <span className="text-white font-bold">{data.newUsers}</span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-slate-400" />
                <span className="text-slate-300 font-medium">Registered Users</span>
              </div>
              <span className="text-white font-bold">{data.registeredUsers}</span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-slate-400" />
                <span className="text-slate-300 font-medium">Guest Users</span>
              </div>
              <span className="text-white font-bold">{data.guestUsers}</span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-amber-400" />
                <span className="text-slate-300 font-medium">Admin Users</span>
              </div>
              <span className="text-white font-bold">{data.adminUsers}</span>
            </div>
          </div>
        </div>

        {/* Resume Analytics */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <h2 className="text-lg font-bold text-white mb-4">Resume Analytics</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-purple-400" />
                  <span className="text-slate-300 font-medium">New Resumes ({days} days)</span>
                </div>
                <div className="ml-8">{renderPOPTrend(data.newResumes, data.prevNewResumes)}</div>
              </div>
              <span className="text-white font-bold">{data.newResumes}</span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-5 h-5 text-emerald-400" />
                <span className="text-slate-300 font-medium">Avg Resumes per User</span>
              </div>
              <span className="text-white font-bold">{data.avgResumesPerUser.toFixed(1)}</span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50">
              <div className="flex items-center gap-3">
                <Download className="w-5 h-5 text-blue-400" />
                <span className="text-slate-300 font-medium">Resumes With Downloads</span>
              </div>
              <span className="text-white font-bold">{data.resumesWithDownloads}</span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-sky-400" />
                <span className="text-slate-300 font-medium">Avg Downloads per Resume</span>
              </div>
              <span className="text-white font-bold">{data.avgDownloadsPerResume.toFixed(1)}</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-4 text-center">
            * Download analytics represent cumulative totals. Historical download trend is unavailable.
          </p>
        </div>
      </div>
      
      {/* ROW 4: Data Quality Insights & Template Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Data Quality */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Operational Insights</h2>
            <Database className="w-5 h-5 text-slate-400" />
          </div>
          <p className="text-sm text-slate-400 mb-6">Database hygiene and data quality metrics.</p>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50">
              <div className="flex items-center gap-3">
                <UserMinus className="w-5 h-5 text-slate-400" />
                <span className="text-slate-300 font-medium">Users Without Resumes</span>
              </div>
              <span className="text-white font-bold">{data.usersWithoutResumes}</span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50">
              <div className="flex items-center gap-3">
                <FileX className="w-5 h-5 text-slate-400" />
                <span className="text-slate-300 font-medium">Resumes Without Downloads</span>
              </div>
              <span className="text-white font-bold">{data.resumesWithoutDownloads}</span>
            </div>
            
            <div className={`flex items-center justify-between p-4 rounded-xl ${data.unknownTemplateUsage > 0 ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-slate-800/50'}`}>
              <div className="flex items-center gap-3">
                <AlertCircle className={`w-5 h-5 ${data.unknownTemplateUsage > 0 ? 'text-amber-400' : 'text-slate-400'}`} />
                <span className={data.unknownTemplateUsage > 0 ? "text-amber-200 font-medium" : "text-slate-300 font-medium"}>
                  Legacy/Unknown Templates
                </span>
              </div>
              <span className={`font-bold ${data.unknownTemplateUsage > 0 ? 'text-amber-400' : 'text-white'}`}>
                {data.unknownTemplateUsage}
              </span>
            </div>
          </div>
        </div>

        {/* Template Analytics */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <h2 className="text-lg font-bold text-white mb-4">Template Analytics</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50">
              <div className="flex items-center gap-3">
                <FileCode2 className="w-5 h-5 text-pink-400" />
                <span className="text-slate-300 font-medium">Most Used Template</span>
              </div>
              <span className="text-white font-bold">
                {templateStats.mostUsed ? `${TEMPLATES.find(t => t.id === templateStats.mostUsed?.templateId)?.name || templateStats.mostUsed.templateId} (${templateStats.mostUsed.percentage.toFixed(1)}%)` : 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50">
              <div className="flex items-center gap-3">
                <FileCode2 className="w-5 h-5 text-slate-400" />
                <span className="text-slate-300 font-medium">Least Used Template</span>
              </div>
              <span className="text-white font-bold">
                {templateStats.leastUsed ? `${TEMPLATES.find(t => t.id === templateStats.leastUsed?.templateId)?.name || templateStats.leastUsed.templateId} (${templateStats.leastUsed.percentage.toFixed(1)}%)` : 'N/A'}
              </span>
            </div>
            {templateStats.unused.length > 0 && (
              <div className="p-4 rounded-xl bg-slate-800/50 mt-4">
                <span className="text-slate-400 text-sm font-medium block mb-2">Unused Templates:</span>
                <div className="flex flex-wrap gap-2">
                  {templateStats.unused.map(t => (
                    <span key={t.id} className="text-xs px-2 py-1 bg-slate-900 rounded-md text-slate-300 border border-slate-700">
                      {t.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ROW 5: Visibility & Users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Public vs Private Resumes */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <h2 className="text-lg font-bold text-white mb-6">Resume Visibility</h2>
          {data.totalResumes > 0 ? (
            <div className="space-y-6 mt-8">
              {/* Flex Stacked Bar */}
              <div className="h-6 w-full flex rounded-full overflow-hidden border border-slate-700">
                <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${publicPercentage}%` }}></div>
                <div className="h-full bg-slate-700 transition-all duration-1000" style={{ width: `${privatePercentage}%` }}></div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 flex flex-col items-center">
                  <Eye className="w-6 h-6 text-emerald-400 mb-2" />
                  <span className="text-2xl font-bold text-white">{data.publicResumes}</span>
                  <span className="text-sm text-slate-400">Public ({publicPercentage}%)</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 flex flex-col items-center">
                  <EyeOff className="w-6 h-6 text-slate-400 mb-2" />
                  <span className="text-2xl font-bold text-white">{data.privateResumes}</span>
                  <span className="text-sm text-slate-400">Private ({privatePercentage}%)</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500">
              <EyeOff className="w-10 h-10 mb-3 opacity-50" />
              <p>No resumes created yet.</p>
            </div>
          )}
        </div>

        {/* Most Active Users */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-white">Users by Resume Count</h2>
              <p className="text-sm text-slate-400">Top 5 users with most resumes</p>
            </div>
          </div>

          <div className="flex-1">
            {data.usersByResumeCount.length > 0 ? (
              <div className="space-y-3">
                {data.usersByResumeCount.map((user, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-800/40 border border-slate-800/50">
                    <div>
                      <h4 className="font-semibold text-white">{user.name}</h4>
                      <p className="text-xs text-slate-400">{user.email}</p>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
                      <span className="text-sm font-bold text-indigo-400">{user.count}</span>
                      <span className="text-xs text-slate-500">resumes</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center text-sm text-slate-500 border border-dashed border-slate-800 rounded-2xl">
                No users found.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ROW 6: Top Downloaded Resumes */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-white">Top Downloaded Resumes</h2>
              <p className="text-sm text-slate-400">Most popular resumes all time</p>
            </div>
          </div>

          <div className="flex-1">
            {data.topDownloadedResumes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.topDownloadedResumes.map((resume, i) => (
                  <div key={i} className="flex flex-col p-4 rounded-2xl bg-slate-800/40 border border-slate-800/50 hover:bg-slate-800/60 transition-colors">
                    <div className="flex-1 min-w-0 pr-4 mb-3">
                      <h4 className="font-semibold text-white truncate text-base">{resume.title}</h4>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                        <Users className="w-3.5 h-3.5" />
                        <span className="truncate">{resume.ownerName}</span>
                      </div>
                    </div>
                    <div className="flex items-center self-start gap-2 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                      <Download className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-sm font-bold text-emerald-400">{resume.downloadCount}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center text-sm text-slate-500 border border-dashed border-slate-800 rounded-2xl">
                No downloads recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
