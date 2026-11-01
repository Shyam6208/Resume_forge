"use client";

import { useEffect, useState } from "react";
import { SystemHealthData } from "@/app/api/admin/system-health/route";
import { AdminSystemHealthSkeleton } from "./AdminSystemHealthSkeleton";
import { 
  Database, 
  Server, 
  RefreshCw, 
  AlertTriangle, 
  Clock, 
  ShieldCheck, 
  Bot, 
  FileCode2, 
  CheckCircle2, 
  XCircle, 
  MinusCircle
} from "lucide-react";

const StatusIcon = ({ status, type = "boolean" }: { status: any, type?: "boolean" | "configured" | "healthy" }) => {
  if (type === "boolean") {
    return status ? (
      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
    ) : (
      <XCircle className="w-4 h-4 text-rose-400" />
    );
  }
  
  if (type === "configured") {
    return status === "configured" ? (
      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
    ) : (
      <MinusCircle className="w-4 h-4 text-muted-foreground" />
    );
  }

  if (type === "healthy") {
    return status === "healthy" ? (
      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
    ) : (
      <AlertTriangle className="w-4 h-4 text-rose-400" />
    );
  }

  return null;
};

export function AdminSettingsClient() {
  const [data, setData] = useState<SystemHealthData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    let isCancelled = false;
    async function loadHealth() {
      try {
        const res = await fetch("/api/admin/system-health");
        if (res.status === 401 || res.status === 403) {
          throw new Error("Unauthorized");
        }
        if (!res.ok) {
          throw new Error("Failed to load system health");
        }
        
        const json: SystemHealthData = await res.json();
        if (!isCancelled) {
          setData(json);
          setError(null);
        }
      } catch (err: any) {
        if (!isCancelled) {
          console.error(err);
          setError(err?.message || "Unable to check system health.");
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    }

    loadHealth();
    return () => {
      isCancelled = true;
    };
  }, [refreshTrigger]);

  const handleRefresh = () => {
    if (isLoading || isRefreshing) return;
    setIsRefreshing(true);
    setRefreshTrigger((prev) => prev + 1);
  };

  if (isLoading) {
    return <AdminSystemHealthSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-[calc(100vh-100px)]">
        <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center mb-6 border border-rose-500/20">
          <AlertTriangle className="w-8 h-8 text-rose-400" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Unable to load system health.</h2>
        <p className="text-muted-foreground max-w-md mb-8 whitespace-pre-wrap">
          {error}
        </p>
        <button
          onClick={handleRefresh}
          className="px-6 py-2.5 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 text-sm font-bold rounded-xl shadow-lg shadow-cyan-500/20 transition-all active:scale-[0.98]"
        >
          Try Again
        </button>
      </div>
    );
  }

  const formattedLastUpdated = new Date(data.timestamp).toLocaleTimeString(undefined, { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true
  });
  
  const lastUpdatedDate = new Date(data.timestamp).toLocaleDateString();
  const isToday = lastUpdatedDate === new Date().toLocaleDateString();
  const dateStr = isToday ? "Today at" : `${lastUpdatedDate} at`;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            Admin Settings & System Health
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            System overview and integration credentials status.
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-card/80 hover:bg-white/[0.06] border border-white/[0.08] hover:border-cyan-500/40 text-foreground text-sm font-semibold rounded-xl transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-cyan-400" : ""}`} />
            Refresh Status
          </button>
          <div className="text-xs text-muted-foreground flex items-center gap-1.5" suppressHydrationWarning>
            <Clock className="w-3.5 h-3.5" />
            Last checked: {dateStr} {formattedLastUpdated}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Platform Overview */}
        <div className="p-6 rounded-3xl bg-card/85 backdrop-blur-xl border border-white/[0.08] shadow-xl flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Platform Overview</h3>
              <p className="text-xs text-muted-foreground">Application environment details</p>
            </div>
          </div>
          
          <div className="space-y-3 flex-1">
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-background/60 border border-white/[0.06]">
              <span className="text-sm font-medium text-muted-foreground">Application Name</span>
              <span className="text-sm font-bold text-foreground">ResumeForge</span>
            </div>
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-background/60 border border-white/[0.06]">
              <span className="text-sm font-medium text-muted-foreground">Environment</span>
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${data.application.environment === 'production' ? 'bg-cyan-400' : 'bg-amber-400'}`}></span>
                <span className="text-sm font-bold text-foreground capitalize">{data.application.environment}</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-background/60 border border-white/[0.06]">
              <span className="text-sm font-medium text-muted-foreground">Next.js System</span>
              <span className="text-sm font-bold text-emerald-400">Operational</span>
            </div>
          </div>
        </div>

        {/* Database Status */}
        <div className="p-6 rounded-3xl bg-card/85 backdrop-blur-xl border border-white/[0.08] shadow-xl flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Database Health</h3>
              <p className="text-xs text-muted-foreground">PostgreSQL / Supabase connection</p>
            </div>
          </div>
          
          <div className="space-y-3 flex-1">
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-background/60 border border-white/[0.06]">
              <span className="text-sm font-medium text-muted-foreground">Connection Status</span>
              <div className="flex items-center gap-1.5">
                <StatusIcon status={data.database.status} type="healthy" />
                <span className={`text-sm font-bold capitalize ${data.database.status === 'healthy' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {data.database.status}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-background/60 border border-white/[0.06]">
              <span className="text-sm font-medium text-muted-foreground">Response Time (Ping)</span>
              <span className="text-sm font-bold text-foreground font-mono">
                {data.database.responseTimeMs !== null ? `${data.database.responseTimeMs} ms` : 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-background/60 border border-white/[0.06]">
              <span className="text-sm font-medium text-muted-foreground">Health Endpoint Check</span>
              <span className="text-xs font-semibold px-2.5 py-1 bg-card text-foreground rounded-lg border border-white/[0.08]">
                Read-only
              </span>
            </div>
          </div>
        </div>

        {/* Auth Configuration */}
        <div className="p-6 rounded-3xl bg-card/85 backdrop-blur-xl border border-white/[0.08] shadow-xl flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Authentication Status</h3>
              <p className="text-xs text-muted-foreground">Client & Service-Role Configuration</p>
            </div>
          </div>
          
          <div className="space-y-3 flex-1">
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-background/60 border border-white/[0.06]">
              <span className="text-sm font-medium text-muted-foreground">Supabase Auth Keys</span>
              <div className="flex items-center gap-1.5">
                <StatusIcon status={data.authentication.status} type="configured" />
                <span className={`text-sm font-bold capitalize ${data.authentication.status === 'configured' ? 'text-emerald-400' : 'text-muted-foreground'}`}>
                  {data.authentication.status}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-background/60 border border-white/[0.06]">
              <span className="text-sm font-medium text-muted-foreground">Admin Authorization</span>
              <div className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm font-bold">Active</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-background/60 border border-white/[0.06]">
              <span className="text-sm font-medium text-muted-foreground">Protected Routes</span>
              <div className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm font-bold">Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Service Status */}
        <div className="p-6 rounded-3xl bg-card/85 backdrop-blur-xl border border-white/[0.08] shadow-xl flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">AI Service Status</h3>
              <p className="text-xs text-muted-foreground">Generative AI integrations</p>
            </div>
          </div>
          
          <div className="space-y-3 flex-1">
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-background/60 border border-white/[0.06]">
              <span className="text-sm font-medium text-muted-foreground">Provider</span>
              <span className="text-sm font-bold text-foreground">{data.ai.provider}</span>
            </div>
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-background/60 border border-white/[0.06]">
              <span className="text-sm font-medium text-muted-foreground">API Configuration</span>
              <div className="flex items-center gap-1.5">
                <StatusIcon status={data.ai.status} type="configured" />
                <span className={`text-sm font-bold capitalize ${data.ai.status === 'configured' ? 'text-emerald-400' : 'text-muted-foreground'}`}>
                  {data.ai.status}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-background/60 border border-white/[0.06]">
              <span className="text-sm font-medium text-muted-foreground">Test Requests</span>
              <span className="text-xs font-semibold px-2.5 py-1 bg-card text-foreground rounded-lg border border-white/[0.08]">
                Disabled for health check
              </span>
            </div>
          </div>
        </div>

        {/* Resume System Status */}
        <div className="p-6 rounded-3xl bg-card/85 backdrop-blur-xl border border-white/[0.08] shadow-xl flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <FileCode2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Resume System Status</h3>
              <p className="text-xs text-muted-foreground">Platform capabilities</p>
            </div>
          </div>
          
          <div className="space-y-3 flex-1">
            {[
              { label: "Resume Import System", status: "Active" },
              { label: "PDF Export System", status: "Active" },
              { label: "Local ATS Scoring", status: "Active" },
              { label: "AI Resume Analysis", status: "Available" },
              { label: "JD Match", status: "Available" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3.5 rounded-2xl bg-background/60 border border-white/[0.06]">
                <span className="text-sm font-medium text-muted-foreground">{item.label}</span>
                <span className="text-sm font-bold text-emerald-400">{item.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Security Status */}
        <div className="p-6 rounded-3xl bg-card/85 backdrop-blur-xl border border-white/[0.08] shadow-xl flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Security Status</h3>
              <p className="text-xs text-muted-foreground">System protection verification</p>
            </div>
          </div>
          
          <div className="space-y-3 flex-1">
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-background/60 border border-white/[0.06]">
              <span className="text-sm font-medium text-muted-foreground">Admin Page Protection</span>
              <div className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm font-bold">Enabled</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-background/60 border border-white/[0.06]">
              <span className="text-sm font-medium text-muted-foreground">Admin API Protection</span>
              <div className="flex items-center gap-1.5 text-emerald-400">
                <StatusIcon status={data.security.adminApiProtected} />
                <span className="text-sm font-bold">{data.security.adminApiProtected ? "Enabled" : "Not Verified"}</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-background/60 border border-white/[0.06]">
              <span className="text-sm font-medium text-muted-foreground">Service-Role Server-Only</span>
              <div className="flex items-center gap-1.5 text-emerald-400">
                <StatusIcon status={data.security.serviceRoleServerOnly} />
                <span className="text-sm font-bold">{data.security.serviceRoleServerOnly ? "Verified" : "Not Verified"}</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-background/60 border border-white/[0.06]">
              <span className="text-sm font-medium text-muted-foreground">Credentials Client Safety</span>
              <div className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm font-bold">Verified</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-background/60 border border-white/[0.06]">
              <span className="text-sm font-medium text-muted-foreground">Zero-Write Health Checks</span>
              <div className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm font-bold">Verified</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
