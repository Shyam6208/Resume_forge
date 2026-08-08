"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react";

export default function EditorError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Editor error boundary caught exception:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-5 shadow-2xl">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white">Could not load editor</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            We were unable to load the requested resume data. You can try refreshing or return to your dashboard.
          </p>
        </div>

        <div className="flex justify-center gap-3 pt-2">
          <Link href="/dashboard">
            <Button
              type="button"
              variant="outline"
              className="h-10 px-5 text-xs bg-slate-800 border-slate-700 text-slate-300 hover:text-white rounded-xl"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              <span>Dashboard</span>
            </Button>
          </Link>

          <Button
            type="button"
            onClick={() => reset()}
            className="h-10 px-5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center gap-1.5"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
