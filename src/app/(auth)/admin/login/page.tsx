"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { ShieldCheck, Mail, Lock, Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

function AdminLoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirectTo = searchParams.get("redirectTo") || searchParams.get("next") || "/admin";

  // Prevent open redirect vulnerabilities
  const redirectTo =
    rawRedirectTo.startsWith("/") && !rawRedirectTo.startsWith("//")
      ? rawRedirectTo
      : "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Dedicated Admin Email + Password Login
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error("Please enter both email and password.");
      return;
    }

    setIsLoading(true);
    try {
      // 1. Authenticate with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError || !authData.user) {
        toast.error("Invalid email or password.");
        setIsLoading(false);
        return;
      }

      const user = authData.user;

      // 2. Fetch authenticated profile from public.profiles by ID or Email
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let { data: profile } = await (supabase.from("profiles") as any)
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (!profile && user.email) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: profileByEmail } = await (supabase.from("profiles") as any)
          .select("*")
          .ilike("email", user.email)
          .maybeSingle();

        if (profileByEmail) {
          profile = profileByEmail;
        }
      }

      const isAdmin =
        profile &&
        (profile.is_admin === true ||
          profile.is_admin === "true" ||
          profile.role === "admin");

      if (!isAdmin) {
        toast.error("You don't have permission to access the admin panel.");
        window.location.href = "/dashboard?error=admin_required";
        return;
      }

      toast.success("Admin authorization successful! Entering portal...");

      // Force full location redirect to ensure SSR cookies are properly synchronized
      window.location.href = redirectTo;
    } catch (err: unknown) {
      console.error("Admin login error:", err);
      toast.error("Invalid email or password.");
      setIsLoading(false);
    }
  };

  // Google OAuth Login for Admin
  const handleGoogleAdminLogin = async () => {
    setIsGoogleLoading(true);
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const targetRedirect = `${origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: targetRedirect,
        },
      });

      if (error) throw error;
    } catch (err: unknown) {
      console.error("Google login error:", err);
      toast.error("Failed to initiate Google OAuth.");
      setIsGoogleLoading(false);
    }
  };

  // Forgot Password Reset Trigger
  const handleForgotPassword = async () => {
    if (!email.trim()) {
      toast.error("Please enter your admin email address first.");
      return;
    }

    setIsResetLoading(true);
    try {
      const origin =
        typeof window !== "undefined"
          ? window.location.origin
          : process.env.NEXT_PUBLIC_APP_URL || "https://resume-forge12.vercel.app";

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${origin}/reset-password`,
      });

      if (error) throw error;

      toast.success("Password reset email sent! Check your inbox.");
    } catch (err: unknown) {
      console.error("Password reset error:", err);
      toast.error("Could not send password reset email.");
    } finally {
      setIsResetLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600/20 rounded-2xl border border-indigo-500/30 text-indigo-400 font-bold shadow-lg mx-auto">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          ResumeForge Admin Portal
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm">
          Sign in with your authorized admin credentials
        </p>
      </div>

      {/* Primary Email + Password Login Form */}
      <form onSubmit={handleAdminLogin} className="space-y-4">
        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">Admin Email</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              placeholder="admin.resumeforage@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 pl-10 pr-4 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs sm:text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              required
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300">Password</label>
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={isResetLoading}
              className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
            >
              {isResetLoading ? "Sending reset email..." : "Forgot Password?"}
            </button>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-11 pl-10 pr-10 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs sm:text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || isGoogleLoading}
          className="w-full h-11 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm rounded-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <span>Sign In to Admin Portal</span>
          )}
        </button>
      </form>

      <div className="relative flex items-center justify-center">
        <div className="border-t border-slate-800 w-full" />
        <span className="bg-slate-900 px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider absolute">
          or
        </span>
      </div>

      {/* Google OAuth Option */}
      <button
        type="button"
        onClick={handleGoogleAdminLogin}
        disabled={isGoogleLoading || isLoading}
        className="w-full h-11 flex items-center justify-center gap-3 px-4 bg-slate-950 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm rounded-xl border border-slate-800 transition-colors"
      >
        {isGoogleLoading ? (
          <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
        ) : (
          <>
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                fill="#EA4335"
              />
            </svg>
            <span>Continue with Admin Google Account</span>
          </>
        )}
      </button>

      {/* Footer Navigation */}
      <div className="pt-2 text-center border-t border-slate-800">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to ResumeForge</span>
        </Link>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 selection:bg-indigo-500 selection:text-white">
      <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
        <AdminLoginFormContent />
      </Suspense>
    </div>
  );
}
