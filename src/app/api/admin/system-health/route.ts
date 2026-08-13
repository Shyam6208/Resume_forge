import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export interface SystemHealthData {
  success: boolean;
  application: {
    environment: string;
  };
  database: {
    status: "healthy" | "error";
    responseTimeMs: number | null;
  };
  authentication: {
    status: "configured" | "not configured";
  };
  ai: {
    provider: string;
    status: "configured" | "not configured";
  };
  security: {
    adminApiProtected: boolean;
    serviceRoleServerOnly: boolean;
  };
  timestamp: string;
}

export async function GET(request: NextRequest) {
  // 1. Authenticate Admin (Server-side)
  const authCheck = await requireAdminApi();
  if (authCheck instanceof NextResponse) {
    return authCheck;
  }

  try {
    const adminSupabase = createAdminSupabaseClient();
    
    // 2. Perform Read-Only Database Check
    const start = Date.now();
    let dbStatus: "healthy" | "error" = "error";
    
    try {
      const { error } = await adminSupabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .limit(1);
        
      if (!error) {
        dbStatus = "healthy";
      } else {
        console.error("[SYSTEM HEALTH] Database check error:", error.message);
      }
    } catch (e) {
      console.error("[SYSTEM HEALTH] Database ping exception:", e);
    }
    
    const dbDuration = Date.now() - start;

    // 3. Derive Auth Status
    const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
    const hasAnonKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const hasServiceRole = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    const authStatus = (hasSupabaseUrl && hasAnonKey && hasServiceRole) 
      ? "configured" 
      : "not configured";

    // 4. Derive AI Status
    const aiStatus = !!process.env.GEMINI_API_KEY ? "configured" : "not configured";

    // 5. Build safe aggregate response
    const payload: SystemHealthData = {
      success: true,
      application: {
        environment: process.env.NODE_ENV === "production" ? "production" : "development"
      },
      database: {
        status: dbStatus,
        responseTimeMs: dbDuration
      },
      authentication: {
        status: authStatus
      },
      ai: {
        provider: "Gemini",
        status: aiStatus
      },
      security: {
        adminApiProtected: true, // We are inside requireAdminApi()
        serviceRoleServerOnly: true // Implicit since it's only in route.ts
      },
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(payload);

  } catch (err: any) {
    console.error("System Health API Error:", err);
    // Return a safe error response without secrets
    return NextResponse.json({ 
      success: false,
      error: "Failed to perform system health check" 
    }, { status: 500 });
  }
}
