import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

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
 * Uploads a Buffer (image or raw asset) server-side to Cloudinary
 */
export async function uploadBufferToCloudinary(
  buffer: Buffer,
  folder: string,
  resourceType: "image" | "raw" | "auto" = "auto",
  publicId?: string
): Promise<{ url: string; publicId: string }> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        public_id: publicId,
        overwrite: true,
      },
      (error, result: UploadApiResponse | undefined) => {
        if (error || !result) {
          console.error("Cloudinary stream upload error:", error);
          return reject(error || new Error("Cloudinary upload failed"));
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );

    uploadStream.end(buffer);
  });
}

/**
 * Deletes a Cloudinary image or raw asset by public ID
 */
export async function deleteCloudinaryImage(
  publicId: string,
  resourceType: "image" | "raw" = "image"
): Promise<boolean> {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return result.result === "ok";
  } catch (error) {
    console.error("Cloudinary asset deletion failed:", error);
    return false;
  }
}
