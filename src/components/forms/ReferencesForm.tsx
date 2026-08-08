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
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b pb-2">
        <div>
          <h3 className="text-base font-bold text-white">References</h3>
          <p className="text-xs text-slate-400">Add professional references or managers who can vouch for your work</p>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={addEntry}
          className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Reference</span>
        </Button>
      </div>

      {fields.length === 0 ? (
        <div className="text-center py-6 border border-dashed border-slate-800 rounded-lg bg-slate-900/40">
          <Users className="w-8 h-8 text-slate-500 mx-auto mb-2" />
          <p className="text-xs text-slate-400 font-medium">No references added yet</p>
          <Button type="button" variant="outline" size="sm" onClick={addEntry} className="mt-2 text-xs border-slate-700 bg-slate-800 hover:bg-slate-700 text-white">
            + Add Reference
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="p-4 border border-slate-800 rounded-xl bg-slate-900/90 space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-semibold text-slate-200">
                  Reference #{index + 1}
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
                  <Label className="text-xs">Full Name *</Label>
                  <Input placeholder="Dr. Sarah Jenkins" {...register(`entries.${index}.name`)} />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Position / Title (Optional)</Label>
                  <Input placeholder="VP of Engineering" {...register(`entries.${index}.position`)} />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Company / Institution (Optional)</Label>
                  <Input placeholder="Google" {...register(`entries.${index}.company`)} />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Email (Optional)</Label>
                  <Input type="email" placeholder="sarah@example.com" {...register(`entries.${index}.email`)} />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Phone (Optional)</Label>
                  <Input placeholder="+1 (555) 123-4567" {...register(`entries.${index}.phone`)} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
