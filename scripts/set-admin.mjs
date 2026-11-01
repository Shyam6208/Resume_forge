import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });
dotenv.config({ path: resolve(process.cwd(), ".env") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("❌ Missing Supabase credentials in .env.local / .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const email = process.argv[2];

if (!email) {
  console.log("Usage: node scripts/set-admin.mjs <user-email>");
  process.exit(0);
}

async function run() {
  const targetEmail = email.trim().toLowerCase();
  console.log(`🔍 Searching for profile with email: ${targetEmail}...`);

  const { data, error } = await supabase
    .from("profiles")
    .update({ is_admin: true, role: "admin" })
    .ilike("email", targetEmail)
    .select();

  if (error) {
    console.error("❌ Error granting admin:", error);
  } else if (!data || data.length === 0) {
    console.log(`⚠️ No profile found matching email: ${targetEmail}`);
    console.log("Checking Supabase auth users...");
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const user = users.find((u) => u.email?.toLowerCase() === targetEmail);
    if (user) {
      console.log(`Found auth user ${user.id}. Creating profile with admin rights...`);
      const { data: newProfile, error: insertErr } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          email: user.email,
          name: user.user_metadata?.full_name || user.email?.split("@")[0],
          is_admin: true,
          role: "admin",
          is_guest: false,
        })
        .select();
      if (insertErr) {
        console.error("❌ Could not insert profile:", insertErr);
      } else {
        console.log(`✅ Created profile with admin rights for: ${newProfile[0].email}`);
      }
    } else {
      console.log(`❌ No registered user found with email: ${targetEmail}`);
    }
  } else {
    console.log(`✅ Successfully granted admin access to: ${data[0].email}`);
  }
}

run();

