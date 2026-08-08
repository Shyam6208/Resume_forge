"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { FileText, Mail, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isMagicLinkLoading, setIsMagicLinkLoading] = useState(false);
  const [isGuestLoading, setIsGuestLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  // --- Google OAuth ---
  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin + "/auth/callback",
        },
      });
      if (error) throw error;
    } catch (err: unknown) {
      console.error("Google login error:", err);
      toast.error("Google sign-in failed. Please try again.");
      setIsGoogleLoading(false);
    }
  };

  // --- Magic Link ---
  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your email address.");
      return;
    }

    setIsMagicLinkLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: window.location.origin + "/auth/callback",
        },
      });
      if (error) throw error;
      setMagicLinkSent(true);
      toast.success("Magic link sent! Check your email.");
    } catch (err: unknown) {
      console.error("Magic link error:", err);
      toast.error("Failed to send magic link. Please check your email and try again.");
    } finally {
      setIsMagicLinkLoading(false);
    }
  };

  // --- Guest ---
  const handleGuestLogin = async () => {
    setIsGuestLoading(true);
    try {
      const { error } = await supabase.auth.signInAnonymously();
      if (error) throw error;
      router.push("/onboarding");
    } catch (err: unknown) {
      console.error("Guest login error:", err);
      toast.error("Guest login failed. Redirecting to onboarding...");
      router.push("/onboarding");
    } finally {
      setIsGuestLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-500/20 rounded-2xl mb-4 border border-indigo-500/30">
            <FileText className="w-7 h-7 text-indigo-400" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Welcome to ResumeForge
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1.5">
            Build professional resumes in minutes — completely free
          </p>
        </div>

        {/* Google Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isGoogleLoading}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white text-slate-900 font-semibold text-xs sm:text-sm rounded-xl hover:bg-slate-100 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
        >
          {isGoogleLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
          )}
          <span>Continue with Google</span>
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-slate-800" />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            or
          </span>
          <div className="flex-1 h-px bg-slate-800" />
        </div>

        {/* Magic Link Form */}
        {magicLinkSent ? (
          <div className="text-center py-4 px-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <Mail className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <p className="text-emerald-300 font-bold text-sm">Check your email!</p>
            <p className="text-slate-400 text-xs mt-1">
              We sent a magic link to{" "}
              <span className="text-white font-semibold">{email}</span>
            </p>
            <button
              type="button"
              onClick={() => setMagicLinkSent(false)}
              className="text-indigo-400 text-xs mt-3 hover:text-indigo-300 transition-colors"
            >
              Use a different email
            </button>
          </div>
        ) : (
          <form onSubmit={handleMagicLink} className="space-y-3">
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs sm:text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
              required
            />
            <button
              type="submit"
              disabled={isMagicLinkLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm rounded-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-md"
            >
              {isMagicLinkLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Mail className="w-4 h-4" />
              )}
              <span>Send Magic Link ✨</span>
            </button>
          </form>
        )}

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-slate-800" />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            or
          </span>
          <div className="flex-1 h-px bg-slate-800" />
        </div>

        {/* Guest Button */}
        <button
          type="button"
          onClick={handleGuestLogin}
          disabled={isGuestLoading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-transparent text-slate-300 font-semibold text-xs sm:text-sm rounded-xl border border-slate-800 hover:border-slate-700 hover:text-white transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isGuestLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <span>👤</span>
          )}
          <span>Continue as Guest — No signup needed</span>
        </button>

        {/* Bottom Text */}
        <p className="text-center text-slate-500 text-[11px] mt-6">
          No credit card required. No watermark. 100% free.
        </p>
      </div>
    </div>
  );
}
