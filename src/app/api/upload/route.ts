import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { generateUploadSignature } from "@/lib/cloudinary";

export async function GET() {
  try {
    let userId = "guest";
    try {
      const supabase = await createServerSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        userId = user.id;
      }
    } catch {
      // Guest mode fallback
    }

    const signatureData = generateUploadSignature(userId);
    return NextResponse.json(signatureData);
  } catch (err) {
    console.error("Signature generation error:", err);
    return NextResponse.json(
      { error: "Failed to generate upload signature" },
      { status: 500 }
    );
  }
}
