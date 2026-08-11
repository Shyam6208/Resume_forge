"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowLeft, RefreshCw, LogIn } from "lucide-react";

interface EditorErrorProps {
  error: Error & { digest?: string; status?: number };
  reset: () => void;
}

export default function EditorError({ error, reset }: EditorErrorProps) {
  useEffect(() => {
    // Development & debugging console logging
    console.error("Editor error boundary caught exception:", {
      message: error.message,
      name: error.name,
      digest: error.digest,
      status: error.status,
      stack: error.stack,
    });
  }, [error]);

  // Determine user-facing error message based on error status/message
  const message = error.message || "";
  let userTitle = "Could not load editor";
  let userDescription = "We were unable to load the requested resume data. You can try refreshing or return to your dashboard.";
  let isAuthError = false;

  if (message.includes("401") || message.toLowerCase().includes("session") || message.toLowerCase().includes("sign in")) {
    userTitle = "Session Expired";
    userDescription = "Your session has expired. Please sign in again to access this resume.";
    isAuthError = true;
  } else if (message.includes("403") || message.toLowerCase().includes("permission")) {
    userTitle = "Access Forbidden";
    userDescription = "You don't have permission to access this resume.";
  } else if (message.includes("404") || message.toLowerCase().includes("not found")) {
    userTitle = "Resume Not Found";
    userDescription = "The requested resume could not be found or has been deleted.";
  } else if (message.includes("405") || message.toLowerCase().includes("method not allowed")) {
    userTitle = "Configuration Error";
    userDescription = "Resume API configuration error. Please contact support if this persists.";
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-5 shadow-2xl">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white">{userTitle}</h2>
          <p className="text-xs text-slate-400 leading-relaxed">{userDescription}</p>
        </div>

        <div className="flex justify-center gap-3 pt-2">
          {isAuthError ? (
            <Link href="/login">
              <Button
                type="button"
                className="h-10 px-5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center gap-1.5"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In Again</span>
              </Button>
            </Link>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
