"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase/client";
import { PhotoUpload } from "@/components/forms/PhotoUpload";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Mail, ShieldCheck, Save, Loader2, Calendar } from "lucide-react";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const [fullName, setFullName] = useState(
    () => user?.user_metadata?.full_name || user?.user_metadata?.name || ""
  );
  const [photoUrl, setPhotoUrl] = useState(
    () =>
      user?.user_metadata?.avatar_url ||
      user?.user_metadata?.picture ||
      user?.user_metadata?.avatar ||
      user?.user_metadata?.photoUrl ||
      ""
  );
  const [prevUserId, setPrevUserId] = useState(user?.id);
  const [isSaving, setIsSaving] = useState(false);

  // Sync state if user changes
  if (user && user.id !== prevUserId) {
    setPrevUserId(user.id);
    setFullName(user.user_metadata?.full_name || user.user_metadata?.name || "");
    setPhotoUrl(
      user.user_metadata?.avatar_url ||
      user.user_metadata?.picture ||
      user.user_metadata?.avatar ||
      user.user_metadata?.photoUrl ||
      ""
    );
  }

  useEffect(() => {
    if (!user) return;
    let isCancelled = false;

    // Check profiles table for updated avatar
    supabase
      .from("profiles")
      .select("name, avatar_url")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (isCancelled) return;
        const profile = data as { name?: string | null; avatar_url?: string | null } | null;
        if (profile) {
          if (profile.name) setFullName(profile.name);
          if (profile.avatar_url) setPhotoUrl(profile.avatar_url);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: fullName.trim(),
          avatar_url: photoUrl,
        },
      });

      if (error) throw error;

      // Also update profiles table in Supabase
      await (supabase.from("profiles") as any)
        .update({
          name: fullName.trim(),
          avatar_url: photoUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      toast.success("Profile updated successfully!");
    } catch (err: unknown) {
      console.error("Profile update error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const createdAt = user.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Unknown";

  const provider = user.app_metadata?.provider || "email";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 w-full h-16 bg-slate-950/90 backdrop-blur border-b border-slate-800 px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        <span className="text-sm font-bold text-white">My Profile</span>
      </header>

      {/* Main Container */}
      <main className="max-w-2xl mx-auto w-full flex-1 p-4 sm:p-8 space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Account & Profile Settings
          </h1>
          <p className="text-xs text-slate-400">
            Manage your personal profile information and profile photo.
          </p>
        </div>

        {/* Profile Card */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
          {/* Photo Upload */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300">Profile Photo</label>
            <PhotoUpload
              userId={user.id}
              currentPhotoUrl={photoUrl}
              onUploadSuccess={(url) => setPhotoUrl(url)}
              onRemovePhoto={() => setPhotoUrl("")}
            />
          </div>

          {/* Form */}
          <form onSubmit={handleSaveProfile} className="space-y-4 pt-2">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full h-11 pl-10 pr-4 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs sm:text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                  required
                />
              </div>
            </div>

            {/* Email Address (Read-only) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Email Address <span className="text-[10px] text-slate-500 font-normal">(Managed by Provider)</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={user.email || ""}
                  disabled
                  className="w-full h-11 pl-10 pr-4 bg-slate-950/60 border border-slate-800/80 rounded-xl text-slate-400 text-xs sm:text-sm cursor-not-allowed"
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSaving}
              className="h-11 px-6 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg flex items-center gap-2"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>Save Profile Changes</span>
            </Button>
          </form>
        </div>

        {/* Account Meta Info */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Account Metadata
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800/80">
              <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-500 font-medium">Joined Date</p>
                <p className="font-semibold text-white">{createdAt}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800/80">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-500 font-medium">Authentication</p>
                <p className="font-semibold text-white capitalize">{provider}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
