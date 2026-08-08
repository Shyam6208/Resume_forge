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
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b pb-2">
        <div>
          <h3 className="text-base font-bold text-white">Education</h3>
          <p className="text-xs text-slate-400">Add your degrees, schools, and academic background</p>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={addEntry}
          className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Education</span>
        </Button>
      </div>

      {fields.length === 0 ? (
        <div className="text-center py-6 border border-dashed border-slate-800 rounded-lg bg-slate-900/40">
          <GraduationCap className="w-8 h-8 text-slate-500 mx-auto mb-2" />
          <p className="text-xs text-slate-400 font-medium">No education entries added yet</p>
          <Button type="button" variant="outline" size="sm" onClick={addEntry} className="mt-2 text-xs border-slate-700 bg-slate-800 hover:bg-slate-700 text-white">
            + Add Education
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {fields.map((field, index) => {
            const isCurrentlyStudying = watch(`entries.${index}.isCurrentlyStudying`);

            return (
              <div key={field.id} className="p-4 border border-slate-800 rounded-xl bg-slate-900/90 space-y-3 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-semibold text-slate-200">
                    Education #{index + 1}
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
                    <Label className="text-xs">Institution / University *</Label>
                    <Input placeholder="Stanford University" {...register(`entries.${index}.institution`)} />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Degree *</Label>
                    <Input placeholder="Bachelor of Science" {...register(`entries.${index}.degree`)} />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Field of Study / Branch (Optional)</Label>
                    <Input placeholder="Computer Science" {...register(`entries.${index}.branch`)} />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Grade / GPA (Optional)</Label>
                    <Input placeholder="3.8 / 4.0 or 8.5 CGPA" {...register(`entries.${index}.grade`)} />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Start Date *</Label>
                    <Input type="month" {...register(`entries.${index}.startDate`)} />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">End Date</Label>
                    <Input
                      type="month"
                      disabled={isCurrentlyStudying}
                      {...register(`entries.${index}.endDate`)}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <Checkbox
                    id={`edu-current-${index}`}
                    checked={!!isCurrentlyStudying}
                    onCheckedChange={(val: boolean | "indeterminate") =>
                      setValue(`entries.${index}.isCurrentlyStudying`, val === true)
                    }
                  />
                  <Label htmlFor={`edu-current-${index}`} className="text-xs cursor-pointer">
                    I am currently studying here
                  </Label>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Description / Honors (Optional)</Label>
                  <Textarea
                    placeholder="Dean's List 2022, Relevant coursework: Data Structures, Machine Learning"
                    className="min-h-[60px] text-xs leading-relaxed"
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
