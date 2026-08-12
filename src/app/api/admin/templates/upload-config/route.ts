import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin";
import { uploadBufferToCloudinary } from "@/lib/cloudinary";
import { validateTemplateConfig } from "@/lib/templates/template-validator";

export async function POST(request: NextRequest) {
  // 1. Verify Server-Side Admin Privilege
  const authResult = await requireAdminApi();
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    let rawContent = "";

    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json({ error: "No JSON config file provided." }, { status: 400 });
      }

      rawContent = await file.text();
    } else {
      const body = await request.json();
      rawContent = typeof body.config === "string" ? body.config : JSON.stringify(body.config || body);
    }

    // 2. Strict JSON Validation & Sanitization
    const validation = validateTemplateConfig(rawContent);
    if (!validation.isValid || !validation.config) {
      return NextResponse.json(
        { error: validation.error || "Invalid template JSON configuration." },
        { status: 400 }
      );
    }

    const cleanJsonString = JSON.stringify(validation.config, null, 2);
    const buffer = Buffer.from(cleanJsonString, "utf-8");

    // 3. Server-Side Cloudinary Upload
    const uploadResult = await uploadBufferToCloudinary(
      buffer,
      "resumeforge/templates/configs",
      "raw"
    );

    return NextResponse.json({
      success: true,
      url: uploadResult.url,
      publicId: uploadResult.publicId,
      config: validation.config,
    });
  } catch (err: unknown) {
    console.error("Template config upload error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to upload template config." },
      { status: 500 }
    );
  }
}
