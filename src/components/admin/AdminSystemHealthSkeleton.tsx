"use client";

import { ShieldCheck } from "lucide-react";

export function AdminSystemHealthSkeleton() {
  return (
    <div className="space-y-6 max-w-5xl animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="space-y-3">
          <div className="h-8 w-64 bg-slate-800 rounded-lg"></div>
          <div className="h-4 w-48 bg-slate-800/50 rounded-lg"></div>
        </div>
        <div className="h-10 w-32 bg-slate-800 rounded-xl"></div>
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-slate-800 rounded-2xl"></div>
              <div className="space-y-2">
                <div className="w-32 h-4 bg-slate-800 rounded"></div>
                <div className="w-24 h-3 bg-slate-800/50 rounded"></div>
              </div>
            </div>
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <div className="w-40 h-4 bg-slate-800/50 rounded"></div>
                <div className="w-20 h-5 bg-slate-800 rounded-lg"></div>
              </div>
              <div className="flex items-center justify-between">
                <div className="w-32 h-4 bg-slate-800/50 rounded"></div>
                <div className="w-24 h-5 bg-slate-800 rounded-lg"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
