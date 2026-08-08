import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary server credentials
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export interface UploadSignatureResult {
  timestamp: number;
  signature: string;
  folder: string;
  cloudName: string;
  apiKey: string;
}

/**
 * Generates a signed upload signature for user profile photo upload
 */
export function generateUploadSignature(userId: string): UploadSignatureResult {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const folder = `resumeforge/profile-photos/${userId}`;

  const apiKey = process.env.CLOUDINARY_API_KEY || "";
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";
  const apiSecret = process.env.CLOUDINARY_API_SECRET || "";

  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp,
      folder,
      upload_preset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "resumeforge_profiles",
    },
    apiSecret
  );

  return {
    timestamp,
    signature,
    folder,
    cloudName,
    apiKey,
  };
}

/**
 * Deletes a Cloudinary image by public ID
 */
export async function deleteCloudinaryImage(publicId: string): Promise<boolean> {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === "ok";
  } catch (error) {
    console.error("Cloudinary image deletion failed:", error);
    return false;
  }
}
