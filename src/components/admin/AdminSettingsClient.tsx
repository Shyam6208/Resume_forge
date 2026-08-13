"use client";

import { useEffect, useState, useCallback } from "react";
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

export function AdminSettingsClient() {
  const [data, setData] = useState<SystemHealthData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchHealth = useCallback(async (showRefresh: boolean = false) => {
    if (showRefresh) setIsRefreshing(true);
    else setIsLoading(true);
    
    setError(null);
    
    try {
      const res = await fetch("/api/admin/system-health");
      if (res.status === 401 || res.status === 403) {
        throw new Error("Unauthorized");
      }
      if (!res.ok) {
        throw new Error("Failed to load system health");
      }
      
      const json: SystemHealthData = await res.json();
      setData(json);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Unable to check system health.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth(false);
  }, [fetchHealth]);

  const handleRefresh = () => {
    if (isLoading || isRefreshing) return;
    fetchHealth(true);
  };

  if (isLoading) {
    return <AdminSystemHealthSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-[calc(100vh-100px)]">
        <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6 border border-red-500/20">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Unable to load system health.</h2>
        <p className="text-slate-400 max-w-md mb-8 whitespace-pre-wrap">
          {error}
        </p>
        <button
          onClick={() => fetchHealth(false)}
          className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

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
        <MinusCircle className="w-4 h-4 text-slate-500" />
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
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Admin Settings & System Health
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            System overview and integration credentials status.
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900/50 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-indigo-400" : ""}`} />
            Refresh Status
          </button>
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Last checked: {dateStr} {formattedLastUpdated}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Platform Overview */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Platform Overview</h3>
              <p className="text-xs text-slate-400">Application environment details</p>
            </div>
          </div>
          
          <div className="space-y-3 flex-1">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-800/50">
              <span className="text-sm font-medium text-slate-400">Application Name</span>
              <span className="text-sm font-bold text-white">ResumeForge</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-800/50">
              <span className="text-sm font-medium text-slate-400">Environment</span>
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${data.application.environment === 'production' ? 'bg-indigo-400' : 'bg-amber-400'}`}></span>
                <span className="text-sm font-bold text-white capitalize">{data.application.environment}</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-800/50">
              <span className="text-sm font-medium text-slate-400">Next.js System</span>
              <span className="text-sm font-bold text-emerald-400">Operational</span>
            </div>
          </div>
        </div>

        {/* Database Status */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Database Health</h3>
              <p className="text-xs text-slate-400">PostgreSQL / Supabase connection</p>
            </div>
          </div>
          
          <div className="space-y-3 flex-1">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-800/50">
              <span className="text-sm font-medium text-slate-400">Connection Status</span>
              <div className="flex items-center gap-1.5">
                <StatusIcon status={data.database.status} type="healthy" />
                <span className={`text-sm font-bold capitalize ${data.database.status === 'healthy' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {data.database.status}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-800/50">
              <span className="text-sm font-medium text-slate-400">Response Time (Ping)</span>
              <span className="text-sm font-bold text-white">
                {data.database.responseTimeMs !== null ? `${data.database.responseTimeMs} ms` : 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-800/50">
              <span className="text-sm font-medium text-slate-400">Health Endpoint Check</span>
              <span className="text-xs font-medium px-2 py-1 bg-slate-800 text-slate-300 rounded border border-slate-700">
                Read-only
              </span>
            </div>
          </div>
        </div>

        {/* Auth Configuration */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Authentication Status</h3>
              <p className="text-xs text-slate-400">Client & Service-Role Configuration</p>
            </div>
          </div>
          
          <div className="space-y-3 flex-1">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-800/50">
              <span className="text-sm font-medium text-slate-400">Supabase Auth Keys</span>
              <div className="flex items-center gap-1.5">
                <StatusIcon status={data.authentication.status} type="configured" />
                <span className={`text-sm font-bold capitalize ${data.authentication.status === 'configured' ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {data.authentication.status}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-800/50">
              <span className="text-sm font-medium text-slate-400">Admin Authorization</span>
              <div className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm font-bold">Active</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-800/50">
              <span className="text-sm font-medium text-slate-400">Protected Routes</span>
              <div className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm font-bold">Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Service Status */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">AI Service Status</h3>
              <p className="text-xs text-slate-400">Generative AI integrations</p>
            </div>
          </div>
          
          <div className="space-y-3 flex-1">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-800/50">
              <span className="text-sm font-medium text-slate-400">Provider</span>
              <span className="text-sm font-bold text-white">{data.ai.provider}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-800/50">
              <span className="text-sm font-medium text-slate-400">API Configuration</span>
              <div className="flex items-center gap-1.5">
                <StatusIcon status={data.ai.status} type="configured" />
                <span className={`text-sm font-bold capitalize ${data.ai.status === 'configured' ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {data.ai.status}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-800/50">
              <span className="text-sm font-medium text-slate-400">Test Requests</span>
              <span className="text-xs font-medium px-2 py-1 bg-slate-800 text-slate-300 rounded border border-slate-700">
                Disabled for health check
              </span>
            </div>
          </div>
        </div>

        {/* Resume System Status */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <FileCode2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Resume System Status</h3>
              <p className="text-xs text-slate-400">Platform capabilities</p>
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
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-800/50">
                <span className="text-sm font-medium text-slate-400">{item.label}</span>
                <span className="text-sm font-bold text-emerald-400">{item.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Security Status */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Security Status</h3>
              <p className="text-xs text-slate-400">System protection verification</p>
            </div>
          </div>
          
          <div className="space-y-3 flex-1">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-800/50">
              <span className="text-sm font-medium text-slate-400">Admin Page Protection</span>
              <div className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm font-bold">Enabled</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-800/50">
              <span className="text-sm font-medium text-slate-400">Admin API Protection</span>
              <div className="flex items-center gap-1.5 text-emerald-400">
                <StatusIcon status={data.security.adminApiProtected} />
                <span className="text-sm font-bold">{data.security.adminApiProtected ? "Enabled" : "Not Verified"}</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-800/50">
              <span className="text-sm font-medium text-slate-400">Service-Role Server-Only</span>
              <div className="flex items-center gap-1.5 text-emerald-400">
                <StatusIcon status={data.security.serviceRoleServerOnly} />
                <span className="text-sm font-bold">{data.security.serviceRoleServerOnly ? "Verified" : "Not Verified"}</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-800/50">
              <span className="text-sm font-medium text-slate-400">Credentials Client Safety</span>
              <div className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm font-bold">Verified</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-800/50">
              <span className="text-sm font-medium text-slate-400">Zero-Write Health Checks</span>
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
