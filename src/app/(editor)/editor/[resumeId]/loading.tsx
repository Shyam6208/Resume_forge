export default function EditorLoading() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Topbar Skeleton */}
      <div className="h-16 border-b border-slate-800 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-24 bg-slate-800/80 rounded-xl animate-pulse" />
          <div className="h-6 w-48 bg-slate-800/80 rounded animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-24 bg-slate-800/80 rounded-xl animate-pulse" />
          <div className="h-9 w-24 bg-slate-800/80 rounded-xl animate-pulse" />
        </div>
      </div>

      {/* Editor Split Columns Skeleton */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2">
        {/* Left Form Panel Skeleton */}
        <div className="p-6 border-r border-slate-800 space-y-6 animate-pulse">
          <div className="h-10 w-full bg-slate-900 border border-slate-800 rounded-xl" />
          <div className="space-y-4">
            <div className="h-6 w-36 bg-slate-800/80 rounded" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-10 bg-slate-900 border border-slate-800 rounded-xl" />
              <div className="h-10 bg-slate-900 border border-slate-800 rounded-xl" />
            </div>
            <div className="h-24 bg-slate-900 border border-slate-800 rounded-xl" />
          </div>
          <div className="space-y-4 pt-4">
            <div className="h-6 w-48 bg-slate-800/80 rounded" />
            <div className="h-32 bg-slate-900 border border-slate-800 rounded-xl" />
          </div>
        </div>

        {/* Right Preview Panel Skeleton */}
        <div className="hidden lg:flex p-6 bg-slate-900/40 items-center justify-center animate-pulse">
          <div className="w-[500px] h-[700px] bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6 shadow-2xl">
            <div className="h-12 w-1/2 bg-slate-800/80 rounded mx-auto" />
            <div className="h-4 w-1/3 bg-slate-800/60 rounded mx-auto" />
            <div className="h-0.5 w-full bg-slate-800" />
            <div className="space-y-3">
              <div className="h-4 w-full bg-slate-800/80 rounded" />
              <div className="h-4 w-5/6 bg-slate-800/80 rounded" />
              <div className="h-4 w-3/4 bg-slate-800/60 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
