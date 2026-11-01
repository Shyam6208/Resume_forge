"use client";

import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { nanoid } from "nanoid";
import { useResumeStore } from "@/store/resume.store";
import type { EducationEntry } from "@/types/resume.types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, GraduationCap } from "lucide-react";

const educationEntrySchema = z.object({
  id: z.string(),
  institution: z.string().min(1, "Institution is required"),
  degree: z.string().min(1, "Degree is required"),
  branch: z.string().optional(),
  grade: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  isCurrentlyStudying: z.boolean(),
  description: z.string().optional(),
});

const educationFormSchema = z.object({
  entries: z.array(educationEntrySchema),
});

type EducationFormValues = z.infer<typeof educationFormSchema>;

export function EducationForm() {
  const currentResume = useResumeStore((s) => s.currentResume);
  const updateSection = useResumeStore((s) => s.updateSection);

  const initialEntries: EducationFormValues["entries"] =
    (currentResume?.data.education || []).map((entry) => ({
      id: entry.id,
      institution: entry.institution || "",
      degree: entry.degree || "",
      branch: entry.branch || "",
      grade: entry.grade || "",
      startDate: entry.startDate || "",
      endDate: entry.endDate || "",
      isCurrentlyStudying: entry.isCurrentlyStudying ?? false,
      description: entry.description || "",
    }));

  const { register, control, watch, setValue } = useForm<EducationFormValues>({
    resolver: zodResolver(educationFormSchema),
    defaultValues: { entries: initialEntries },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "entries",
  });

  useEffect(() => {
    const subscription = watch((value) => {
      const formattedEducation: EducationEntry[] = (value.entries || []).map((entry) => ({
        id: entry?.id || nanoid(),
        institution: entry?.institution || "",
        degree: entry?.degree || "",
        branch: entry?.branch,
        grade: entry?.grade,
        startDate: entry?.startDate || "",
        endDate: entry?.isCurrentlyStudying ? undefined : entry?.endDate,
        isCurrentlyStudying: !!entry?.isCurrentlyStudying,
        description: entry?.description,
      }));

      updateSection("education", formattedEducation);
    });
    return () => subscription.unsubscribe();
  }, [watch, updateSection]);

  const addEntry = () => {
    append({
      id: nanoid(),
      institution: "",
      degree: "",
      branch: "",
      grade: "",
      startDate: "",
      endDate: "",
      isCurrentlyStudying: false,
      description: "",
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-emerald-500/20 text-cyan-400 border border-cyan-500/30 shadow-md shadow-cyan-500/10">
            <GraduationCap className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">Education</h3>
            <p className="text-xs text-muted-foreground">Add your degrees, schools, and academic background</p>
          </div>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={addEntry}
          className="bg-gradient-to-r from-cyan-500 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 font-extrabold text-xs rounded-xl shadow-md shadow-cyan-500/20 flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Education</span>
        </Button>
      </div>

      {fields.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-white/[0.1] rounded-2xl bg-card/40 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-muted-foreground flex items-center justify-center mx-auto">
            <GraduationCap className="w-6 h-6 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="text-xs text-foreground font-semibold">No education entries added yet</p>
            <p className="text-[11px] text-muted-foreground">Add your degrees or university credentials.</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addEntry}
            className="text-xs border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-foreground rounded-xl"
          >
            + Add Education
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {fields.map((field, index) => {
            const isCurrentlyStudying = watch(`entries.${index}.isCurrentlyStudying`);

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
                      Education #{index + 1}
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
                    <Label className="text-xs font-semibold text-foreground">Institution / University *</Label>
                    <Input
                      placeholder="Stanford University"
                      {...register(`entries.${index}.institution`)}
                      className="bg-card/80 border-white/[0.08] text-foreground focus-visible:ring-1 focus-visible:ring-cyan-500/50 rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">Degree *</Label>
                    <Input
                      placeholder="Bachelor of Science"
                      {...register(`entries.${index}.degree`)}
                      className="bg-card/80 border-white/[0.08] text-foreground focus-visible:ring-1 focus-visible:ring-cyan-500/50 rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">Field of Study / Branch (Optional)</Label>
                    <Input
                      placeholder="Computer Science"
                      {...register(`entries.${index}.branch`)}
                      className="bg-card/80 border-white/[0.08] text-foreground focus-visible:ring-1 focus-visible:ring-cyan-500/50 rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">Grade / GPA (Optional)</Label>
                    <Input
                      placeholder="3.8 / 4.0 or 8.5 CGPA"
                      {...register(`entries.${index}.grade`)}
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
                      disabled={isCurrentlyStudying}
                      {...register(`entries.${index}.endDate`)}
                      className="bg-card/80 border-white/[0.08] text-foreground focus-visible:ring-1 focus-visible:ring-cyan-500/50 rounded-xl disabled:opacity-40"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2.5 pt-1">
                  <Checkbox
                    id={`edu-current-${index}`}
                    checked={!!isCurrentlyStudying}
                    onCheckedChange={(val: boolean | "indeterminate") =>
                      setValue(`entries.${index}.isCurrentlyStudying`, val === true)
                    }
                    className="border-white/[0.2] data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500"
                  />
                  <Label htmlFor={`edu-current-${index}`} className="text-xs font-medium cursor-pointer text-foreground/90">
                    I am currently studying here
                  </Label>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">Description / Honors (Optional)</Label>
                  <Textarea
                    placeholder="Dean's List 2022, Relevant coursework: Data Structures, Machine Learning"
                    className="min-h-[70px] text-xs leading-relaxed bg-card/80 border-white/[0.08] text-foreground focus-visible:ring-1 focus-visible:ring-cyan-500/50 rounded-xl"
                    {...register(`entries.${index}.description`)}
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
