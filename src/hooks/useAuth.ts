"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/auth.store";
import { useResumeStore } from "@/store/resume.store";
import { useOptimizationStore } from "@/store/optimization.store";
import type { User, Session } from "@supabase/supabase-js";
import toast from "react-hot-toast";

// Friendly error message translation
export function formatAuthError(error: unknown): string {
  if (!error) return "An unexpected error occurred.";
  const msg = error instanceof Error ? error.message : String(error);

  if (msg.includes("Invalid login credentials") || msg.includes("invalid_credentials")) {
    return "Email or password is incorrect.";
  }
  if (msg.includes("User already registered") || msg.includes("user_already_exists")) {
    return "An account with this email already exists.";
  }
  if (msg.includes("Password should be at least")) {
    return "Password must be at least 6 characters long.";
  }
  if (msg.includes("Email not confirmed")) {
    return "Please check your email to verify your account.";
  }
  if (msg.includes("Auth session missing") || msg.includes("JWT expired")) {
    return "Your session has expired. Please sign in again.";
  }

  return msg;
}

export function useAuth() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const session = useAuthStore((s) => s.session);
  const loading = useAuthStore((s) => s.loading);
  const setUser = useAuthStore((s) => s.setUser);
  const setSession = useAuthStore((s) => s.setSession);
  const setLoading = useAuthStore((s) => s.setLoading);
  const resetAuth = useAuthStore((s) => s.resetAuth);

  useEffect(() => {
    let isMounted = true;

    // Get active session on mount
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      if (isMounted) {
        setSession(initialSession);
        setLoading(false);
      }
    });

    // Listen to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (isMounted) {
        setSession(currentSession);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [setSession, setLoading]);

  // Sign in with Google OAuth
  const signInWithGoogle = useCallback(async (redirectTo?: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const targetRedirect = redirectTo
      ? `${origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`
      : `${origin}/auth/callback`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: targetRedirect,
      },
    });

    if (error) {
      toast.error(formatAuthError(error));
      throw error;
    }
  }, []);

  // Sign Out
  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn("Sign out warning:", err);
    } finally {
      // Clear client Zustand stores
      resetAuth();
      useResumeStore.getState().clearResume();
      useOptimizationStore.getState().resetAll();
      toast.success("Signed out successfully");
      router.push("/");
      router.refresh();
    }
  }, [resetAuth, router]);

  return {
    user,
    session,
    loading,
    isLoading: loading,
    isGuest: user?.is_anonymous ?? false,
    isAuthenticated: !!user,
    signInWithGoogle,
    signOut,
  };
}
