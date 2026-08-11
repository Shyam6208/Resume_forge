import { NextResponse } from "next/server";
import { aiService } from "@/lib/ai/ai.service";
import { TARGET_ROLE_MAP } from "@/config/target-roles.config";
import type { TargetRole } from "@/config/target-roles.config";
import type { RoleOptimizationResult } from "@/lib/ai/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { resumeData, targetRoleId, userType } = body || {};

    if (!resumeData) {
      return NextResponse.json(
        { error: "Missing required parameter: resumeData" },
        { status: 400 }
      );
    }

    if (!targetRoleId || !(targetRoleId in TARGET_ROLE_MAP)) {
      return NextResponse.json(
        { error: "Invalid or missing targetRoleId" },
        { status: 400 }
      );
    }

    const roleProfile = TARGET_ROLE_MAP[targetRoleId as TargetRole];

    const result = await aiService.optimizeForTargetRole(
      resumeData,
      roleProfile,
      userType
    );

    // Validate essential fields in AI response
    if (
      !result ||
      typeof result.targetRole !== "string" ||
      !Array.isArray(result.matchedSkills) ||
      !Array.isArray(result.recommendations)
    ) {
      // Retry once
      console.warn("Invalid AI response structure, retrying once...");
      const retryResult = await aiService.optimizeForTargetRole(
        resumeData,
        roleProfile,
        userType
      );

      if (
        !retryResult ||
        typeof retryResult.targetRole !== "string" ||
        !Array.isArray(retryResult.matchedSkills)
      ) {
        return NextResponse.json(
          { error: "AI analysis returned an invalid response. Please try again." },
          { status: 502 }
        );
      }

      return NextResponse.json(retryResult as RoleOptimizationResult, { status: 200 });
    }

    return NextResponse.json(result as RoleOptimizationResult, { status: 200 });
  } catch (err: unknown) {
    console.error("POST /api/ai/optimize-role error:", err);

    if (err instanceof Error && err.message.includes("GEMINI_API_KEY")) {
      return NextResponse.json(
        { error: "AI service is not configured. Please check server settings." },
        { status: 503 }
      );
    }

    const message = err instanceof Error ? err.message : "AI analysis failed. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
