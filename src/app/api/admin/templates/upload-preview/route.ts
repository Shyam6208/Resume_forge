import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin";
import { uploadBufferToCloudinary } from "@/lib/cloudinary";

export async function POST(request: NextRequest) {
  // 1. Verify Server-Side Admin Privilege
  const authResult = await requireAdminApi();
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No preview image file provided." }, { status: 400 });
    }

    // 2. Validate File Type
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      return NextResponse.json(
        { error: "Invalid file type. Only PNG, JPG, JPEG, and WebP images are allowed." },
        { status: 400 }
      );
    }

    // 3. Validate File Size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Preview image exceeds 5MB size limit." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 4. Server-Side Cloudinary Upload
    const uploadResult = await uploadBufferToCloudinary(
      buffer,
      "resumeforge/templates/previews",
      "image"
    );

    return NextResponse.json({
      success: true,
      url: uploadResult.url,
      publicId: uploadResult.publicId,
    });
  } catch (err: unknown) {
    console.error("Preview image upload error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to upload preview image." },
      { status: 500 }
    );
  }
}
