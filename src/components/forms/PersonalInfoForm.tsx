"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useResumeStore } from "@/store/resume.store";
import { PhotoUpload } from "./PhotoUpload";
import type { PersonalInfo } from "@/types/resume.types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

// --- Zod Schema ---
const personalInfoSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  professionalTitle: z.string().optional(),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  website: z.string().optional(),
  linkedin: z.string().optional(),
  github: z.string().optional(),
  portfolio: z.string().optional(),
  dateOfBirth: z.string().optional(),
  nationality: z.string().optional(),
  profilePhoto: z.string().optional(),
});

type PersonalInfoFormValues = z.infer<typeof personalInfoSchema>;

export function PersonalInfoForm() {
  const personalInfo = useResumeStore((s) => s.currentResume?.data?.personalInfo);
  const userId = useResumeStore((s) => s.currentResume?.userId);
  const updateSection = useResumeStore((s) => s.updateSection);

  const initialData: PersonalInfo = personalInfo || {
    fullName: "",
    email: "",
  };

  const {
    register,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<PersonalInfoFormValues>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: initialData,
    mode: "onChange",
  });

  // Live update Zustand store on input change
  useEffect(() => {
    const subscription = watch((value) => {
      if (value.fullName && value.email) {
        updateSection("personalInfo", value as PersonalInfo);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, updateSection]);

  const handlePhotoSuccess = (url: string) => {
    setValue("profilePhoto", url);
    const currentValues = getValues();
    updateSection("personalInfo", { ...currentValues, profilePhoto: url } as PersonalInfo);
  };

  return (
    <div className="space-y-4">
      <div className="border-b border-slate-800 pb-2">
        <h3 className="text-base font-bold text-white">Personal Information</h3>
        <p className="text-xs text-slate-400">Your contact details and header information</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="fullName" className="text-xs">Full Name *</Label>
          <Input id="fullName" placeholder="John Doe" {...register("fullName")} />
          {errors.fullName && <p className="text-[11px] text-destructive">{errors.fullName.message}</p>}
        </div>

        <div className="space-y-1">
          <Label htmlFor="email" className="text-xs">Email *</Label>
          <Input id="email" type="email" placeholder="john@example.com" {...register("email")} />
          {errors.email && <p className="text-[11px] text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-1">
          <Label htmlFor="professionalTitle" className="text-xs">Professional Title (Optional)</Label>
          <Input id="professionalTitle" placeholder="Full Stack Developer" {...register("professionalTitle")} />
        </div>

        <div className="space-y-1">
          <Label htmlFor="phone" className="text-xs">Phone (Optional)</Label>
          <Input id="phone" placeholder="+1 (555) 000-0000" {...register("phone")} />
        </div>

        <div className="space-y-1">
          <Label htmlFor="city" className="text-xs">City (Optional)</Label>
          <Input id="city" placeholder="San Francisco" {...register("city")} />
        </div>

        <div className="space-y-1">
          <Label htmlFor="country" className="text-xs">Country (Optional)</Label>
          <Input id="country" placeholder="United States" {...register("country")} />
        </div>

        <div className="space-y-1">
          <Label htmlFor="website" className="text-xs">Website (Optional)</Label>
          <Input id="website" placeholder="https://johndoe.dev" {...register("website")} />
        </div>

        <div className="space-y-1">
          <Label htmlFor="linkedin" className="text-xs">LinkedIn (Optional)</Label>
          <Input id="linkedin" placeholder="linkedin.in/johndoe" {...register("linkedin")} />
        </div>

        <div className="space-y-1">
          <Label htmlFor="github" className="text-xs">GitHub (Optional)</Label>
          <Input id="github" placeholder="github.com/johndoe" {...register("github")} />
        </div>

        <div className="space-y-1">
          <Label htmlFor="portfolio" className="text-xs">Portfolio (Optional)</Label>
          <Input id="portfolio" placeholder="https://portfolio.johndoe.dev" {...register("portfolio")} />
        </div>
      </div>

      <div className="pt-2 border-t">
        <Label className="text-xs mb-2 block">Profile Photo (Optional)</Label>
        <PhotoUpload
          userId={userId || "guest"}
          currentPhotoUrl={watch("profilePhoto")}
          onUploadSuccess={handlePhotoSuccess}
        />
      </div>
    </div>
  );
}
