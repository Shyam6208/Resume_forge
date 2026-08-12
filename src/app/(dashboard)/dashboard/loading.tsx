export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Skeleton Top Header */}
      <header className="sticky top-0 z-30 w-full h-16 bg-slate-950/90 backdrop-blur border-b border-slate-800 px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-slate-800 animate-pulse motion-reduce:animate-none" />
            <div className="w-28 h-5 bg-slate-800 rounded animate-pulse motion-reduce:animate-none" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:block w-32 h-7 bg-slate-800 rounded-full animate-pulse motion-reduce:animate-none" />
        </div>
      </header>

      {/* Main Content Area Skeleton */}
      <main className="max-w-7xl mx-auto w-full flex-1 p-4 sm:p-6 lg:p-8 space-y-8">
        
        {/* Page Title & Top CTA Skeleton */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-3">
              <div className="h-8 w-48 bg-slate-800 rounded-lg animate-pulse motion-reduce:animate-none" />
              <div className="h-4 w-72 max-w-full bg-slate-800/50 rounded animate-pulse motion-reduce:animate-none" />
            </div>
            <div className="h-10 w-full sm:w-44 bg-indigo-600/20 rounded-xl animate-pulse motion-reduce:animate-none shrink-0" />
          </div>

          {/* Stats Row Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            {[1, 2, 3].map((i) => (
              <div key={`stat-${i}`} className={`bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex items-center gap-4 ${i === 3 ? 'hidden md:flex' : ''}`}>
                <div className="w-10 h-10 rounded-xl bg-slate-800 animate-pulse motion-reduce:animate-none shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-3 w-20 bg-slate-800 rounded animate-pulse motion-reduce:animate-none" />
                  <div className="h-6 w-12 bg-slate-800 rounded animate-pulse motion-reduce:animate-none" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Toolbar Skeleton */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 h-10 bg-slate-900 border border-slate-800 rounded-xl animate-pulse motion-reduce:animate-none" />
          <div className="flex items-center gap-2">
            <div className="w-24 h-10 bg-slate-900 border border-slate-800 rounded-xl animate-pulse motion-reduce:animate-none shrink-0" />
            <div className="w-24 h-10 bg-slate-900 border border-slate-800 rounded-xl animate-pulse motion-reduce:animate-none shrink-0" />
          </div>
        </div>

        {/* Card Grid Skeleton: 3 desktop, 2 tablet, 1 mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {[1, 2, 3].map((i) => (
            <div key={`card-${i}`} className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden flex flex-col h-[340px]">
              {/* Top Visual Preview Placeholder */}
              <div className="h-32 bg-slate-950 border-b border-slate-800 flex items-center justify-center relative">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none" />
                <div className="w-12 h-16 bg-slate-800 rounded-sm animate-pulse motion-reduce:animate-none" />
                <div className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-slate-800/50 animate-pulse motion-reduce:animate-none" />
                <div className="absolute bottom-3 left-4 w-20 h-5 rounded-md bg-slate-800 animate-pulse motion-reduce:animate-none" />
              </div>
              
              {/* Card Content Skeleton */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="h-5 w-3/4 bg-slate-800 rounded animate-pulse motion-reduce:animate-none" />
                    <div className="flex items-center justify-between">
                      <div className="h-3 w-1/2 bg-slate-800/50 rounded animate-pulse motion-reduce:animate-none" />
                      <div className="h-3 w-16 bg-slate-800/30 rounded animate-pulse motion-reduce:animate-none shrink-0" />
                    </div>
                  </div>
                  
                  {/* ATS Progress Bar Skeleton */}
                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between items-center">
                      <div className="h-3 w-16 bg-slate-800 rounded animate-pulse motion-reduce:animate-none" />
                      <div className="h-4 w-12 bg-slate-800 rounded-full animate-pulse motion-reduce:animate-none" />
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full w-2/3 bg-slate-700 rounded-full animate-pulse motion-reduce:animate-none" />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Card Buttons Skeleton */}
              <div className="p-5 pt-0 grid grid-cols-2 gap-3">
                <div className="h-10 bg-slate-800 rounded-xl animate-pulse motion-reduce:animate-none" />
                <div className="h-10 bg-indigo-600/20 rounded-xl animate-pulse motion-reduce:animate-none" />
              </div>
            </div>
          ))}
        </div>
      </main>
      
      {/* Footer Skeleton */}
      <footer className="w-full border-t border-slate-800/80 p-4 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="h-3 w-48 bg-slate-800/50 rounded animate-pulse motion-reduce:animate-none" />
          <div className="flex gap-4">
            <div className="h-3 w-20 bg-slate-800/50 rounded animate-pulse motion-reduce:animate-none" />
            <div className="h-3 w-20 bg-slate-800/50 rounded animate-pulse motion-reduce:animate-none" />
          </div>
        </div>
      </footer>
    </div>
  );
}
