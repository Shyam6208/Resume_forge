export function AdminAnalyticsSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800/50 pb-6">
        <div className="space-y-2.5">
          <div className="flex items-center gap-3">
            <div className="relative overflow-hidden h-8 w-48 bg-slate-800/60 rounded-lg">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-700/30 to-transparent" style={{ animation: "admin-skeleton-shimmer 2s infinite" }} />
            </div>
            <div className="relative overflow-hidden h-6 w-14 bg-emerald-500/10 rounded-full border border-emerald-500/20">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400/10 to-transparent" style={{ animation: "admin-skeleton-shimmer 2s infinite 0.2s" }} />
            </div>
          </div>
          <div className="relative overflow-hidden h-4 w-64 bg-slate-800/40 rounded-md">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-700/30 to-transparent" style={{ animation: "admin-skeleton-shimmer 2s infinite 0.3s" }} />
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="relative overflow-hidden h-11 w-64 bg-slate-900/60 rounded-2xl border border-slate-800/50">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-700/20 to-transparent" style={{ animation: "admin-skeleton-shimmer 2s infinite 0.4s" }} />
          </div>
          <div className="h-3 w-40 bg-slate-800/30 rounded-md" />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          "from-indigo-500/10 to-violet-500/10 border-indigo-500/15",
          "from-violet-500/10 to-purple-500/10 border-violet-500/15",
          "from-emerald-500/10 to-teal-500/10 border-emerald-500/15",
          "from-pink-500/10 to-rose-500/10 border-pink-500/15",
        ].map((gradient, i) => (
          <div
            key={i}
            className={`relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br ${gradient} border shadow-xl`}
            style={{ animation: "admin-slide-in-up 0.5s ease-out both", animationDelay: `${i * 0.08}s` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent" style={{ animation: "admin-skeleton-shimmer 2.5s infinite", animationDelay: `${i * 0.2}s` }} />
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <div className="h-4 w-20 bg-slate-700/40 rounded-md" />
                <div className="h-8 w-14 bg-slate-700/40 rounded-md" />
                <div className="h-3 w-16 bg-slate-700/30 rounded-md" />
              </div>
              <div className="w-14 h-14 rounded-xl bg-slate-700/30 border border-slate-700/30" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[0, 1].map(i => (
          <div key={i} className="relative overflow-hidden p-6 rounded-2xl bg-slate-900/60 backdrop-blur-sm border border-slate-800/50 shadow-xl" style={{ animation: "admin-slide-in-up 0.5s ease-out both", animationDelay: `${0.4 + i * 0.08}s` }}>
            <div className="flex items-center justify-between mb-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${i === 0 ? "bg-indigo-400/50" : "bg-violet-400/50"}`} />
                  <div className="h-5 w-28 bg-slate-700/40 rounded-md" />
                </div>
                <div className="h-3 w-40 bg-slate-700/30 rounded-md" />
              </div>
              <div className="w-9 h-9 rounded-lg bg-slate-700/30 border border-slate-700/20" />
            </div>
            <div className="relative overflow-hidden h-48 bg-slate-800/30 rounded-xl">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-700/15 to-transparent" style={{ animation: "admin-skeleton-shimmer 2.5s infinite", animationDelay: `${i * 0.3}s` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Rows */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[0, 1].map(section => (
          <div key={section} className="p-6 rounded-2xl bg-slate-900/60 backdrop-blur-sm border border-slate-800/50 shadow-xl" style={{ animation: "admin-slide-in-up 0.5s ease-out both", animationDelay: `${0.6 + section * 0.08}s` }}>
            <div className="flex items-center gap-2 mb-5">
              <div className="w-9 h-9 rounded-lg bg-slate-700/30 border border-slate-700/20" />
              <div className="h-5 w-32 bg-slate-700/40 rounded-md" />
            </div>
            <div className="space-y-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex justify-between items-center p-4 rounded-xl bg-slate-800/30 border border-slate-800/30">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-md bg-slate-700/40" />
                    <div className="h-4 w-32 bg-slate-700/30 rounded-md" />
                  </div>
                  <div className="h-5 w-10 bg-slate-700/30 rounded-md" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Rows */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[0, 1].map(section => (
          <div key={section} className="p-6 rounded-2xl bg-slate-900/60 backdrop-blur-sm border border-slate-800/50 shadow-xl" style={{ animation: "admin-slide-in-up 0.5s ease-out both", animationDelay: `${0.8 + section * 0.08}s` }}>
            <div className="flex items-center gap-2 mb-5">
              <div className="w-9 h-9 rounded-lg bg-slate-700/30 border border-slate-700/20" />
              <div className="h-5 w-36 bg-slate-700/40 rounded-md" />
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex justify-between items-center p-4 rounded-xl bg-slate-800/30 border border-slate-800/30">
                  <div className="space-y-2">
                    <div className="h-4 w-28 bg-slate-700/30 rounded-md" />
                    <div className="h-3 w-36 bg-slate-700/20 rounded-md" />
                  </div>
                  <div className="h-8 w-16 bg-slate-700/30 rounded-xl" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
