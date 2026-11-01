"use client";

import { useState, useEffect } from "react";
import {
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

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    let isCancelled = false;
    async function loadHealth() {
      try {
        const res = await fetch("/api/admin/system-health");
        if (!res.ok) {
          throw new Error(`Health check failed (${res.status})`);
        }

        const data: SystemHealthData = await res.json();
        if (!data.success) {
          throw new Error("System health check returned unsuccessful status.");
        }

        if (!isCancelled) {
          setHealthData(data);
          setLastChecked(new Date());
          setErrorMessage("");
          setLoadingState("loaded");
        }
      } catch (err) {
        if (!isCancelled) {
          console.error(err);
          setErrorMessage(err instanceof Error ? err.message : "Unable to check system health.");
          setLoadingState("error");
        }
      } finally {
        if (!isCancelled) {
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
    setIsRefreshing(true);
    setRefreshTrigger((prev) => prev + 1);
  };

  if (loadingState === "loading" && !healthData) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-6">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-card rounded-xl"></div>
            <div className="h-4 w-96 bg-card/60 rounded-xl"></div>
          </div>
          <div className="h-10 w-32 bg-card rounded-xl"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-card/85 rounded-3xl border border-white/[0.08]"></div>
          ))}
        </div>
        
        <div className="h-40 bg-card/85 rounded-3xl border border-white/[0.08]"></div>
      </div>
    );
  }

  if (loadingState === "error" && !healthData) {
    return (
      <div className="space-y-6">
        <div className="rounded-3xl bg-card/85 backdrop-blur-xl border border-white/[0.08] shadow-xl p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6 text-rose-400" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-foreground">Unable to check system health.</p>
            <p className="text-xs text-muted-foreground">{errorMessage}</p>
          </div>
          <Button onClick={handleRefresh} className="h-10 px-5 text-xs bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-bold rounded-xl shadow-lg shadow-cyan-500/20">
            <RefreshCw className="w-3.5 h-3.5 mr-1.5 text-slate-950" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight flex items-center gap-2">
            <span>Platform Reliability</span>
            {healthData?.application.environment === "production" ? (
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold uppercase tracking-widest">
                Production
              </span>
            ) : (
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold uppercase tracking-widest">
                Development
              </span>
            )}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Live operational status and configuration verification
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {lastChecked && (
            <span className="text-[11px] text-muted-foreground font-medium hidden sm:inline-block" suppressHydrationWarning>
              Last checked: {lastChecked.toLocaleTimeString()}
            </span>
          )}
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-10 px-4 text-xs bg-card hover:bg-white/[0.06] text-foreground font-semibold rounded-xl border border-white/[0.08]"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin text-cyan-400" : ""}`} />
            Refresh Status
          </Button>
        </div>
      </div>

      {healthData && (
        <>
          {/* Live System Checks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Database Card */}
            <div className="rounded-3xl bg-card/85 backdrop-blur-xl border border-white/[0.08] p-6 flex flex-col justify-between space-y-4 shadow-xl">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl border ${
                    healthData.database.status === "healthy" 
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                      : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                  }`}>
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-sm">Live Database Check</h3>
                    <p className="text-xs text-muted-foreground">PostgreSQL / Supabase</p>
                  </div>
                </div>
                {healthData.database.status === "healthy" ? (
                  <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" /> Healthy
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-xs font-bold text-rose-400">
                    <XCircle className="w-4 h-4" /> Error
                  </span>
                )}
              </div>
              
              <div className="pt-4 border-t border-white/[0.06]">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Response Time
                  </span>
                  <span className="font-mono text-sm font-bold text-foreground">
                    {healthData.database.responseTimeMs !== null ? `${healthData.database.responseTimeMs}ms` : "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Authentication Card */}
            <div className="rounded-3xl bg-card/85 backdrop-blur-xl border border-white/[0.08] p-6 flex flex-col justify-between space-y-4 shadow-xl">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl border ${
                    healthData.authentication.status === "configured" 
                      ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400" 
                      : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                  }`}>
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-sm">Authentication</h3>
                    <p className="text-xs text-muted-foreground">Supabase Auth Configuration</p>
                  </div>
                </div>
                {healthData.authentication.status === "configured" ? (
                  <span className="flex items-center gap-1.5 text-xs font-bold text-cyan-400">
                    <CheckCircle2 className="w-4 h-4" /> Configured
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                    <XCircle className="w-4 h-4" /> Missing
                  </span>
                )}
              </div>
              
              <div className="pt-4 border-t border-white/[0.06]">
                <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                  Verifies that standard Anon, URL, and Admin Service-Role environment variables are supplied to the runtime.
                </p>
              </div>
            </div>

            {/* AI Integration Card */}
            <div className="rounded-3xl bg-card/85 backdrop-blur-xl border border-white/[0.08] p-6 flex flex-col justify-between space-y-4 shadow-xl">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl border ${
                    healthData.ai.status === "configured" 
                      ? "bg-purple-500/10 border-purple-500/20 text-purple-400" 
                      : "bg-card border-white/[0.08] text-muted-foreground"
                  }`}>
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-sm">AI Infrastructure</h3>
                    <p className="text-xs text-muted-foreground">Provider: {healthData.ai.provider}</p>
                  </div>
                </div>
                {healthData.ai.status === "configured" ? (
                  <span className="flex items-center gap-1.5 text-xs font-bold text-purple-400">
                    <CheckCircle2 className="w-4 h-4" /> Configured
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                    <XCircle className="w-4 h-4" /> Not Configured
                  </span>
                )}
              </div>
              
              <div className="pt-4 border-t border-white/[0.06]">
                <p className="text-[11px] text-muted-foreground font-medium leading-relaxed flex items-start gap-1.5">
                  <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-cyan-400" />
                  No live Gemini request is made during health checks to conserve quota. Only configuration status is reported.
                </p>
              </div>
            </div>

            {/* Security Architecture Card */}
            <div className="rounded-3xl bg-card/85 backdrop-blur-xl border border-white/[0.08] p-6 flex flex-col justify-between space-y-4 shadow-xl">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-card border border-white/[0.08] text-foreground">
                    <ShieldCheck className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-sm">Security Assertions</h3>
                    <p className="text-xs text-muted-foreground">Architecture Boundaries</p>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-white/[0.06] space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground font-medium">Admin API Protected</span>
                  {healthData.security.adminApiProtected ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Verified</span>
                  ) : (
                    <span className="text-rose-400 font-bold flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /> Failed</span>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground font-medium">Credentials Server-Only</span>
                  {healthData.security.serviceRoleServerOnly ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Verified</span>
                  ) : (
                    <span className="text-rose-400 font-bold flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /> Failed</span>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Historical Monitoring Disclaimer */}
          <div className="rounded-3xl bg-card/85 backdrop-blur-xl border border-white/[0.08] p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              Historical Monitoring
            </h3>
            
            <div className="bg-background/60 rounded-2xl p-5 border border-white/[0.06]">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-foreground font-medium">Historical API performance metrics are not currently collected.</p>
                    <p className="text-[11px] text-muted-foreground mt-1">The system does not track average latency, API success rates, request counts, or historical uptime percentiles.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-foreground font-medium">Historical error metrics are not currently collected.</p>
                    <p className="text-[11px] text-muted-foreground mt-1">The system does not maintain a centralized error log or track API failure rates over time.</p>
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
