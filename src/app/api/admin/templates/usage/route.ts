import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 1. Verify admin permissions
    const adminCheck = await requireAdminApi();
    if (adminCheck instanceof NextResponse) {
      return adminCheck;
    }

    const supabase = await createServerSupabaseClient();

    // 2. Fetch template IDs from all resumes
    const { data: resumes, error } = await supabase
      .from("resumes")
      .select("template_id");

    if (error) {
      console.error("Error fetching templates usage:", error);
      return NextResponse.json({ error: "Failed to fetch usage data" }, { status: 500 });
    }

    // 3. Aggregate usage in memory to avoid N+1 and complex RPCs
    const usageMap: Record<string, number> = {};
    const totalResumes = resumes?.length || 0;

    if (resumes) {
      for (const resume of resumes as { template_id: string }[]) {
        const tId = resume.template_id;
        if (tId) {
          usageMap[tId] = (usageMap[tId] || 0) + 1;
        } else {
          usageMap["unknown"] = (usageMap["unknown"] || 0) + 1;
        }
      }
    }

    return NextResponse.json({
      success: true,
      usageMap,
      totalResumes
    });

  } catch (error) {
    console.error("Admin Templates Usage Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
