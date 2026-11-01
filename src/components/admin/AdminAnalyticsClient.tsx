"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { AdminAnalyticsData } from "@/app/api/admin/analytics/route";
import { AdminAnalyticsSkeleton } from "./AdminAnalyticsSkeleton";
import { TEMPLATES } from "@/config/templates.config";
import { motion, useMotionValue, useSpring, useInView } from "framer-motion";
import {
  Users, FileText, Download, FileCode2, RefreshCw, AlertTriangle,
  Clock, TrendingUp, Shield, BarChart3, UserPlus, Eye, EyeOff,
  Activity, AlertCircle, Database, UserMinus, FileX, Zap, ArrowUpRight, ArrowDownRight
} from "lucide-react";

import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement, BarElement,
  Title, Tooltip, Legend, Filler
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement,
  Title, Tooltip, Legend, Filler
);

const DATE_RANGES = [
  { label: "7 Days", value: 7 },
  { label: "30 Days", value: 30 },
  { label: "90 Days", value: 90 },
];

// ═══════════════════════════════════════════════════════════════
// Animated Counter Component
// ═══════════════════════════════════════════════════════════════
function AnimatedCounter({ value, duration = 1.5 }: { value: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    stiffness: 80,
    damping: 20,
    duration: duration * 1000,
  });
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [isInView, value, motionValue]);

  useEffect(() => {
    const unsubscribe = springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = Math.round(latest).toLocaleString();
      }
    });
    return unsubscribe;
  }, [springValue]);

  return <span ref={ref}>0</span>;
}

// ═══════════════════════════════════════════════════════════════
// Progress Ring SVG Component
// ═══════════════════════════════════════════════════════════════
function ProgressRing({ percentage, size = 80, strokeWidth = 6, color = "#06b6d4" }: {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}) {
  const ref = useRef<SVGCircleElement>(null);
  const isInView = useInView(ref as React.RefObject<Element>, { once: true });
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="rgba(255, 255, 255, 0.08)"
        strokeWidth={strokeWidth}
        fill="none"
      />
      <circle
        ref={ref}
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={isInView ? offset : circumference}
        style={{
          transition: "stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)",
          filter: `drop-shadow(0 0 6px ${color}40)`,
        }}
      />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════
// Staggered Card Wrapper
// ═══════════════════════════════════════════════════════════════
const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.08,
      type: "spring" as const,
      stiffness: 200,
      damping: 20,
    },
  }),
};

