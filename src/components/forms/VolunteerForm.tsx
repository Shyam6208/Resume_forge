"use client";

import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { nanoid } from "nanoid";
import { useResumeStore } from "@/store/resume.store";
import type { VolunteerEntry } from "@/types/resume.types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, HeartHandshake } from "lucide-react";

const volunteerEntrySchema = z.object({
  id: z.string(),
  organization: z.string().min(1, "Organization is required"),
  role: z.string().min(1, "Role is required"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  description: z.string().optional(),
});

const volunteerFormSchema = z.object({
  entries: z.array(volunteerEntrySchema),
});

type VolunteerFormValues = z.infer<typeof volunteerFormSchema>;

export function VolunteerForm() {
  const currentResume = useResumeStore((s) => s.currentResume);
  const updateSection = useResumeStore((s) => s.updateSection);

  const initialEntries: VolunteerFormValues["entries"] =
    (currentResume?.data.volunteer || []).map((v) => ({ ...v }));

  const { register, control, watch } = useForm<VolunteerFormValues>({
    resolver: zodResolver(volunteerFormSchema),
    defaultValues: { entries: initialEntries },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "entries",
  });

  useEffect(() => {
    const subscription = watch((value) => {
      const formattedVolunteer: VolunteerEntry[] = (value.entries || []).map((v) => ({
        id: v?.id || nanoid(),
        organization: v?.organization || "",
        role: v?.role || "",
        startDate: v?.startDate,
        endDate: v?.endDate,
        description: v?.description,
      }));

      updateSection("volunteer", formattedVolunteer);
    });
    return () => subscription.unsubscribe();
  }, [watch, updateSection]);

  const addEntry = () => {
    append({
      id: nanoid(),
      organization: "",
      role: "",
      startDate: "",
      endDate: "",
      description: "",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b pb-2">
        <div>
          <h3 className="text-base font-bold text-white">Volunteer Experience</h3>
          <p className="text-xs text-slate-400">Add community work, non-profit roles, or mentorship</p>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={addEntry}
          className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Role</span>
        </Button>
      </div>

      {fields.length === 0 ? (
        <div className="text-center py-6 border border-dashed border-slate-800 rounded-lg bg-slate-900/40">
          <HeartHandshake className="w-8 h-8 text-slate-500 mx-auto mb-2" />
          <p className="text-xs text-slate-400 font-medium">No volunteer experience added yet</p>
          <Button type="button" variant="outline" size="sm" onClick={addEntry} className="mt-2 text-xs border-slate-700 bg-slate-800 hover:bg-slate-700 text-white">
            + Add Volunteer Role
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="p-4 border border-slate-800 rounded-xl bg-slate-900/90 space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-semibold text-slate-200">
                  Volunteer Entry #{index + 1}
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
                  <Label className="text-xs">Role / Title *</Label>
                  <Input placeholder="Volunteer Mentor / Organizer" {...register(`entries.${index}.role`)} />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Organization Name *</Label>
                  <Input placeholder="Red Cross / Code.org" {...register(`entries.${index}.organization`)} />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Start Date (Optional)</Label>
                  <Input type="month" {...register(`entries.${index}.startDate`)} />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">End Date (Optional)</Label>
                  <Input type="month" {...register(`entries.${index}.endDate`)} />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Description (Optional)</Label>
                <Textarea
                  placeholder="Taught coding workshops to 30+ high school students every weekend..."
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
