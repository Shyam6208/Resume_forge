import { Settings, ShieldCheck, Database, Cloud } from "lucide-react";

export const dynamic = "force-dynamic";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Admin Settings & Configuration
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          System overview and integration credentials status.
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Database Status Card */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Supabase Database</h3>
              <p className="text-xs text-slate-400">Connected & Authorized</p>
            </div>
          </div>
          <div className="space-y-2 text-xs text-slate-400 pt-2 border-t border-slate-800">
            <p>
              • Table: <code className="text-indigo-300">public.resume_templates</code>
            </p>
            <p>
              • Authorization: <code className="text-indigo-300">public.profiles.is_admin = true</code>
            </p>
          </div>
        </div>

        {/* Cloudinary Status Card */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Cloudinary Storage</h3>
              <p className="text-xs text-slate-400">Server-Side Signed Uploads</p>
            </div>
          </div>
          <div className="space-y-2 text-xs text-slate-400 pt-2 border-t border-slate-800">
            <p>• Preview Folder: <code className="text-purple-300">resumeforge/templates/previews/</code></p>
            <p>• Config Folder: <code className="text-purple-300">resumeforge/templates/configs/</code></p>
          </div>
        </div>
      </div>
    </div>
  );
}
