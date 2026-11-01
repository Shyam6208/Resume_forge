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
    <div className="space-y-5">
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-emerald-500/20 text-cyan-400 border border-cyan-500/30 shadow-md shadow-cyan-500/10">
            <HeartHandshake className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">Volunteer Experience</h3>
            <p className="text-xs text-muted-foreground">Add community work, non-profit contributions, or mentorship</p>
          </div>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={addEntry}
          className="bg-gradient-to-r from-cyan-500 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 font-extrabold text-xs rounded-xl shadow-md shadow-cyan-500/20 flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Role</span>
        </Button>
      </div>

      {fields.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-white/[0.1] rounded-2xl bg-card/40 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-muted-foreground flex items-center justify-center mx-auto">
            <HeartHandshake className="w-6 h-6 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="text-xs text-foreground font-semibold">No volunteer experience added yet</p>
            <p className="text-[11px] text-muted-foreground">Add mentorship, open-source initiatives, or non-profit volunteer work.</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addEntry}
            className="text-xs border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-foreground rounded-xl"
          >
            + Add Volunteer Role
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {fields.map((field, index) => (
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
                    Volunteer Entry #{index + 1}
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
                  <Label className="text-xs font-semibold text-foreground">Role / Title *</Label>
                  <Input
                    placeholder="Volunteer Mentor / Organizer"
                    {...register(`entries.${index}.role`)}
                    className="bg-card/80 border-white/[0.08] text-foreground focus-visible:ring-1 focus-visible:ring-cyan-500/50 rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">Organization Name *</Label>
                  <Input
                    placeholder="Red Cross / Code.org"
                    {...register(`entries.${index}.organization`)}
                    className="bg-card/80 border-white/[0.08] text-foreground focus-visible:ring-1 focus-visible:ring-cyan-500/50 rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">Start Date (Optional)</Label>
                  <Input
                    type="month"
                    {...register(`entries.${index}.startDate`)}
                    className="bg-card/80 border-white/[0.08] text-foreground focus-visible:ring-1 focus-visible:ring-cyan-500/50 rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">End Date (Optional)</Label>
                  <Input
                    type="month"
                    {...register(`entries.${index}.endDate`)}
                    className="bg-card/80 border-white/[0.08] text-foreground focus-visible:ring-1 focus-visible:ring-cyan-500/50 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Description (Optional)</Label>
                <Textarea
                  placeholder="Taught coding workshops to 30+ high school students every weekend..."
                  className="min-h-[70px] text-xs leading-relaxed bg-card/80 border-white/[0.08] text-foreground focus-visible:ring-1 focus-visible:ring-cyan-500/50 rounded-xl"
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
