"use client";

import { CldUploadWidget, CloudinaryUploadWidgetResults } from "next-cloudinary";
import { useResumeStore } from "@/store/resume.store";
import { Camera, Trash2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

interface PhotoUploadProps {
  userId?: string;
  currentPhotoUrl?: string;
  onUploadSuccess?: (url: string) => void;
  onRemovePhoto?: () => void;
}

export function PhotoUpload({
  userId,
  currentPhotoUrl: propPhotoUrl,
  onUploadSuccess,
  onRemovePhoto,
}: PhotoUploadProps) {
  const currentResume = useResumeStore((s) => s.currentResume);
  const updateSection = useResumeStore((s) => s.updateSection);

  const photoUrl =
    propPhotoUrl !== undefined
      ? propPhotoUrl
      : currentResume?.data.personalInfo?.profilePhoto;

  const uploadPreset =
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "resumeforge_profiles";

  const handleSuccess = (results: CloudinaryUploadWidgetResults) => {
    let secureUrl = "";
    if (typeof results.info === "object" && results.info?.secure_url) {
      secureUrl = results.info.secure_url;
    }

    if (!secureUrl) return;

    // Update store personalInfo profilePhoto
    const personalInfo = currentResume?.data.personalInfo || {
      fullName: "",
      email: "",
    };

    updateSection("personalInfo", {
      ...personalInfo,
      profilePhoto: secureUrl,
    });

    if (onUploadSuccess) {
      onUploadSuccess(secureUrl);
    }

    toast.success("Profile photo uploaded successfully!");
  };

  const handleRemove = () => {
    const personalInfo = currentResume?.data.personalInfo || {
      fullName: "",
      email: "",
    };

    updateSection("personalInfo", {
      ...personalInfo,
      profilePhoto: undefined,
    });

    if (onRemovePhoto) {
      onRemovePhoto();
    }

    toast.success("Profile photo removed.");
  };

  return (
    <div className="flex items-center gap-4 p-3.5 bg-card/70 border border-white/[0.08] rounded-2xl shadow-sm backdrop-blur-md">
      {/* Circular Avatar Preview (80x80) */}
      <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-white/[0.12] shadow-md bg-card shrink-0 flex items-center justify-center group">
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoUrl}
            alt="Profile Preview"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-muted-foreground">
            <User className="w-8 h-8 opacity-60" />
          </div>
        )}
      </div>

      {/* Buttons & Info */}
      <div className="space-y-2 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <CldUploadWidget
            uploadPreset={uploadPreset}
            options={{
              maxFiles: 1,
              maxFileSize: 2000000, // 2MB max
              cropping: true,
              croppingAspectRatio: 1,
              showSkipCropButton: false,
              clientAllowedFormats: ["jpg", "png", "webp"],
              folder: `resumeforge/profile-photos/${userId || "guest"}`,
            }}
            onSuccess={handleSuccess}
          >
            {({ open }) => (
              <Button
                type="button"
                size="sm"
                onClick={() => open()}
                className="h-8 text-xs bg-gradient-to-r from-cyan-500 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 font-bold rounded-xl shadow-md shadow-cyan-500/20 flex items-center gap-1.5 transition-all"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{photoUrl ? "Change Photo" : "Upload Photo"}</span>
              </Button>
            )}
          </CldUploadWidget>

          {photoUrl && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRemove}
              className="h-8 text-xs text-rose-400 border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20 hover:text-rose-300 rounded-xl flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove</span>
            </Button>
          )}
        </div>

        <p className="text-[11px] text-muted-foreground">
          JPG, PNG, WEBP • Recommended square aspect ratio • Max 2MB
        </p>
      </div>
    </div>
  );
}
