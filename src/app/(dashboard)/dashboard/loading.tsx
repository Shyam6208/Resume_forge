export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Skeleton Topbar */}
      <div className="h-16 border-b border-slate-800 px-4 sm:px-8 flex items-center justify-between">
        <div className="h-6 w-32 bg-slate-800/80 rounded animate-pulse" />
        <div className="h-9 w-36 bg-slate-800/80 rounded-xl animate-pulse" />
      </div>

      {/* Skeleton Content */}
      <div className="max-w-7xl mx-auto w-full p-4 sm:p-8 space-y-8">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-slate-800/80 rounded animate-pulse" />
          <div className="h-4 w-72 bg-slate-800/50 rounded animate-pulse" />
        </div>

        {/* 3 Card Skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-56 rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4 animate-pulse flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="h-2 w-full bg-slate-800/80 rounded-full" />
                <div className="flex items-center justify-between">
                  <div className="h-8 w-8 bg-slate-800/80 rounded-xl" />
                  <div className="h-4 w-20 bg-slate-800/80 rounded" />
                </div>
                <div className="h-6 w-3/4 bg-slate-800/80 rounded" />
                <div className="h-10 w-full bg-slate-800/50 rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="h-9 bg-slate-800/80 rounded-xl" />
                <div className="h-9 bg-slate-800/80 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
