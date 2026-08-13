import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export interface ActivityEvent {
  id: string; // Synthetic ID for React keys
  type: string;
  timestamp: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  resource?: {
    id: string;
    title: string;
  } | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  actionDetails?: any;
}

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAdminApi();
    if (authResult instanceof NextResponse) return authResult;

    const url = new URL(req.url);
    const parsedPage = parseInt(url.searchParams.get("page") || "1", 10);
    const page = Number.isNaN(parsedPage) ? 1 : Math.max(1, parsedPage);
    const parsedPageSize = parseInt(url.searchParams.get("pageSize") || "20", 10);
    const pageSize = Number.isNaN(parsedPageSize) ? 20 : Math.min(100, Math.max(1, parsedPageSize));
    const parsedDays = parseInt(url.searchParams.get("days") || "30", 10);
    const days = Number.isNaN(parsedDays) ? 30 : ([7, 30, 90].includes(parsedDays) ? parsedDays : 30);
    const typeFilter = url.searchParams.get("type") || "all";
    const searchQuery = (url.searchParams.get("search") || "").trim().toLowerCase();

    const supabase = createAdminSupabaseClient();
    
    // Calculate the bounded time window
    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const startIso = startDate.toISOString();

    let allEvents: ActivityEvent[] = [];

    // 1. Fetch User Registrations (profiles)
    if (typeFilter === "all" || typeFilter === "user_registered") {
      const { data: profiles, error: profError } = await supabase
        .from("profiles")
        .select("id, name, email, created_at")
        .gte("created_at", startIso);
      
      if (!profError && profiles) {
        (profiles as any[]).forEach(p => {
          allEvents.push({
            id: `user_reg_${p.id}`,
            type: "user_registered",
            timestamp: p.created_at,
            user: { id: p.id, name: p.name, email: p.email }
          });
        });
      }
    }

    // 2. Fetch Resume Actions (resumes)
    if (typeFilter === "all" || typeFilter === "resume_created" || typeFilter === "resume_updated") {
      // Need owner details, so we fetch them or resolve them later.
      // Easiest is to fetch all matching resumes and then batch resolve owners.
      const { data: resumes, error: resError } = await supabase
        .from("resumes")
        .select("id, user_id, title, created_at, updated_at")
        .gte("updated_at", startIso); // Use updated_at since it's always >= created_at

      if (!resError && resumes) {
        // Collect user_ids to resolve owners in batch
        const userIds = [...new Set((resumes as any[]).map(r => r.user_id))];
        let ownerMap: Record<string, {name: string | null, email: string}> = {};
        
        if (userIds.length > 0) {
          const { data: owners } = await supabase
            .from("profiles")
            .select("id, name, email")
            .in("id", userIds);
          if (owners) {
            ownerMap = (owners as any[]).reduce((acc, o) => {
              acc[o.id] = { name: o.name, email: o.email };
              return acc;
            }, {} as Record<string, {name: string | null, email: string}>);
          }
        }

        (resumes as any[]).forEach(r => {
          const owner = ownerMap[r.user_id] || { name: "Unknown user", email: "Unknown email" };
          
          // Check for create event within window
          if (r.created_at >= startIso && (typeFilter === "all" || typeFilter === "resume_created")) {
            allEvents.push({
              id: `res_cre_${r.id}`,
              type: "resume_created",
              timestamp: r.created_at,
              user: { id: r.user_id, name: owner.name, email: owner.email },
              resource: { id: r.id, title: r.title || "Untitled Resume" }
            });
          }

          // Check for genuine update event within window
          // Only create resume_updated when updated_at !== created_at
          if (r.updated_at >= startIso && r.updated_at !== r.created_at && (typeFilter === "all" || typeFilter === "resume_updated")) {
            allEvents.push({
              id: `res_upd_${r.id}_${r.updated_at}`,
              type: "resume_updated",
              timestamp: r.updated_at,
              user: { id: r.user_id, name: owner.name, email: owner.email },
              resource: { id: r.id, title: r.title || "Untitled Resume" }
            });
          }
        });
      }
    }

    // 3. Fetch Admin Actions (admin_activity_logs)
    if (typeFilter === "all" || typeFilter.startsWith("template_")) {
      let query = supabase
        .from("admin_activity_logs")
        .select("id, admin_id, admin_email, action, details, created_at")
        .gte("created_at", startIso);
      
      if (typeFilter !== "all") {
        query = query.eq("action", typeFilter);
      }

      const { data: adminLogs, error: adminError } = await query;

      if (!adminError && adminLogs) {
        (adminLogs as any[]).forEach(log => {
          // Resolve template title from details if available
          let resourceTitle = "Unknown template";
          if (log.details && typeof log.details === 'object' && log.details.templateId) {
             resourceTitle = `Template: ${log.details.templateId}`;
          }
          
          allEvents.push({
            id: `admin_act_${log.id}`,
            type: log.action,
            timestamp: log.created_at,
            user: { id: log.admin_id, name: "Admin", email: log.admin_email },
            resource: { id: log.details?.templateId || "unknown", title: resourceTitle },
            actionDetails: log.details
          });
        });
      }
    }

    // Sort all events by timestamp descending
    allEvents.sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    // Apply Search Filtering (in memory)
    if (searchQuery) {
      allEvents = allEvents.filter(e => {
        const userName = (e.user?.name || "").toLowerCase();
        const userEmail = (e.user?.email || "").toLowerCase();
        const resourceTitle = (e.resource?.title || "").toLowerCase();
        const actionType = e.type.toLowerCase();

        return userName.includes(searchQuery) ||
               userEmail.includes(searchQuery) ||
               resourceTitle.includes(searchQuery) ||
               actionType.includes(searchQuery);
      });
    }

    // Apply Pagination
    const totalCount = allEvents.length;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedEvents = allEvents.slice(startIndex, endIndex);

    return NextResponse.json({
      events: paginatedEvents,
      totalCount,
      page,
      pageSize,
      days
    });
  } catch (error) {
    console.error("[ADMIN ACTIVITY] Unhandled error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
