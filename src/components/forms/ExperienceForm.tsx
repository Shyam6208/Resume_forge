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
    getValues,
    formState: { errors },
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
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b pb-2">
        <div>
          <h3 className="text-base font-bold text-white">Work Experience</h3>
          <p className="text-xs text-slate-400">Add your past roles, internships, and key achievements</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            onClick={addEntry}
            className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Position</span>
          </Button>
        </div>
      </div>

      {fields.length === 0 ? (
        <div className="text-center py-6 border border-dashed border-slate-800 rounded-lg bg-slate-900/40">
          <Briefcase className="w-8 h-8 text-slate-500 mx-auto mb-2" />
          <p className="text-xs text-slate-400 font-medium">No experience entries added yet</p>
          <Button type="button" variant="outline" size="sm" onClick={addEntry} className="mt-2 text-xs border-slate-700 bg-slate-800 hover:bg-slate-700 text-white">
            + Add First Position
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {fields.map((field, index) => {
            const isCurrentlyWorking = watch(`entries.${index}.isCurrentlyWorking`);

            return (
              <div key={field.id} className="p-4 border border-slate-800 rounded-xl bg-slate-900/90 space-y-3 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-semibold text-slate-200">
                    Position #{index + 1}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                    className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Position / Job Title *</Label>
                    <Input placeholder="Software Engineer" {...register(`entries.${index}.position`)} />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Company Name *</Label>
                    <Input placeholder="Acme Corp" {...register(`entries.${index}.company`)} />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Location (Optional)</Label>
                    <Input placeholder="San Francisco, CA" {...register(`entries.${index}.location`)} />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Start Date *</Label>
                    <Input type="month" {...register(`entries.${index}.startDate`)} />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">End Date</Label>
                    <Input
                      type="month"
                      disabled={isCurrentlyWorking}
                      {...register(`entries.${index}.endDate`)}
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-5">
                    <Checkbox
                      id={`current-${index}`}
                      checked={!!isCurrentlyWorking}
                      onCheckedChange={(val: boolean | "indeterminate") =>
                        setValue(`entries.${index}.isCurrentlyWorking`, val === true)
                      }
                    />
                    <Label htmlFor={`current-${index}`} className="text-xs cursor-pointer">
                      I currently work here
                    </Label>
                  </div>
                </div>

                {/* Responsibilities */}
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium">Key Responsibilities (One per line)</Label>
                    <div className="flex items-center gap-2">
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
                        className="h-6 text-[11px] text-indigo-600 hover:text-indigo-700 p-0"
                      >
                        <Lightbulb className="w-3 h-3 mr-1" />
                        💡 Bullet Library
                      </Button>
                    </div>
                  </div>
                  <Textarea
                    placeholder="• Developed REST APIs handling 10k daily requests&#10;• Reduced latency by 35% by implementing Redis caching"
                    className="min-h-[90px] text-xs leading-relaxed"
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
