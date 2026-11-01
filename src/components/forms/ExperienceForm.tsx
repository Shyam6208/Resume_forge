"use client";

import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { nanoid } from "nanoid";
import { useResumeStore } from "@/store/resume.store";
import { useUIStore } from "@/store/ui.store";
import type { ExperienceEntry } from "@/types/resume.types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Lightbulb, Briefcase } from "lucide-react";
import { ImproveWithAIButton } from "@/components/ai/ImproveWithAIButton";

// --- Zod Schema ---
const experienceEntrySchema = z.object({
  id: z.string(),
  company: z.string().min(1, "Company is required"),
  position: z.string().min(1, "Position is required"),
  location: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  isCurrentlyWorking: z.boolean(),
  responsibilitiesText: z.string(),
  description: z.string().optional(),
});

const experienceFormSchema = z.object({
  entries: z.array(experienceEntrySchema),
});

type ExperienceFormValues = z.infer<typeof experienceFormSchema>;

export function ExperienceForm() {
  const currentResume = useResumeStore((s) => s.currentResume);
  const updateSection = useResumeStore((s) => s.updateSection);
  const openLibrary = useUIStore((s) => s.openLibrary);
  const jobDescription = useUIStore((s) => s.jobDescription);

  const initialEntries: ExperienceFormValues["entries"] =
    (currentResume?.data.experience || []).map((entry) => ({
      id: entry.id,
      company: entry.company || "",
      position: entry.position || "",
      location: entry.location || "",
      startDate: entry.startDate || "",
      endDate: entry.endDate || "",
      isCurrentlyWorking: entry.isCurrentlyWorking ?? false,
      responsibilitiesText: entry.responsibilities?.join("\n") || "",
      description: entry.description || "",
    }));

  const {
    register,
    control,
    watch,
    setValue,
  } = useForm<ExperienceFormValues>({
    resolver: zodResolver(experienceFormSchema),
    defaultValues: { entries: initialEntries },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "entries",
  });

  // Sync with Zustand store on input change
  useEffect(() => {
    const subscription = watch((value) => {
      const formattedExperience: ExperienceEntry[] = (value.entries || []).map((entry) => ({
        id: entry?.id || nanoid(),
        company: entry?.company || "",
        position: entry?.position || "",
        location: entry?.location,
        startDate: entry?.startDate || "",
        endDate: entry?.isCurrentlyWorking ? undefined : entry?.endDate,
        isCurrentlyWorking: !!entry?.isCurrentlyWorking,
        responsibilities: entry?.responsibilitiesText
          ? entry.responsibilitiesText.split("\n").filter((line) => line.trim().length > 0)
          : [],
        description: entry?.description,
      }));

      updateSection("experience", formattedExperience);
    });
    return () => subscription.unsubscribe();
  }, [watch, updateSection]);

  const addEntry = () => {
    append({
      id: nanoid(),
      company: "",
      position: "",
      location: "",
      startDate: "",
      endDate: "",
      isCurrentlyWorking: false,
      responsibilitiesText: "",
      description: "",
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-emerald-500/20 text-cyan-400 border border-cyan-500/30 shadow-md shadow-cyan-500/10">
            <Briefcase className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">Work Experience</h3>
            <p className="text-xs text-muted-foreground">Add your past roles, internships, and key achievements</p>
          </div>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={addEntry}
          className="bg-gradient-to-r from-cyan-500 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 font-extrabold text-xs rounded-xl shadow-md shadow-cyan-500/20 flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Position</span>
        </Button>
      </div>

      {fields.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-white/[0.1] rounded-2xl bg-card/40 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-muted-foreground flex items-center justify-center mx-auto">
            <Briefcase className="w-6 h-6 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="text-xs text-foreground font-semibold">No experience entries added yet</p>
            <p className="text-[11px] text-muted-foreground">Add your current or previous job positions to highlight career trajectory.</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addEntry}
            className="text-xs border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-foreground rounded-xl"
          >
            + Add First Position
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {fields.map((field, index) => {
            const isCurrentlyWorking = watch(`entries.${index}.isCurrentlyWorking`);

            return (
              <div
                key={field.id}
                className="p-4 sm:p-5 border border-white/[0.08] hover:border-white/[0.12] rounded-2xl bg-card/70 space-y-4 shadow-sm backdrop-blur-md transition-all"
              >
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 font-bold text-xs flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="text-xs font-semibold text-foreground">
                      Position #{index + 1}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                    className="h-7 px-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    <span>Delete</span>
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">Position / Job Title *</Label>
                    <Input
                      placeholder="Senior Software Engineer"
                      {...register(`entries.${index}.position`)}
                      className="bg-card/80 border-white/[0.08] text-foreground focus-visible:ring-1 focus-visible:ring-cyan-500/50 rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">Company Name *</Label>
                    <Input
                      placeholder="Acme Corp"
                      {...register(`entries.${index}.company`)}
                      className="bg-card/80 border-white/[0.08] text-foreground focus-visible:ring-1 focus-visible:ring-cyan-500/50 rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">Location (Optional)</Label>
                    <Input
                      placeholder="San Francisco, CA (or Remote)"
                      {...register(`entries.${index}.location`)}
                      className="bg-card/80 border-white/[0.08] text-foreground focus-visible:ring-1 focus-visible:ring-cyan-500/50 rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">Start Date *</Label>
                    <Input
                      type="month"
                      {...register(`entries.${index}.startDate`)}
                      className="bg-card/80 border-white/[0.08] text-foreground focus-visible:ring-1 focus-visible:ring-cyan-500/50 rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">End Date</Label>
                    <Input
                      type="month"
                      disabled={isCurrentlyWorking}
                      {...register(`entries.${index}.endDate`)}
                      className="bg-card/80 border-white/[0.08] text-foreground focus-visible:ring-1 focus-visible:ring-cyan-500/50 rounded-xl disabled:opacity-40"
                    />
                  </div>

                  <div className="flex items-center gap-2.5 pt-6">
                    <Checkbox
                      id={`current-${index}`}
                      checked={!!isCurrentlyWorking}
                      onCheckedChange={(val: boolean | "indeterminate") =>
                        setValue(`entries.${index}.isCurrentlyWorking`, val === true)
                      }
                      className="border-white/[0.2] data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500"
                    />
                    <Label htmlFor={`current-${index}`} className="text-xs font-medium cursor-pointer text-foreground/90">
                      I currently work here
                    </Label>
                  </div>
                </div>

                {/* Responsibilities */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Label className="text-xs font-semibold text-foreground">Key Responsibilities (One per line)</Label>
                    <div className="flex flex-wrap items-center gap-2">
                      <ImproveWithAIButton 
                        sectionKey="experience" 
                        currentData={watch(`entries.${index}.responsibilitiesText`) || ""}
                        onApply={(improvedData) => setValue(`entries.${index}.responsibilitiesText`, improvedData, { shouldDirty: true, shouldValidate: true })}
                      />
                      {jobDescription.trim().length >= 30 && (
                        <ImproveWithAIButton 
                          sectionKey="experience" 
                          mode="optimize"
                          currentData={watch(`entries.${index}.responsibilitiesText`) || ""}
                          onApply={(improvedData) => setValue(`entries.${index}.responsibilitiesText`, improvedData, { shouldDirty: true, shouldValidate: true })}
                        />
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => openLibrary("bullets")}
                        className="h-6 text-[11px] text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 p-1.5 rounded-lg transition-colors"
                      >
                        <Lightbulb className="w-3 h-3 mr-1" />
                        <span>Bullet Library</span>
                      </Button>
                    </div>
                  </div>
                  <Textarea
                    placeholder="• Developed REST APIs handling 10k daily requests&#10;• Reduced latency by 35% by implementing Redis caching"
                    className="min-h-[100px] text-xs leading-relaxed bg-card/80 border-white/[0.08] text-foreground focus-visible:ring-1 focus-visible:ring-cyan-500/50 rounded-xl"
                    {...register(`entries.${index}.responsibilitiesText`)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