function StaggerCard({ index, children, className = "" }: {
  index: number;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      custom={index}
      initial="hidden"
      animate="visible"
      variants={cardVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════
export function AdminAnalyticsClient() {
  const [data, setData] = useState<AdminAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState<number>(30);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    let isCancelled = false;
    async function loadAnalytics() {
      try {
        const res = await fetch(`/api/admin/analytics?days=${days}`);
        if (res.status === 401 || res.status === 403) throw new Error("Unauthorized");
        if (!res.ok) {
          let errStr = "Failed to load analytics";
          try {
            const errJson = await res.json();
            errStr = errJson.details || errJson.error || errStr;
          } catch (e) { /* ignore */ }
          throw new Error(errStr);
        }
        const json: AdminAnalyticsData = await res.json();
        if (!isCancelled) {
          setData(json);
          setError(null);
        }
      } catch (err: any) {
        if (!isCancelled) {
          console.error(err);
          setError(err?.message || "Unable to load analytics.");
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    }

    loadAnalytics();
    return () => {
      isCancelled = true;
    };
  }, [days, refreshTrigger]);

  const handleRefresh = () => {
    if (isLoading || isRefreshing) return;
    setIsRefreshing(true);
    setRefreshTrigger((prev) => prev + 1);
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

  if (isLoading) return <AdminAnalyticsSkeleton />;

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-[calc(100vh-100px)]">
        <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center mb-6 border border-rose-500/20">
          <AlertTriangle className="w-8 h-8 text-rose-400" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Unable to load analytics.</h2>
        <p className="text-muted-foreground max-w-md mb-8 whitespace-pre-wrap">{error}</p>
        <button
          onClick={handleRefresh}
          className="mt-4 px-6 py-2.5 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 text-sm font-bold rounded-xl shadow-lg shadow-cyan-500/20 transition-all active:scale-[0.98]"
        >
          Try Again
        </button>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // Chart Options
  // ═══════════════════════════════════════════════════════════════
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(11, 15, 23, 0.95)",
        titleColor: "#f8fafc",
        bodyColor: "#cbd5e1",
        borderColor: "rgba(6, 182, 212, 0.3)",
        borderWidth: 1,
        padding: 14,
        cornerRadius: 12,
        titleFont: { size: 13, weight: "bold" as const },
        bodyFont: { size: 12 },
        displayColors: false,
      },
    },
    scales: {
      x: {
        grid: { color: "rgba(255, 255, 255, 0.05)", drawBorder: false },
        ticks: { color: "#64748b", maxTicksLimit: 7, font: { size: 11 } },
        border: { display: false },
      },
      y: {
        grid: { color: "rgba(255, 255, 255, 0.05)", drawBorder: false },
        ticks: { color: "#64748b", precision: 0, font: { size: 11 } },
        beginAtZero: true,
        border: { display: false },
      },
    },
    interaction: { intersect: false, mode: "index" as const },
  };

  const userGrowthData = {
    labels: data.userGrowth.map(d => {
      const date = new Date(d.date);
      return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    }),
    datasets: [{
      label: "Users Joined",
      data: data.userGrowth.map(d => d.count),
      borderColor: "#06b6d4",
      backgroundColor: (ctx: any) => {
        const chart = ctx.chart;
        const { ctx: context, chartArea } = chart;
        if (!chartArea) return "rgba(6, 182, 212, 0.1)";
        const gradient = context.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
        gradient.addColorStop(0, "rgba(6, 182, 212, 0.25)");
        gradient.addColorStop(1, "rgba(6, 182, 212, 0.02)");
        return gradient;
      },
      borderWidth: 2.5,
      pointBackgroundColor: "#06b6d4",
      pointBorderColor: "#0b0f17",
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 7,
      pointHoverBackgroundColor: "#67e8f9",
      pointHoverBorderColor: "#ffffff",
      fill: true,
      tension: 0.4,
    }],
  };

  const resumeTrendData = {
    labels: data.resumeCreation.map(d => {
      const date = new Date(d.date);
      return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    }),
    datasets: [{
      label: "Resumes Created",
      data: data.resumeCreation.map(d => d.count),
      backgroundColor: (ctx: any) => {
        const chart = ctx.chart;
        const { ctx: context, chartArea } = chart;
        if (!chartArea) return "#10b981";
        const gradient = context.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
        gradient.addColorStop(0, "#10b981");
        gradient.addColorStop(1, "#059669");
        return gradient;
      },
      borderRadius: 8,
      barPercentage: 0.55,
      borderSkipped: false,
    }],
  };

  const publicPercentage = data.totalResumes > 0 ? Math.round((data.publicResumes / data.totalResumes) * 100) : 0;
  const privatePercentage = data.totalResumes > 0 ? 100 - publicPercentage : 0;

  const renderPOPTrend = (current: number, prev: number | null) => {
    if (prev === null) return null;
    if (prev === 0 && current === 0) {
      return <span className="text-xs text-muted-foreground bg-card px-2 py-0.5 rounded-md border border-white/[0.04]">No activity</span>;
    }
    if (prev === 0 && current > 0) {
      return (
        <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md flex items-center gap-1 font-semibold">
          <ArrowUpRight className="w-3 h-3" /> New
        </span>
      );
    }
    const diff = current - prev;
    const percentage = ((diff / prev) * 100).toFixed(0);
    const isPositive = diff > 0;
    const isNeutral = diff === 0;
    if (isNeutral) {
      return <span className="text-xs text-muted-foreground bg-card px-2 py-0.5 rounded-md border border-white/[0.04]">0% vs prev</span>;
    }
    return (
      <span className={`text-xs px-2 py-0.5 rounded-md flex items-center gap-1 font-semibold border ${isPositive ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : "text-rose-400 bg-rose-500/10 border-rose-500/20"}`}>
        {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
        {isPositive ? "+" : ""}{percentage}%
      </span>
    );
  };

  const formattedLastUpdated = new Date(data.lastUpdated).toLocaleTimeString(undefined, {
    hour: "numeric", minute: "2-digit", hour12: true,
  });
  const lastUpdatedDate = new Date(data.lastUpdated).toLocaleDateString();
  const isToday = lastUpdatedDate === new Date().toLocaleDateString();
  const dateStr = isToday ? "Today at" : `${lastUpdatedDate} at`;

  // ═══════════════════════════════════════════════════════════════
  // KPI Cards Config
  // ═══════════════════════════════════════════════════════════════
  const kpiCards = [
    {
      title: "Total Users",
      value: data.totalUsers,
      icon: Users,
      gradient: "from-cyan-500/10 to-emerald-500/10",
      borderColor: "border-cyan-500/20",
      iconBg: "bg-cyan-500/10",
      iconColor: "text-cyan-400",
      glowColor: "hover:shadow-cyan-500/10",
    },
    {
      title: "Total Resumes",
      value: data.totalResumes,
      icon: FileText,
      gradient: "from-emerald-500/10 to-teal-500/10",
      borderColor: "border-emerald-500/20",
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-400",
      glowColor: "hover:shadow-emerald-500/10",
    },
    {
      title: "Total Downloads",
      value: data.totalDownloads,
      icon: Download,
      gradient: "from-cyan-500/10 to-blue-500/10",
      borderColor: "border-cyan-500/20",
      iconBg: "bg-cyan-500/10",
      iconColor: "text-cyan-400",
      glowColor: "hover:shadow-cyan-500/10",
    },
    {
      title: "Templates Used",
      value: data.templatesUsed,
      isRatio: true,
      total: TEMPLATES.length,
      icon: FileCode2,
      gradient: "from-purple-500/10 to-pink-500/10",
      borderColor: "border-purple-500/20",
      iconBg: "bg-purple-500/10",
      iconColor: "text-purple-400",
      glowColor: "hover:shadow-purple-500/10",
    },
  ];

  return (
    <div className="space-y-8">
      {/* ═══════════════════════════════════════════════════════════════
          Header
          ═══════════════════════════════════════════════════════════════ */}
      <div className="relative">
        <div className="relative flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/[0.08] pb-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                Admin Overview
              </h1>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <div
                  className="w-2 h-2 rounded-full bg-emerald-400"
                  style={{ animation: "admin-live-blink 2s ease-in-out infinite" }}
                />
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Live</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Real-time analytics and platform performance metrics.
            </p>
          </div>

          <div className="flex flex-col items-end gap-2.5">
            {/* Date range & refresh controls */}
            <div className="flex flex-wrap items-center gap-1 bg-card/80 backdrop-blur-sm p-1 rounded-2xl border border-white/[0.08]">
              {DATE_RANGES.map(range => (
                <button
                  key={range.value}
                  onClick={() => setDays(range.value)}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 ${
                    days === range.value
                      ? "bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 shadow-md shadow-cyan-500/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/[0.06]"
                  }`}
                >
                  {range.label}
                </button>
              ))}
              <div className="w-px h-6 bg-white/[0.08] mx-1 hidden sm:block" />
              <button
                onClick={handleRefresh}
                disabled={isRefreshing || isLoading}
                className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-white/[0.06] rounded-xl transition-all disabled:opacity-50"
                title="Refresh Analytics"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-cyan-400" : ""}`} />
              </button>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mr-2">
              <Clock className="w-3 h-3" />
              <span suppressHydrationWarning>Last updated: {dateStr} {formattedLastUpdated}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          ROW 1: KPI Stat Cards
          ═══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpiCards.map((card, i) => (
          <StaggerCard key={i} index={i}>
            <div className={`group relative p-5 rounded-3xl bg-card/85 backdrop-blur-xl border ${card.borderColor} shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${card.glowColor} overflow-hidden`}>
              <div className="relative z-10 flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground">{card.title}</p>
                  <p className="text-3xl font-black text-foreground">
                    {card.isRatio ? (
                      <><AnimatedCounter value={card.value as number} /> <span className="text-lg text-muted-foreground/60 font-medium">/ {card.total}</span></>
                    ) : (
                      <AnimatedCounter value={card.value as number} />
                    )}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Activity className="w-3.5 h-3.5" />
                    <span>All Time</span>
                  </div>
                </div>
                <div className={`p-3.5 rounded-2xl ${card.iconBg} border ${card.borderColor} transition-transform duration-300 group-hover:scale-110`}>
                  <card.icon className={`w-6 h-6 ${card.iconColor}`} />
                </div>
              </div>
            </div>
          </StaggerCard>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          ROW 2: Charts
          ═══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StaggerCard index={4}>
          <div className="bg-card/85 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-400" />
                  User Growth
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">New signups over last {days} days</p>
              </div>
              <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
              </div>
            </div>
            <div className="h-64">
              <Line data={userGrowthData} options={chartOptions} />
            </div>
          </div>
        </StaggerCard>

        <StaggerCard index={5}>
          <div className="bg-card/85 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  Resumes Created
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">New resumes over last {days} days</p>
              </div>
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <BarChart3 className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
            <div className="h-64">
              <Bar data={resumeTrendData} options={chartOptions} />
            </div>
          </div>
        </StaggerCard>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          ROW 3: User Analytics & Resume Analytics
          ═══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Analytics */}
        <StaggerCard index={6}>
          <div className="bg-card/85 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-5">
              <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                <Users className="w-4 h-4 text-cyan-400" />
              </div>
              <h2 className="text-base font-bold text-foreground">User Analytics</h2>
            </div>
            <div className="space-y-3">
              {[
                { icon: UserPlus, iconColor: "text-cyan-400", label: `New Users (${days} days)`, value: data.newUsers, trend: renderPOPTrend(data.newUsers, data.prevNewUsers) },
                { icon: Users, iconColor: "text-emerald-400", label: "Registered Users", value: data.registeredUsers },
                { icon: Users, iconColor: "text-muted-foreground", label: "Guest Users", value: data.guestUsers },
                { icon: Shield, iconColor: "text-amber-400", label: "Admin Users", value: data.adminUsers },
              ].map((item, i) => (
                <div key={i} className="group flex items-center justify-between p-4 rounded-2xl bg-background/60 border border-white/[0.06] hover:border-cyan-500/30 transition-all duration-200">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <item.icon className={`w-5 h-5 ${item.iconColor}`} />
                      <span className="text-muted-foreground font-medium text-sm group-hover:text-foreground transition-colors">{item.label}</span>
                    </div>
                    {item.trend && <div className="ml-8">{item.trend}</div>}
                  </div>
                  <span className="text-foreground font-bold text-lg">
                    <AnimatedCounter value={item.value} />
                  </span>
                </div>
              ))}
            </div>
          </div>
        </StaggerCard>

        {/* Resume Analytics */}
        <StaggerCard index={7}>
          <div className="bg-card/85 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-5">
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <FileText className="w-4 h-4 text-emerald-400" />
              </div>
              <h2 className="text-base font-bold text-foreground">Resume Analytics</h2>
            </div>
            <div className="space-y-3">
              {[
                { icon: FileText, iconColor: "text-purple-400", label: `New Resumes (${days} days)`, value: data.newResumes, trend: renderPOPTrend(data.newResumes, data.prevNewResumes) },
                { icon: BarChart3, iconColor: "text-emerald-400", label: "Avg Resumes per User", value: data.avgResumesPerUser, isDecimal: true },
                { icon: Download, iconColor: "text-cyan-400", label: "Resumes With Downloads", value: data.resumesWithDownloads },
                { icon: TrendingUp, iconColor: "text-amber-400", label: "Avg Downloads per Resume", value: data.avgDownloadsPerResume, isDecimal: true },
              ].map((item, i) => (
                <div key={i} className="group flex items-center justify-between p-4 rounded-2xl bg-background/60 border border-white/[0.06] hover:border-emerald-500/30 transition-all duration-200">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <item.icon className={`w-5 h-5 ${item.iconColor}`} />
                      <span className="text-muted-foreground font-medium text-sm group-hover:text-foreground transition-colors">{item.label}</span>
                    </div>
                    {item.trend && <div className="ml-8">{item.trend}</div>}
                  </div>
                  <span className="text-foreground font-bold text-lg">
                    {item.isDecimal ? (item.value as number).toFixed(1) : <AnimatedCounter value={item.value as number} />}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground mt-4 text-center italic">
              * Download analytics represent cumulative totals.
            </p>
          </div>
        </StaggerCard>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          ROW 4: Operational Insights & Template Analytics
          ═══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Operational Insights */}
        <StaggerCard index={8}>
          <div className="bg-card/85 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <Database className="w-4 h-4 text-amber-400" />
                </div>
                <h2 className="text-base font-bold text-foreground">Operational Insights</h2>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-5">Database hygiene and data quality metrics.</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-background/60 border border-white/[0.06] hover:bg-white/[0.02] transition-all">
                <div className="flex items-center gap-3">
                  <UserMinus className="w-5 h-5 text-muted-foreground" />
                  <span className="text-foreground font-medium text-sm">Users Without Resumes</span>
                </div>
                <span className="text-foreground font-bold text-lg"><AnimatedCounter value={data.usersWithoutResumes} /></span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-2xl bg-background/60 border border-white/[0.06] hover:bg-white/[0.02] transition-all">
                <div className="flex items-center gap-3">
                  <FileX className="w-5 h-5 text-muted-foreground" />
                  <span className="text-foreground font-medium text-sm">Resumes Without Downloads</span>
                </div>
                <span className="text-foreground font-bold text-lg"><AnimatedCounter value={data.resumesWithoutDownloads} /></span>
              </div>
              <div className={`flex items-center justify-between p-4 rounded-2xl transition-all ${
                data.unknownTemplateUsage > 0
                  ? "bg-amber-500/10 border border-amber-500/20"
                  : "bg-background/60 border border-white/[0.06]"
              }`}>
                <div className="flex items-center gap-3">
                  <AlertCircle className={`w-5 h-5 ${data.unknownTemplateUsage > 0 ? "text-amber-400" : "text-muted-foreground"}`} />
                  <span className={`font-medium text-sm ${data.unknownTemplateUsage > 0 ? "text-amber-200" : "text-foreground"}`}>
                    Legacy/Unknown Templates
                  </span>
                </div>
                <span className={`font-bold text-lg ${data.unknownTemplateUsage > 0 ? "text-amber-400" : "text-foreground"}`}>
                  {data.unknownTemplateUsage}
                </span>
              </div>
            </div>
          </div>
        </StaggerCard>

        {/* Template Analytics */}
        <StaggerCard index={9}>
          <div className="bg-card/85 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-5">
              <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <FileCode2 className="w-4 h-4 text-purple-400" />
              </div>
              <h2 className="text-base font-bold text-foreground">Template Analytics</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-background/60 border border-white/[0.06] hover:bg-white/[0.02] transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10">
                    <Zap className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="text-foreground font-medium text-sm">Most Used Template</span>
                </div>
                <span className="text-foreground font-bold text-sm text-right max-w-[45%] truncate font-mono">
                  {templateStats.mostUsed ? `${TEMPLATES.find(t => t.id === templateStats.mostUsed?.templateId)?.name || templateStats.mostUsed.templateId} (${templateStats.mostUsed.percentage.toFixed(1)}%)` : "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-2xl bg-background/60 border border-white/[0.06] hover:bg-white/[0.02] transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-card border border-white/[0.08]">
                    <FileCode2 className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <span className="text-foreground font-medium text-sm">Least Used Template</span>
                </div>
                <span className="text-foreground font-bold text-sm text-right max-w-[45%] truncate font-mono">
                  {templateStats.leastUsed ? `${TEMPLATES.find(t => t.id === templateStats.leastUsed?.templateId)?.name || templateStats.leastUsed.templateId} (${templateStats.leastUsed.percentage.toFixed(1)}%)` : "N/A"}
                </span>
              </div>
              {templateStats.unused.length > 0 && (
                <div className="p-4 rounded-2xl bg-background/60 border border-white/[0.06] mt-2">
                  <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider block mb-2.5">Unused Templates:</span>
                  <div className="flex flex-wrap gap-2">
                    {templateStats.unused.map(t => (
                      <span key={t.id} className="text-xs px-2.5 py-1 bg-card rounded-lg text-foreground border border-white/[0.08]">
                        {t.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </StaggerCard>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          ROW 5: Resume Visibility & Top Users
          ═══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resume Visibility */}
        <StaggerCard index={10}>
          <div className="bg-card/85 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <Eye className="w-4 h-4 text-emerald-400" />
              </div>
              <h2 className="text-base font-bold text-foreground">Resume Visibility</h2>
            </div>
            {data.totalResumes > 0 ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-background/60 border border-white/[0.06]">
                    <div className="relative">
                      <ProgressRing percentage={publicPercentage} color="#10b981" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold text-foreground">{publicPercentage}%</span>
                      </div>
                    </div>
                    <div className="text-center">
                      <span className="text-2xl font-black text-foreground block">{data.publicResumes}</span>
                      <span className="text-xs text-emerald-400 font-semibold">Public</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-background/60 border border-white/[0.06]">
                    <div className="relative">
                      <ProgressRing percentage={privatePercentage} color="#64748b" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold text-foreground">{privatePercentage}%</span>
                      </div>
                    </div>
                    <div className="text-center">
                      <span className="text-2xl font-black text-foreground block">{data.privateResumes}</span>
                      <span className="text-xs text-muted-foreground font-semibold">Private</span>
                    </div>
                  </div>
                </div>

                <div className="h-3 w-full flex rounded-full overflow-hidden border border-white/[0.08] bg-card">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-1000"
                    style={{ width: `${publicPercentage}%` }}
                  />
                  <div
                    className="h-full bg-slate-700 transition-all duration-1000"
                    style={{ width: `${privatePercentage}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                <EyeOff className="w-10 h-10 mb-3 opacity-50" />
                <p>No resumes created yet.</p>
              </div>
            )}
          </div>
        </StaggerCard>

        {/* Most Active Users */}
        <StaggerCard index={11}>
          <div className="bg-card/85 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-6 shadow-xl flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                  <Users className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">Users by Resume Count</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Top 5 users with most resumes</p>
                </div>
              </div>
            </div>

            <div className="flex-1">
              {data.usersByResumeCount.length > 0 ? (
                <div className="space-y-2.5">
                  {data.usersByResumeCount.map((user, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + i * 0.1, type: "spring", stiffness: 200, damping: 20 }}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-background/60 border border-white/[0.06] hover:border-cyan-500/30 transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${
                          i === 0 ? "bg-amber-500/15 text-amber-400 border border-amber-500/20" :
                          i === 1 ? "bg-slate-400/15 text-slate-300 border border-slate-400/20" :
                          i === 2 ? "bg-orange-500/15 text-orange-400 border border-orange-500/20" :
                          "bg-card text-muted-foreground border border-white/[0.08]"
                        }`}>
                          #{i + 1}
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground text-sm">{user.name}</h4>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 bg-cyan-500/10 px-3 py-1.5 rounded-xl border border-cyan-500/20">
                        <span className="text-sm font-bold text-cyan-400 font-mono">{user.count}</span>
                        <span className="text-xs text-muted-foreground">resumes</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="h-32 flex items-center justify-center text-sm text-muted-foreground border border-dashed border-white/[0.08] rounded-2xl">
                  No users found.
                </div>
              )}
            </div>
          </div>
        </StaggerCard>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          ROW 6: Top Downloaded Resumes
          ═══════════════════════════════════════════════════════════════ */}
      <StaggerCard index={12}>
        <div className="bg-card/85 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <Download className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">Top Downloaded Resumes</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Most popular resumes all time</p>
              </div>
            </div>
          </div>

          {data.topDownloadedResumes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.topDownloadedResumes.map((resume, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 + i * 0.08, type: "spring", stiffness: 200, damping: 20 }}
                  className="group flex flex-col p-4 rounded-2xl bg-background/60 border border-white/[0.06] hover:border-emerald-500/30 transition-all duration-200 hover:-translate-y-0.5"
                >
                  <div className="flex-1 min-w-0 pr-4 mb-3">
                    <h4 className="font-semibold text-foreground truncate text-sm">{resume.title}</h4>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                      <Users className="w-3.5 h-3.5" />
                      <span className="truncate">{resume.ownerName}</span>
                    </div>
                  </div>
                  <div className="flex items-center self-start gap-2 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-sm font-bold text-emerald-400 font-mono">{resume.downloadCount}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="h-32 flex items-center justify-center text-sm text-muted-foreground border border-dashed border-white/[0.08] rounded-2xl">
              No downloads recorded yet.
            </div>
          )}
        </div>
      </StaggerCard>
    </div>
  );
}
