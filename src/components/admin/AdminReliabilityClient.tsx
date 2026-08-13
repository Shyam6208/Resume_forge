"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ServerCrash,
  RefreshCw,
  Database,
  Lock,
  Bot,
  Activity,
  AlertCircle,
  Clock,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SystemHealthData {
  success: boolean;
  application: {
    environment: string;
  };
  database: {
    status: "healthy" | "error";
    responseTimeMs: number | null;
  };
  authentication: {
    status: "configured" | "not configured";
  };
  ai: {
    provider: string;
    status: "configured" | "not configured";
  };
  security: {
    adminApiProtected: boolean;
    serviceRoleServerOnly: boolean;
  };
  timestamp: string;
}

export function AdminReliabilityClient() {
  const [healthData, setHealthData] = useState<SystemHealthData | null>(null);
  const [loadingState, setLoadingState] = useState<"loading" | "loaded" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const fetchHealth = useCallback(async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    else setLoadingState("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/admin/system-health");
      if (!res.ok) {
        throw new Error(`Health check failed (${res.status})`);
      }

      const data: SystemHealthData = await res.json();
      if (!data.success) {
        throw new Error("System health check returned unsuccessful status.");
      }
      
      setHealthData(data);
      setLastChecked(new Date());
      setLoadingState("loaded");
    } catch (err) {
      console.error(err);
      setErrorMessage(err instanceof Error ? err.message : "Unable to check system health.");
      setLoadingState("error");
    } finally {
      if (isRefresh) setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
  }, [fetchHealth]);

  if (loadingState === "loading" && !healthData) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex items-center justify-between border-b border-slate-800 pb-6">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-slate-800 rounded-lg"></div>
            <div className="h-4 w-96 bg-slate-800/50 rounded-lg"></div>
          </div>
          <div className="h-10 w-32 bg-slate-800 rounded-xl"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-slate-900/90 rounded-3xl border border-slate-800"></div>
          ))}
        </div>
        
        <div className="h-40 bg-slate-900/90 rounded-3xl border border-slate-800"></div>
      </div>
    );
  }

  if (loadingState === "error" && !healthData) {
    return (
      <div className="space-y-6">
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6 text-red-400" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-white">Unable to check system health.</p>
            <p className="text-xs text-slate-400">{errorMessage}</p>
          </div>
          <Button onClick={() => fetchHealth(false)} className="h-9 px-4 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl">
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
            <span>Platform Reliability</span>
            {healthData?.application.environment === "production" ? (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-bold uppercase tracking-widest">
                Production
              </span>
            ) : (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold uppercase tracking-widest">
                Development
              </span>
            )}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Live operational status and configuration verification
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {lastChecked && (
            <span className="text-[11px] text-slate-500 font-medium hidden sm:inline-block">
              Last checked: {lastChecked.toLocaleTimeString()}
            </span>
          )}
          <Button
            onClick={() => fetchHealth(true)}
            disabled={isRefreshing}
            className="h-10 px-4 text-xs bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl border border-slate-700"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh Status
          </Button>
        </div>
      </div>

      {healthData && (
        <>
          {/* Live System Checks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Database Card */}
            <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 flex flex-col justify-between space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl border ${
                    healthData.database.status === "healthy" 
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                      : "bg-red-500/10 border-red-500/20 text-red-400"
                  }`}>
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">Live Database Check</h3>
                    <p className="text-xs text-slate-400">PostgreSQL / Supabase</p>
                  </div>
                </div>
                {healthData.database.status === "healthy" ? (
                  <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" /> Healthy
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-xs font-bold text-red-400">
                    <XCircle className="w-4 h-4" /> Error
                  </span>
                )}
              </div>
              
              <div className="pt-4 border-t border-slate-800/80">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Response Time
                  </span>
                  <span className="font-mono text-sm font-bold text-slate-200">
                    {healthData.database.responseTimeMs !== null ? `${healthData.database.responseTimeMs}ms` : "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Authentication Card */}
            <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 flex flex-col justify-between space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl border ${
                    healthData.authentication.status === "configured" 
                      ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400" 
                      : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                  }`}>
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">Authentication</h3>
                    <p className="text-xs text-slate-400">Supabase Auth Configuration</p>
                  </div>
                </div>
                {healthData.authentication.status === "configured" ? (
                  <span className="flex items-center gap-1.5 text-xs font-bold text-indigo-400">
                    <CheckCircle2 className="w-4 h-4" /> Configured
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                    <XCircle className="w-4 h-4" /> Missing
                  </span>
                )}
              </div>
              
              <div className="pt-4 border-t border-slate-800/80">
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Verifies that standard Anon, URL, and Admin Service-Role environment variables are supplied to the runtime.
                </p>
              </div>
            </div>

            {/* AI Integration Card */}
            <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 flex flex-col justify-between space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl border ${
                    healthData.ai.status === "configured" 
                      ? "bg-purple-500/10 border-purple-500/20 text-purple-400" 
                      : "bg-slate-800 border-slate-700 text-slate-400"
                  }`}>
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">AI Infrastructure</h3>
                    <p className="text-xs text-slate-400">Provider: {healthData.ai.provider}</p>
                  </div>
                </div>
                {healthData.ai.status === "configured" ? (
                  <span className="flex items-center gap-1.5 text-xs font-bold text-purple-400">
                    <CheckCircle2 className="w-4 h-4" /> Configured
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                    <XCircle className="w-4 h-4" /> Not Configured
                  </span>
                )}
              </div>
              
              <div className="pt-4 border-t border-slate-800/80">
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed flex items-start gap-1.5">
                  <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  No live Gemini request is made during health checks to conserve quota. Only configuration status is reported.
                </p>
              </div>
            </div>

            {/* Security Architecture Card */}
            <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 flex flex-col justify-between space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">Security Assertions</h3>
                    <p className="text-xs text-slate-400">Architecture Boundaries</p>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-800/80 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Admin API Protected</span>
                  {healthData.security.adminApiProtected ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Verified</span>
                  ) : (
                    <span className="text-red-400 font-bold flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /> Failed</span>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Credentials Server-Only</span>
                  {healthData.security.serviceRoleServerOnly ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Verified</span>
                  ) : (
                    <span className="text-red-400 font-bold flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /> Failed</span>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Historical Monitoring Disclaimer */}
          <div className="rounded-3xl bg-slate-900/60 border border-slate-800/50 p-6 space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-slate-400" />
              Historical Monitoring
            </h3>
            
            <div className="bg-slate-950/50 rounded-2xl p-5 border border-slate-800/50">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-300 font-medium">Historical API performance metrics are not currently collected.</p>
                    <p className="text-[11px] text-slate-500 mt-1">The system does not track average latency, API success rates, request counts, or historical uptime percentiles.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-300 font-medium">Historical error metrics are not currently collected.</p>
                    <p className="text-[11px] text-slate-500 mt-1">The system does not maintain a centralized error log or track API failure rates over time.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
