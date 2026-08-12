import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAdminProfile } from "@/lib/auth/require-admin";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next") || searchParams.get("redirectTo");

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const adminProfile = await getAdminProfile(supabase, user);

        // If nextParam was explicitly provided (e.g. /admin), use it if valid
        if (
          nextParam &&
          nextParam.startsWith("/") &&
          !nextParam.startsWith("//") &&
          nextParam !== "/dashboard"
        ) {
          return NextResponse.redirect(`${origin}${nextParam}`);
        }

        // If user is admin and no explicit non-dashboard target was passed, redirect directly to /admin
        if (adminProfile) {
          return NextResponse.redirect(`${origin}/admin`);
        }
      }

      // Default redirect for normal users
      const safeNext =
        nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//")
          ? nextParam
          : "/dashboard";
      return NextResponse.redirect(`${origin}${safeNext}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
