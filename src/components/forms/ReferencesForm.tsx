"use client";

import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { nanoid } from "nanoid";
import { useResumeStore } from "@/store/resume.store";
import type { ReferenceEntry } from "@/types/resume.types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Users } from "lucide-react";

const refEntrySchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  position: z.string().optional(),
  company: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
});

const refFormSchema = z.object({
  entries: z.array(refEntrySchema),
});

type RefFormValues = z.infer<typeof refFormSchema>;

export function ReferencesForm() {
  const currentResume = useResumeStore((s) => s.currentResume);
  const updateSection = useResumeStore((s) => s.updateSection);

  const initialEntries: RefFormValues["entries"] =
    (currentResume?.data.references || []).map((r) => ({ ...r }));

  const { register, control, watch } = useForm<RefFormValues>({
    resolver: zodResolver(refFormSchema),
    defaultValues: { entries: initialEntries },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "entries",
  });

  useEffect(() => {
    const subscription = watch((value) => {
      const formattedReferences: ReferenceEntry[] = (value.entries || []).map((r) => ({
        id: r?.id || nanoid(),
        name: r?.name || "",
        position: r?.position,
        company: r?.company,
        email: r?.email,
        phone: r?.phone,
      }));

      updateSection("references", formattedReferences);
    });
    return () => subscription.unsubscribe();
  }, [watch, updateSection]);

  const addEntry = () => {
    append({
      id: nanoid(),
      name: "",
      position: "",
      company: "",
      email: "",
      phone: "",
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-emerald-500/20 text-cyan-400 border border-cyan-500/30 shadow-md shadow-cyan-500/10">
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">References</h3>
            <p className="text-xs text-muted-foreground">Add professional references, managers, or professors who can vouch for you</p>
          </div>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={addEntry}
          className="bg-gradient-to-r from-cyan-500 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 font-extrabold text-xs rounded-xl shadow-md shadow-cyan-500/20 flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Reference</span>
        </Button>
      </div>

      {fields.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-white/[0.1] rounded-2xl bg-card/40 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-muted-foreground flex items-center justify-center mx-auto">
            <Users className="w-6 h-6 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="text-xs text-foreground font-semibold">No references added yet</p>
            <p className="text-[11px] text-muted-foreground">Add past engineering managers, tech leads, or mentors upon request.</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addEntry}
            className="text-xs border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-foreground rounded-xl"
          >
            + Add Reference
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
                    Reference #{index + 1}
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
                  <Label className="text-xs font-semibold text-foreground">Full Name *</Label>
                  <Input
                    placeholder="Dr. Sarah Jenkins"
                    {...register(`entries.${index}.name`)}
                    className="bg-card/80 border-white/[0.08] text-foreground focus-visible:ring-1 focus-visible:ring-cyan-500/50 rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">Position / Title (Optional)</Label>
                  <Input
                    placeholder="VP of Engineering"
                    {...register(`entries.${index}.position`)}
                    className="bg-card/80 border-white/[0.08] text-foreground focus-visible:ring-1 focus-visible:ring-cyan-500/50 rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">Company / Organization (Optional)</Label>
                  <Input
                    placeholder="Google"
                    {...register(`entries.${index}.company`)}
                    className="bg-card/80 border-white/[0.08] text-foreground focus-visible:ring-1 focus-visible:ring-cyan-500/50 rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">Email (Optional)</Label>
                  <Input
                    type="email"
                    placeholder="sarah@example.com"
                    {...register(`entries.${index}.email`)}
                    className="bg-card/80 border-white/[0.08] text-foreground focus-visible:ring-1 focus-visible:ring-cyan-500/50 rounded-xl"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-xs font-semibold text-foreground">Phone (Optional)</Label>
                  <Input
                    placeholder="+1 (555) 123-4567"
                    {...register(`entries.${index}.phone`)}
                    className="bg-card/80 border-white/[0.08] text-foreground focus-visible:ring-1 focus-visible:ring-cyan-500/50 rounded-xl"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
