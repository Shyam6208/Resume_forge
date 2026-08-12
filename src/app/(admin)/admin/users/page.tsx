import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Users, ShieldCheck, User } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const supabase = await createServerSupabaseClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let users: any[] = [];

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: rawUsers } = await (supabase.from("profiles") as any)
      .select("*")
      .order("created_at", { ascending: false });

    if (rawUsers && Array.isArray(rawUsers)) {
      users = rawUsers;
    }
  } catch (err) {
    console.warn("Could not fetch user profiles for admin user list:", err);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>User Management</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-semibold">
              {users.length}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Registered user profiles and administrator privileges.
          </p>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
        {users.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <Users className="w-8 h-8 text-indigo-400 mx-auto" />
            <p className="text-sm font-bold text-white">No user profiles found</p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">User Type</th>
                  <th className="p-4">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {users.map((u) => {
                  const isAdmin = Boolean(u.is_admin);
                  const isGuest = Boolean(u.is_guest);
                  const name = u.name || u.username || u.email?.split("@")[0] || "User";
                  const createdAt = u.created_at
                    ? new Date(u.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "—";

                  return (
                    <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden">
                            {u.avatar_url ? (
                              <img src={u.avatar_url} alt={name} className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-4 h-4" />
                            )}
                          </div>
                          <span className="font-bold text-white">{name}</span>
                        </div>
                      </td>

                      <td className="p-4 text-slate-300 font-mono">{u.email || "—"}</td>

                      <td className="p-4">
                        {isAdmin ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                            <ShieldCheck className="w-3 h-3 text-emerald-400" />
                            <span>Administrator</span>
                          </span>
                        ) : isGuest ? (
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                            Guest
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                            User
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-slate-400 capitalize">{u.user_type || "General"}</td>

                      <td className="p-4 text-slate-400">{createdAt}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
