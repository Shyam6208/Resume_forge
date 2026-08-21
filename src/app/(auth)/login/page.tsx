"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase/client";
import { formatAuthError } from "@/hooks/useAuth";
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

/* Stagger children animation */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
} as const;

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirectTo = searchParams.get("redirectTo") || searchParams.get("redirect") || "/dashboard";

  // Security: only allow local redirects
  const redirectTo = rawRedirectTo.startsWith("/") && !rawRedirectTo.startsWith("//")
    ? rawRedirectTo
    : "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Email + Password Login with Admin Profile Check
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error("Please fill in both email and password.");
      return;
    }

    setIsLoading(true);
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;

      const user = authData.user;
      let targetDestination = redirectTo;

      if (user) {
        // Query public.profiles to determine admin authorization
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

          if (profileByEmail) profile = profileByEmail;
        }

        const isAdmin =
          profile &&
          (profile.is_admin === true ||
            profile.is_admin === "true" ||
            profile.role === "admin");

        if (isAdmin && (redirectTo === "/dashboard" || !searchParams.get("redirectTo"))) {
          targetDestination = "/admin";
        }
      }

      toast.success("Welcome back! Signing in...");
      // Hard location refresh ensures server component cookies are synchronized
      window.location.href = targetDestination;
    } catch (err: unknown) {
      console.error("Login error:", err);
      toast.error(formatAuthError(err));
      setIsLoading(false);
    }
  };

  // Google OAuth Login
  const handleGoogleLogin = async () => {
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
      toast.error(formatAuthError(err));
      setIsGoogleLoading(false);
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-md"
    >
      {/* Glass card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="bg-slate-900/70 backdrop-blur-2xl border border-white/[0.08] rounded-2xl p-7 sm:p-9 shadow-2xl shadow-black/40 space-y-7"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center space-y-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center w-12 h-12 bg-white/[0.05] rounded-xl border border-white/[0.08] text-indigo-400 font-bold text-sm hover:bg-white/[0.08] transition-colors"
          >
            RF
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Welcome back
            </h1>
            <p className="text-slate-500 text-xs mt-1">
              Sign in to continue building your resume
            </p>
          </div>
        </motion.div>

        {/* Google OAuth Button */}
        <motion.div variants={itemVariants}>
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading || isLoading}
            className="w-full h-11 flex items-center justify-center gap-3 bg-white text-slate-900 font-semibold text-sm rounded-xl hover:bg-slate-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md active:scale-[0.98]"
          >
            {isGoogleLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-700" />
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
                <span>Continue with Google</span>
              </>
            )}
          </button>
        </motion.div>

        {/* Divider */}
        <motion.div variants={itemVariants} className="flex items-center gap-3">
          <div className="flex-1 h-px bg-white/[0.06]" />
          <span className="text-[10px] font-medium text-slate-600 uppercase tracking-wider">
            or
          </span>
          <div className="flex-1 h-px bg-white/[0.06]" />
        </motion.div>

        {/* Email + Password Form */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          {/* Email */}
          <motion.div variants={itemVariants} className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400">Email</label>
            <div className="relative">
              <Mail
                className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
                  focusedField === "email" ? "text-indigo-400" : "text-slate-600"
                }`}
              />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField(null)}
                className="w-full h-11 pl-10 pr-4 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/30 transition-all duration-200"
                required
              />
            </div>
          </motion.div>

          {/* Password */}
          <motion.div variants={itemVariants} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-400">Password</label>
              <Link
                href="/forgot-password"
                className="text-[11px] text-slate-500 hover:text-indigo-400 font-medium transition-colors"
              >
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <Lock
                className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
                  focusedField === "password" ? "text-indigo-400" : "text-slate-600"
                }`}
              />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField(null)}
                className="w-full h-11 pl-10 pr-10 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/30 transition-all duration-200"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-300 p-1 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </motion.div>

          {/* Submit Button */}
          <motion.div variants={itemVariants}>
            <button
              type="submit"
              disabled={isLoading || isGoogleLoading}
              className="w-full h-11 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </motion.div>
        </form>

        {/* Footer */}
        <motion.div
          variants={itemVariants}
          className="text-center pt-3 border-t border-white/[0.05]"
        >
          <p className="text-xs text-slate-500">
            Don&apos;t have an account?{" "}
            <Link
              href={`/signup${redirectTo !== "/dashboard" ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ""}`}
              className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
            >
              Create one for free
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <LoginFormContent />
    </Suspense>
  );
}
