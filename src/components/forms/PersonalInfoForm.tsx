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
import { User, Mail, Phone, Briefcase, Globe, Link2, Code2, MapPin } from "lucide-react";

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
    <div className="space-y-5">
      <div className="flex items-center gap-3 border-b border-white/[0.08] pb-3">
        <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-emerald-500/20 text-cyan-400 border border-cyan-500/30 shadow-md shadow-cyan-500/10">
          <User className="w-4 h-4 text-cyan-400" />
        </div>
        <div>
          <h3 className="text-base font-bold text-foreground">Personal Information</h3>
          <p className="text-xs text-muted-foreground">Your contact details and executive header identity</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="space-y-1.5">
          <Label htmlFor="fullName" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-cyan-400" />
            <span>Full Name *</span>
          </Label>
          <Input
            id="fullName"
            placeholder="John Doe"
            {...register("fullName")}
            className="bg-card/80 border-white/[0.08] text-foreground focus-visible:ring-1 focus-visible:ring-cyan-500/50 rounded-xl"
          />
          {errors.fullName && <p className="text-[11px] text-destructive">{errors.fullName.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-cyan-400" />
            <span>Email *</span>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="john@example.com"
            {...register("email")}
            className="bg-card/80 border-white/[0.08] text-foreground focus-visible:ring-1 focus-visible:ring-cyan-500/50 rounded-xl"
          />
          {errors.email && <p className="text-[11px] text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="professionalTitle" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
            <span>Professional Title (Optional)</span>
          </Label>
          <Input
            id="professionalTitle"
            placeholder="Senior Full Stack Engineer"
            {...register("professionalTitle")}
            className="bg-card/80 border-white/[0.08] text-foreground focus-visible:ring-1 focus-visible:ring-cyan-500/50 rounded-xl"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-cyan-400" />
            <span>Phone (Optional)</span>
          </Label>
          <Input
            id="phone"
            placeholder="+1 (555) 000-0000"
            {...register("phone")}
            className="bg-card/80 border-white/[0.08] text-foreground focus-visible:ring-1 focus-visible:ring-cyan-500/50 rounded-xl"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="city" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span>City (Optional)</span>
          </Label>
          <Input
            id="city"
            placeholder="San Francisco"
            {...register("city")}
            className="bg-card/80 border-white/[0.08] text-foreground focus-visible:ring-1 focus-visible:ring-cyan-500/50 rounded-xl"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="country" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>Country (Optional)</span>
          </Label>
          <Input
            id="country"
            placeholder="United States"
            {...register("country")}
            className="bg-card/80 border-white/[0.08] text-foreground focus-visible:ring-1 focus-visible:ring-cyan-500/50 rounded-xl"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="website" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>Website (Optional)</span>
          </Label>
          <Input
            id="website"
            placeholder="https://johndoe.dev"
            {...register("website")}
            className="bg-card/80 border-white/[0.08] text-foreground focus-visible:ring-1 focus-visible:ring-cyan-500/50 rounded-xl font-mono text-xs"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="linkedin" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Link2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>LinkedIn (Optional)</span>
          </Label>
          <Input
            id="linkedin"
            placeholder="linkedin.com/in/johndoe"
            {...register("linkedin")}
            className="bg-card/80 border-white/[0.08] text-foreground focus-visible:ring-1 focus-visible:ring-cyan-500/50 rounded-xl font-mono text-xs"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="github" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Code2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>GitHub (Optional)</span>
          </Label>
          <Input
            id="github"
            placeholder="github.com/johndoe"
            {...register("github")}
            className="bg-card/80 border-white/[0.08] text-foreground focus-visible:ring-1 focus-visible:ring-cyan-500/50 rounded-xl font-mono text-xs"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="portfolio" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>Portfolio (Optional)</span>
          </Label>
          <Input
            id="portfolio"
            placeholder="https://portfolio.johndoe.dev"
            {...register("portfolio")}
            className="bg-card/80 border-white/[0.08] text-foreground focus-visible:ring-1 focus-visible:ring-cyan-500/50 rounded-xl font-mono text-xs"
          />
        </div>
      </div>

      <div className="pt-3 border-t border-white/[0.08]">
        <Label className="text-xs font-semibold text-foreground mb-2.5 block">Profile Photo (Optional)</Label>
        <PhotoUpload
          userId={userId || "guest"}
          currentPhotoUrl={watch("profilePhoto")}
          onUploadSuccess={handlePhotoSuccess}
        />
      </div>
    </div>
  );
}
