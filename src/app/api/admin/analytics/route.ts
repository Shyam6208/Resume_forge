import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export interface TimeSeriesPoint {
  date: string; // YYYY-MM-DD
  count: number;
}

export interface TemplateUsage {
  templateId: string;
  count: number;
  percentage: number;
}

export interface TopDownloadedResume {
  id: string;
  title: string;
  ownerName: string;
  downloadCount: number;
}

export interface RecentResume {
  id: string;
  title: string;
  ownerName: string;
  createdAt: string;
}

export interface UserByResumeCount {
  name: string;
  email: string;
  count: number;
}

export interface AdminAnalyticsData {
  totalUsers: number;
  totalResumes: number;
  totalDownloads: number;
  templatesUsed: number;
  
  newUsers: number;
  registeredUsers: number;
  guestUsers: number;
  adminUsers: number;
  
  newResumes: number;
  publicResumes: number;
  privateResumes: number;
  avgResumesPerUser: number;
  
  resumesWithDownloads: number;
  avgDownloadsPerResume: number;
  
  usersByResumeCount: UserByResumeCount[];
  
  userGrowth: TimeSeriesPoint[];
  resumeCreation: TimeSeriesPoint[];
  
  templateUsage: TemplateUsage[];
  unknownTemplateUsage: number;
  
  topDownloadedResumes: TopDownloadedResume[];
  recentResumes: RecentResume[];

  lastUpdated: string;
  usersWithoutResumes: number;
  resumesWithoutDownloads: number;
  prevNewUsers: number | null;
  prevNewResumes: number | null;
}

/**
 * Helper to generate an array of the last N days (YYYY-MM-DD)
 * Ensures charts don't have gaps for days with 0 activity.
 */
