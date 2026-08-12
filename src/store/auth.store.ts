// ============================================================
// ResumeForge — Auth Store (Zustand + Persist)
// ============================================================

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, Session } from "@supabase/supabase-js";
import type { UserType } from "@/types/resume.types";

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userType: UserType | null;
  onboardingCompleted: boolean;
}

interface AuthActions {
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  setUserType: (type: UserType) => void;
  setOnboardingCompleted: (val: boolean) => void;
  resetAuth: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      // State
      user: null,
      session: null,
      loading: true,
      userType: null,
      onboardingCompleted: false,

      // Actions
      setUser: (user) => set({ user }),
      setSession: (session) => set({ session, user: session?.user ?? null }),
      setLoading: (loading) => set({ loading }),
      setUserType: (type) => set({ userType: type }),
      setOnboardingCompleted: (val) => set({ onboardingCompleted: val }),
      resetAuth: () =>
        set({
          user: null,
          session: null,
          loading: false,
          userType: null,
          onboardingCompleted: false,
        }),
    }),
    {
      name: "resumeforge-auth-state",
      partialize: (state) => ({
        userType: state.userType,
        onboardingCompleted: state.onboardingCompleted,
      }),
    }
  )
);
