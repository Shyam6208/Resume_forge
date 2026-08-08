"use client";

import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { nanoid } from "nanoid";
import { useResumeStore } from "@/store/resume.store";
import type { AchievementEntry } from "@/types/resume.types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Trophy } from "lucide-react";

const achievementEntrySchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  date: z.string().optional(),
  organization: z.string().optional(),
});

const achievementFormSchema = z.object({
  entries: z.array(achievementEntrySchema),
});

type AchievementFormValues = z.infer<typeof achievementFormSchema>;

export function AchievementsForm() {
  const currentResume = useResumeStore((s) => s.currentResume);
  const updateSection = useResumeStore((s) => s.updateSection);

  const initialEntries: AchievementFormValues["entries"] =
    (currentResume?.data.achievements || []).map((a) => ({ ...a }));

  const { register, control, watch } = useForm<AchievementFormValues>({
    resolver: zodResolver(achievementFormSchema),
    defaultValues: { entries: initialEntries },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "entries",
  });

  useEffect(() => {
    const subscription = watch((value) => {
      const formattedAchievements: AchievementEntry[] = (value.entries || []).map((a) => ({
        id: a?.id || nanoid(),
        title: a?.title || "",
        description: a?.description,
        date: a?.date,
        organization: a?.organization,
      }));

      updateSection("achievements", formattedAchievements);
    });
    return () => subscription.unsubscribe();
  }, [watch, updateSection]);

  const addEntry = () => {
    append({
      id: nanoid(),
      title: "",
      description: "",
      date: "",
      organization: "",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b pb-2">
        <div>
          <h3 className="text-base font-bold text-white">Key Achievements & Honors</h3>
          <p className="text-xs text-slate-400">Highlight awards, hackathon wins, or key milestones</p>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={addEntry}
          className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Achievement</span>
        </Button>
      </div>

      {fields.length === 0 ? (
        <div className="text-center py-6 border border-dashed border-slate-800 rounded-lg bg-slate-900/40">
          <Trophy className="w-8 h-8 text-slate-500 mx-auto mb-2" />
          <p className="text-xs text-slate-400 font-medium">No achievements added yet</p>
          <Button type="button" variant="outline" size="sm" onClick={addEntry} className="mt-2 text-xs border-slate-700 bg-slate-800 hover:bg-slate-700 text-white">
            + Add Achievement
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="p-4 border border-slate-800 rounded-xl bg-slate-900/90 space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-semibold text-slate-200">
                  Achievement #{index + 1}
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
                  <Label className="text-xs">Achievement Title *</Label>
                  <Input placeholder="1st Place — National Hackathon 2023" {...register(`entries.${index}.title`)} />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Organization / Event (Optional)</Label>
                  <Input placeholder="MLH / TechCrunch Disrupt" {...register(`entries.${index}.organization`)} />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Date (Optional)</Label>
                  <Input type="month" {...register(`entries.${index}.date`)} />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Description (Optional)</Label>
                <Textarea
                  placeholder="Awarded out of 150+ competing teams for building an AI accessibility tool..."
                  className="min-h-[60px] text-xs leading-relaxed"
                  {...register(`entries.${index}.description`)}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