function generateDateRange(days: number): string[] {
  const dates: string[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
}

export async function GET(request: NextRequest) {
  // 1. Authenticate Admin (Server-side)
  const authCheck = await requireAdminApi();
  if (authCheck instanceof NextResponse) {
    return authCheck;
  }

  try {
    const adminSupabase = createAdminSupabaseClient();
    
    // Parse query params
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "30", 10);
    
    const now = new Date();
    
    // Current period
    const cutoffDate = new Date(now);
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoffStr = cutoffDate.toISOString();
    
    // Previous period
    const prevCutoffDate = new Date(cutoffDate);
    prevCutoffDate.setDate(prevCutoffDate.getDate() - days);
    const prevCutoffStr = prevCutoffDate.toISOString();

    // 2. Execute optimal parallel queries
    // NOTE: Avoids N+1, restricts columns fetched to minimum required.
    const profilesCountRes = await adminSupabase.from("profiles").select("*", { count: "exact", head: true });
    if (profilesCountRes.error) console.error("[ADMIN ANALYTICS] profiles count failed:", profilesCountRes.error);

    const guestCountRes = await adminSupabase.from("profiles").select("*", { count: "exact", head: true }).eq("is_guest", true);
    if (guestCountRes.error) console.error("[ADMIN ANALYTICS] guest count failed:", guestCountRes.error);

    const adminCountRes = await adminSupabase.from("profiles").select("*", { count: "exact", head: true }).or("is_admin.eq.true,role.eq.admin");
    if (adminCountRes.error) console.error("[ADMIN ANALYTICS] admin count failed:", adminCountRes.error);

    const resumesCountRes = await adminSupabase.from("resumes").select("*", { count: "exact", head: true });
    if (resumesCountRes.error) console.error("[ADMIN ANALYTICS] resumes count failed:", resumesCountRes.error);

    const resumesAggRes = await adminSupabase.from("resumes").select("template_id, download_count, is_public, user_id");
    if (resumesAggRes.error) console.error("[ADMIN ANALYTICS] resumes agg failed:", resumesAggRes.error);

    const recentProfilesRes = await adminSupabase.from("profiles").select("created_at").gte("created_at", cutoffStr).lt("created_at", now.toISOString());
    if (recentProfilesRes.error) console.error("[ADMIN ANALYTICS] recent profiles failed:", recentProfilesRes.error);

    const recentResumesTrendRes = await adminSupabase.from("resumes").select("created_at").gte("created_at", cutoffStr).lt("created_at", now.toISOString());
    if (recentResumesTrendRes.error) console.error("[ADMIN ANALYTICS] recent resumes trend failed:", recentResumesTrendRes.error);
    
    const prevProfilesCountRes = await adminSupabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", prevCutoffStr).lt("created_at", cutoffStr);
    if (prevProfilesCountRes.error) console.error("[ADMIN ANALYTICS] prev profiles count failed:", prevProfilesCountRes.error);

    const prevResumesCountRes = await adminSupabase.from("resumes").select("*", { count: "exact", head: true }).gte("created_at", prevCutoffStr).lt("created_at", cutoffStr);
    if (prevResumesCountRes.error) console.error("[ADMIN ANALYTICS] prev resumes count failed:", prevResumesCountRes.error);

    const topDownloadedRes = await adminSupabase.from("resumes").select("id, title, download_count, user_id").order("download_count", { ascending: false }).limit(5);
    if (topDownloadedRes.error) console.error("[ADMIN ANALYTICS] top downloaded failed:", topDownloadedRes.error);

    const recentCreatedRes = await adminSupabase.from("resumes").select("id, title, created_at, user_id").order("created_at", { ascending: false }).limit(5);
    if (recentCreatedRes.error) console.error("[ADMIN ANALYTICS] recent resumes failed:", recentCreatedRes.error);

    const totalUsers = profilesCountRes.count || 0;
    const guestUsers = guestCountRes.count || 0;
    const adminUsers = adminCountRes.count || 0;
    const registeredUsers = Math.max(0, totalUsers - guestUsers);
    
    const newUsers = recentProfilesRes.data ? recentProfilesRes.data.length : 0;
    const newResumes = recentResumesTrendRes.data ? recentResumesTrendRes.data.length : 0;
    
    const prevNewUsers = prevProfilesCountRes.count !== null ? prevProfilesCountRes.count : null;
    const prevNewResumes = prevResumesCountRes.count !== null ? prevResumesCountRes.count : null;

    const totalResumes = resumesCountRes.count || 0;
    const resumesAggData = resumesAggRes.data;
    const recentProfiles = recentProfilesRes.data;
    const recentResumesTrend = recentResumesTrendRes.data;
    const topDownloadedData = topDownloadedRes.data;
    const recentCreatedData = recentCreatedRes.data;

    // 3. Process cumulative data (All time)
    let totalDownloads = 0;
    let resumesWithDownloads = 0;
    let publicResumes = 0;
    let privateResumes = 0;
    const usageMap: Record<string, number> = {};
    let unknownTemplateUsage = 0;
    const userResumeCounts: Record<string, number> = {};

    if (resumesAggData) {
      for (const row of resumesAggData as { template_id: string; download_count: number; is_public: boolean; user_id: string }[]) {
        const dCount = typeof row.download_count === "number" ? row.download_count : 0;
        totalDownloads += dCount;
        if (dCount > 0) resumesWithDownloads++;

        if (row.is_public) publicResumes++;
        else privateResumes++;

        const tId = row.template_id;
        if (tId) {
          usageMap[tId] = (usageMap[tId] || 0) + 1;
        } else {
          unknownTemplateUsage++;
        }
        
        if (row.user_id) {
          userResumeCounts[row.user_id] = (userResumeCounts[row.user_id] || 0) + 1;
        }
      }
    }

    const uniqueResumeOwnerCount = Object.keys(userResumeCounts).length;
    const usersWithoutResumes = Math.max(0, totalUsers - uniqueResumeOwnerCount);
    const resumesWithoutDownloads = Math.max(0, totalResumes - resumesWithDownloads);

    const avgResumesPerUser = totalUsers > 0 ? totalResumes / totalUsers : 0;
    const avgDownloadsPerResume = totalResumes > 0 ? totalDownloads / totalResumes : 0;

    const templateUsage: TemplateUsage[] = Object.entries(usageMap).map(([id, count]) => ({
      templateId: id,
      count,
      percentage: totalResumes > 0 ? (count / totalResumes) * 100 : 0
    }));

    const templatesInUseCount = templateUsage.length + (unknownTemplateUsage > 0 ? 1 : 0);

    // 4. Process Time-Series Data (Last X Days)
    const dateRange = generateDateRange(days);
    const userGrowthMap: Record<string, number> = {};
    const resumeTrendMap: Record<string, number> = {};

    dateRange.forEach(date => {
      userGrowthMap[date] = 0;
      resumeTrendMap[date] = 0;
    });

    if (recentProfiles) {
      recentProfiles.forEach(row => {
        const rawDate = (row as any).created_at;
        if (rawDate) {
          const date = String(rawDate).split("T")[0];
          if (userGrowthMap[date] !== undefined) {
            userGrowthMap[date]++;
          }
        }
      });
    }

    if (recentResumesTrend) {
      recentResumesTrend.forEach(row => {
        const rawDate = (row as any).created_at;
        if (rawDate) {
          const date = String(rawDate).split("T")[0];
          if (resumeTrendMap[date] !== undefined) {
            resumeTrendMap[date]++;
          }
        }
      });
    }

    const userGrowth: TimeSeriesPoint[] = dateRange.map(date => ({
      date,
      count: userGrowthMap[date]
    }));

    const resumeTrend: TimeSeriesPoint[] = dateRange.map(date => ({
      date,
      count: resumeTrendMap[date]
    }));

    // 5. Build Top / Recent lists with Owner Names efficiently (prevent N+1)
    const topResumes: TopDownloadedResume[] = [];
    const recentResumes: RecentResume[] = [];
    const ownerIds = new Set<string>();

    if (topDownloadedData) {
      topDownloadedData.forEach(r => {
        if ((r as any).user_id) ownerIds.add((r as any).user_id);
      });
    }
    if (recentCreatedData) {
      recentCreatedData.forEach(r => {
        if ((r as any).user_id) ownerIds.add((r as any).user_id);
      });
    }
    
    // Top 5 users by resume count
    const sortedUsers = Object.entries(userResumeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    sortedUsers.forEach(u => ownerIds.add(u[0]));

    const ownerMap: Record<string, {name: string, email: string}> = {};
    if (ownerIds.size > 0) {
      const { data: owners, error: ownersError } = await adminSupabase
        .from("profiles")
        .select("id, name, email")
        .in("id", Array.from(ownerIds));
      
      if (ownersError) console.error("[ADMIN ANALYTICS] profiles owner lookup failed:", ownersError);
      
      if (owners) {
        owners.forEach((o: any) => {
          ownerMap[o.id] = { 
            name: o.name || "Unknown User", 
            email: o.email || "No email" 
          };
        });
      }
    }

    if (topDownloadedData) {
      for (const row of topDownloadedData as any[]) {
        topResumes.push({
          id: row.id,
          title: row.title || "Untitled",
          downloadCount: typeof row.download_count === "number" ? row.download_count : 0,
          ownerName: ownerMap[row.user_id]?.name || "Unknown User"
        });
      }
    }

    if (recentCreatedData) {
      for (const row of recentCreatedData as any[]) {
        recentResumes.push({
          id: row.id,
          title: row.title || "Untitled",
          createdAt: row.created_at,
          ownerName: ownerMap[row.user_id]?.name || "Unknown User"
        });
      }
    }
    
    const usersByResumeCount: UserByResumeCount[] = sortedUsers.map(([id, count]) => ({
      name: ownerMap[id]?.name || "Unknown User",
      email: ownerMap[id]?.email || "No email",
      count
    }));

    const debugErrors: any[] = [];
    if (profilesCountRes.error) debugErrors.push({ stage: "profiles count", err: profilesCountRes.error });
    if (guestCountRes.error) debugErrors.push({ stage: "guest count", err: guestCountRes.error });
    if (adminCountRes.error) debugErrors.push({ stage: "admin count", err: adminCountRes.error });
    if (resumesCountRes.error) debugErrors.push({ stage: "resumes count", err: resumesCountRes.error });
    if (resumesAggRes.error) debugErrors.push({ stage: "resumes agg", err: resumesAggRes.error });
    if (recentProfilesRes.error) debugErrors.push({ stage: "recent profiles", err: recentProfilesRes.error });
    if (recentResumesTrendRes.error) debugErrors.push({ stage: "recent resumes trend", err: recentResumesTrendRes.error });
    if (prevProfilesCountRes.error) debugErrors.push({ stage: "prev profiles count", err: prevProfilesCountRes.error });
    if (prevResumesCountRes.error) debugErrors.push({ stage: "prev resumes count", err: prevResumesCountRes.error });
    if (topDownloadedRes.error) debugErrors.push({ stage: "top downloaded", err: topDownloadedRes.error });
    if (recentCreatedRes.error) debugErrors.push({ stage: "recent resumes", err: recentCreatedRes.error });

    if (debugErrors.length > 0) {
      return NextResponse.json({ error: "Supabase queries failed", debugErrors }, { status: 500 });
    }

    const lastUpdated = new Date().toISOString();

    // 6. Return standard structured payload
    const payload: AdminAnalyticsData = {
      totalUsers,
      totalResumes,
      totalDownloads,
      templatesUsed: templatesInUseCount,
      
      newUsers,
      registeredUsers,
      guestUsers,
      adminUsers,
      
      newResumes,
      publicResumes,
      privateResumes,
      avgResumesPerUser,
      
      resumesWithDownloads,
      avgDownloadsPerResume,
      
      usersByResumeCount,
      
      userGrowth,
      resumeCreation: resumeTrend,
      
      templateUsage,
      unknownTemplateUsage,
      
      topDownloadedResumes: topResumes,
      recentResumes,

      lastUpdated,
      usersWithoutResumes,
      resumesWithoutDownloads,
      prevNewUsers,
      prevNewResumes
    };

    return NextResponse.json(payload);

  } catch (err: any) {
    console.error("Admin Analytics API Error:", err);
    return NextResponse.json({ 
      error: "Failed to fetch analytics", 
      details: err?.message || String(err), 
      stack: err?.stack 
    }, { status: 500 });
  }
}
