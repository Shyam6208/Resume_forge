"use client";

/**
 * AdminResumesSkeleton — polished loading skeleton for the admin resumes table.
 * Matches the Step 11A UsersSkeleton design language.
 */
export function AdminResumesSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-slate-800 rounded-xl" />
          <div className="h-4 w-80 bg-slate-800/60 rounded-lg" />
        </div>
        <div className="h-9 w-28 bg-slate-800 rounded-full" />
      </div>

      {/* Search / Filter bar skeleton */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="h-10 flex-1 bg-slate-900 rounded-xl border border-slate-800" />
        <div className="h-10 w-36 bg-slate-900 rounded-xl border border-slate-800 hidden sm:block" />
        <div className="h-10 w-36 bg-slate-900 rounded-xl border border-slate-800 hidden sm:block" />
        <div className="h-10 w-36 bg-slate-900 rounded-xl border border-slate-800 hidden sm:block" />
      </div>

      {/* Table skeleton */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
        {/* Table header */}
        <div className="bg-slate-950 border-b border-slate-800 px-4 py-3 flex gap-6">
          <div className="h-3 w-28 bg-slate-800 rounded" />
          <div className="h-3 w-24 bg-slate-800 rounded hidden sm:block" />
          <div className="h-3 w-24 bg-slate-800 rounded hidden md:block" />
          <div className="h-3 w-20 bg-slate-800 rounded hidden md:block" />
          <div className="h-3 w-14 bg-slate-800 rounded hidden lg:block" />
          <div className="h-3 w-20 bg-slate-800 rounded hidden lg:block" />
          <div className="h-3 w-10 bg-slate-800 rounded" />
        </div>

        {/* Table rows */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="px-4 py-4 flex items-center gap-6 border-b border-slate-800/60"
            style={{ opacity: 1 - i * 0.08 }}
          >
            {/* Resume icon */}
            <div className="w-8 h-8 rounded-lg bg-slate-800 shrink-0" />
            {/* Title */}
            <div className="h-4 w-32 bg-slate-800/80 rounded" />
            {/* Owner */}
            <div className="h-3.5 w-24 bg-slate-800/60 rounded hidden sm:block" />
            {/* Target Role */}
            <div className="h-3.5 w-24 bg-slate-800/50 rounded hidden md:block" />
            {/* Template */}
            <div className="h-3.5 w-20 bg-slate-800/50 rounded hidden md:block" />
            {/* ATS */}
            <div className="h-5 w-10 bg-slate-800/40 rounded hidden lg:block" />
            {/* Updated */}
            <div className="h-3.5 w-20 bg-slate-800/40 rounded hidden lg:block" />
            {/* Actions */}
            <div className="h-6 w-6 bg-slate-800/30 rounded ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}
