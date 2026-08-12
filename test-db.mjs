import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });
dotenv.config({ path: resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function run() {
  console.log("--- Checking Resumes Table Schema ---");
  // Try to insert a dummy record and see what fails, or just get a row.
  const { data, error } = await supabase.from('resumes').select('*').limit(1);
  if (error) {
    console.error("Error fetching resumes:", error);
  } else {
    console.log("Successfully fetched a resume. Columns:");
    if (data && data.length > 0) {
      console.log(Object.keys(data[0]).map(k => `${k}: ${typeof data[0][k]}`).join('\n'));
    } else {
      console.log("Table is empty.");
    }
  }

  // Get a user
  const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
  if (authError || !users || users.length === 0) {
    console.log("No users found or error:", authError);
    return;
  }
  const user = users[0];
  console.log(`Using test user: ${user.id} (${user.email})`);

  console.log("\n--- Testing INSERT ---");
  const testId = crypto.randomUUID();
  const insertPayload = {
    id: testId,
    user_id: user.id,
    title: "Test Resume " + Date.now(),
    slug: "test-resume-" + Date.now(),
    template_id: "minimal-white",
    data: { test: true },
    is_public: false
  };
  
  const { data: insertData, error: insertErr } = await supabase.from('resumes').insert(insertPayload).select();
  if (insertErr) {
    console.error("INSERT Error:", insertErr);
  } else {
    console.log("INSERT Success:", insertData[0].id);
  }

  console.log("\n--- Testing UPDATE ---");
  const { data: updateData, error: updateErr } = await supabase.from('resumes').update({ title: "Updated Title" }).eq('id', testId).select();
  if (updateErr) {
    console.error("UPDATE Error:", updateErr);
  } else {
    console.log("UPDATE Success:", updateData[0].title);
  }

  // Cleanup
  await supabase.from('resumes').delete().eq('id', testId);
  console.log("Cleanup done.");
}

run();
