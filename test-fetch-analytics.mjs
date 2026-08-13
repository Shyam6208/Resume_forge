async function check() {
  console.log("Fetching /api/admin/analytics...");
  try {
    const res = await fetch("http://localhost:3000/api/admin/analytics?days=30");
    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Body:", text);
  } catch (err) {
    console.error("Error:", err);
  }
}
check();
