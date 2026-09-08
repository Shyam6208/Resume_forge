import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin";
import { validateTemplateConfig } from "@/lib/templates/template-validator";
import { uploadBufferToCloudinary } from "@/lib/cloudinary";

// POST /api/admin/templates/upload-config — Validate and upload JSON config to Cloudinary
export async function POST(request: NextRequest) {
  const authResult = await requireAdminApi();
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const body = await request.json();
    const { config } = body;

    if (!config) {
      return NextResponse.json({ error: "No config provided." }, { status: 400 });
    }

    // Validate the JSON config
    const validation = validateTemplateConfig(config);
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Upload validated config to Cloudinary as raw JSON
    const jsonString = JSON.stringify(validation.config, null, 2);
    const buffer = Buffer.from(jsonString, "utf-8");

    const result = await uploadBufferToCloudinary(
      buffer,
      "resumeforge/template-configs",
      "raw"
    );

    return NextResponse.json({
      url: result.url,
      publicId: result.publicId,
      config: validation.config,
    });
  } catch (err: unknown) {
    console.error("Upload config error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Config upload failed." },
      { status: 500 }
    );
  }
}
