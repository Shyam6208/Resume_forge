import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

/**
 * Creates a Supabase client using the Service Role Key.
 * This client BYPASSES Row Level Security (RLS) and has full database access.
 * 
 * ONLY use this for trusted server-side admin operations (e.g., admin CRUD routes).
 * NEVER expose this client or its key to the browser.
 * 
 * If the service role key is not configured, throws a descriptive error.
 */
export function createAdminSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not configured.");
  }

  if (!serviceKey || serviceKey === "your_supabase_service_role_key_here") {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not configured. " +
      "Set it in .env or .env.local to enable admin database operations. " +
      "Find it in Supabase Dashboard → Settings → API → service_role key."
    );
  }

  return createClient<Database>(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
