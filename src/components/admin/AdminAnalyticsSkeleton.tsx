import { FileCode2, Users, FileText, Download } from "lucide-react";

export function AdminAnalyticsSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-slate-800 rounded-lg" />
          <div className="h-4 w-72 bg-slate-800 rounded-md" />
        </div>
        
        <div className="flex items-center gap-3">
          <div className="h-10 w-24 bg-slate-800 rounded-xl" />
          <div className="h-10 w-28 bg-slate-800 rounded-xl" />
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[Users, FileText, Download, FileCode2].map((Icon, i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3 flex items-center justify-between"
          >
            <div className="space-y-2">
              <div className="h-4 w-20 bg-slate-800 rounded-md" />
              <div className="h-7 w-12 bg-slate-800 rounded-md" />
            </div>
            <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
              <Icon className="w-6 h-6 text-slate-600" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 h-80 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="h-5 w-32 bg-slate-800 rounded-md" />
            <div className="h-3 w-40 bg-slate-800 rounded-md" />
          </div>
          <div className="h-48 bg-slate-800/50 rounded-xl" />
        </div>
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 h-80 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="h-5 w-32 bg-slate-800 rounded-md" />
            <div className="h-3 w-40 bg-slate-800 rounded-md" />
          </div>
          <div className="h-48 bg-slate-800/50 rounded-xl" />
        </div>
      </div>

      {/* User & Resume Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 min-h-[300px]">
          <div className="h-5 w-40 bg-slate-800 rounded-md mb-6" />
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex justify-between items-center p-4 rounded-xl bg-slate-800/50">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-md bg-slate-700" />
                  <div className="h-4 w-32 bg-slate-700 rounded-md" />
                </div>
                <div className="h-5 w-8 bg-slate-700 rounded-md" />
              </div>
            ))}
          </div>
        </div>
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 min-h-[300px]">
          <div className="h-5 w-40 bg-slate-800 rounded-md mb-6" />
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex justify-between items-center p-4 rounded-xl bg-slate-800/50">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-md bg-slate-700" />
                  <div className="h-4 w-32 bg-slate-700 rounded-md" />
                </div>
                <div className="h-5 w-8 bg-slate-700 rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Template Analytics & Resume Visibility Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 min-h-[250px]">
          <div className="h-5 w-40 bg-slate-800 rounded-md mb-6" />
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="flex justify-between items-center p-4 rounded-xl bg-slate-800/50">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-md bg-slate-700" />
                  <div className="h-4 w-32 bg-slate-700 rounded-md" />
                </div>
                <div className="h-5 w-24 bg-slate-700 rounded-md" />
              </div>
            ))}
          </div>
        </div>
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 min-h-[250px]">
          <div className="h-5 w-40 bg-slate-800 rounded-md mb-6" />
          <div className="mt-8 space-y-6">
            <div className="h-6 w-full bg-slate-800 rounded-full" />
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-800/50 h-24" />
              <div className="p-4 rounded-xl bg-slate-800/50 h-24" />
            </div>
          </div>
        </div>
      </div>

      {/* Users & Downloads Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 min-h-[300px]">
          <div className="h-5 w-40 bg-slate-800 rounded-md mb-2" />
          <div className="h-3 w-32 bg-slate-800 rounded-md mb-6" />
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex justify-between items-center p-4 rounded-2xl bg-slate-800/40 border border-slate-800/50">
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-slate-700 rounded-md" />
                  <div className="h-3 w-40 bg-slate-700 rounded-md" />
                </div>
                <div className="h-8 w-16 bg-slate-700 rounded-xl" />
              </div>
            ))}
          </div>
        </div>
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 min-h-[300px]">
          <div className="h-5 w-48 bg-slate-800 rounded-md mb-2" />
          <div className="h-3 w-40 bg-slate-800 rounded-md mb-6" />
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex justify-between items-center p-4 rounded-2xl bg-slate-800/40 border border-slate-800/50">
                <div className="space-y-2">
                  <div className="h-4 w-40 bg-slate-700 rounded-md" />
                  <div className="h-3 w-24 bg-slate-700 rounded-md" />
                </div>
                <div className="h-8 w-16 bg-slate-700 rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
