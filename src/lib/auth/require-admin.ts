import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database.types";
import type { User } from "@supabase/supabase-js";

export interface AdminAuthResult {
  user: User;
  profile: Profile;
}

/**
 * Centralized helper to securely fetch and verify admin profile from public.profiles.
 * Checks by user.id first, then falls back to authenticated user.email.
 * public.profiles.is_admin === true is the SINGLE SOURCE OF TRUTH.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getAdminProfile(supabase: any, user: User): Promise<Profile | null> {
  if (!user) return null;

  // 1. Primary lookup by auth.users.id = profiles.id
  let { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  // 2. Secondary fallback lookup by authenticated user.email
  if (!profile && user.email) {
    const { data: profileByEmail } = await supabase
      .from("profiles")
      .select("*")
      .ilike("email", user.email)
      .maybeSingle();

    if (profileByEmail) {
      profile = profileByEmail;

      // Sync id to match user.id if linked by email so future primary lookups succeed
      if (profileByEmail.id !== user.id) {
        try {
          await supabase
            .from("profiles")
            .update({ id: user.id })
            .eq("email", user.email);
        } catch (err) {
          console.warn("Could not sync profile id with auth user.id:", err);
        }
      }
    }
  }

  // Safe server-side diagnostic logging (no passwords or tokens logged)
  console.log("--- ADMIN AUTH DIAGNOSTICS ---");
  console.log("AUTH USER ID:", user.id);
  console.log("AUTH USER EMAIL:", user.email);
  console.log(
    "PROFILE MATCHED:",
    profile
      ? {
          id: profile.id,
          email: profile.email,
          is_admin: profile.is_admin,
          role: profile.role,
        }
      : "NO MATCHING PROFILE IN PUBLIC.PROFILES"
  );

  // 3. Authorization Source of Truth: public.profiles.is_admin === true or role === 'admin'
  const isAdmin =
    profile &&
    (profile.is_admin === true ||
      profile.is_admin === "true" ||
      profile.role === "admin");

  if (isAdmin) {
    return profile as Profile;
  }

  return null;
}

/**
 * Server-side helper to assert admin privileges for API Routes.
 * Returns { user, profile } if valid, or a NextResponse (401/403) if invalid.
 */
export async function requireAdminApi(): Promise<AdminAuthResult | NextResponse> {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in as admin." },
        { status: 401 }
      );
    }

    const adminProfile = await getAdminProfile(supabase, user);

    if (!adminProfile) {
      return NextResponse.json(
        { error: "Forbidden. Admin access required." },
        { status: 403 }
      );
    }

    return { user, profile: adminProfile };
  } catch (err) {
    console.error("requireAdminApi error:", err);
    return NextResponse.json(
      { error: "Internal server error during authorization check." },
      { status: 500 }
    );
  }
}

/**
 * Server-side helper to assert admin privileges for Server Component Pages.
 * 1. If unauthenticated -> redirects to /admin/login?redirectTo=/admin
 * 2. If authenticated but is_admin !== true -> redirects to /dashboard?error=admin_required
 */
export async function requireAdminPage(): Promise<AdminAuthResult> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Case 1: Unauthenticated
  if (!user) {
    redirect("/admin/login?redirectTo=/admin");
  }

  // Case 2: Authenticated — Query profile by user identity
  const adminProfile = await getAdminProfile(supabase, user);

  // Case 3: Not admin -> Redirect to /dashboard with clear error param
  if (!adminProfile) {
    redirect("/dashboard?error=admin_required");
  }

  return { user, profile: adminProfile };
}

/**
 * Log admin activities to public.admin_activity_logs (safe fallback if table missing)
 */
export async function logAdminActivity(
  adminId: string,
  adminEmail: string,
  action: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  details?: any
) {
  try {
    const supabase = await createServerSupabaseClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("admin_activity_logs") as any).insert({
      admin_id: adminId,
      admin_email: adminEmail,
      action,
      details: details || {},
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    console.warn("Could not log admin activity:", err);
  }
}
