import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin";
import { uploadBufferToCloudinary } from "@/lib/cloudinary";

// POST /api/admin/templates/upload-preview — Upload preview image to Cloudinary
export async function POST(request: NextRequest) {
  const authResult = await requireAdminApi();
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/png", "image/jpeg", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: PNG, JPEG, WebP." },
        { status: 400 }
      );
    }

    // Max 5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Maximum 5MB allowed." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await uploadBufferToCloudinary(
      buffer,
      "resumeforge/template-previews",
      "image"
    );

    return NextResponse.json({
      url: result.url,
      publicId: result.publicId,
    });
  } catch (err: unknown) {
    console.error("Upload preview error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed." },
      { status: 500 }
    );
  }
}
