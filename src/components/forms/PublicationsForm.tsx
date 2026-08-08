"use client";

import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { nanoid } from "nanoid";
import { useResumeStore } from "@/store/resume.store";
import type { PublicationEntry } from "@/types/resume.types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, BookText } from "lucide-react";

const pubEntrySchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  publisher: z.string().optional(),
  date: z.string().optional(),
  url: z.string().optional(),
  description: z.string().optional(),
});

const pubFormSchema = z.object({
  entries: z.array(pubEntrySchema),
});

type PubFormValues = z.infer<typeof pubFormSchema>;

export function PublicationsForm() {
  const currentResume = useResumeStore((s) => s.currentResume);
  const updateSection = useResumeStore((s) => s.updateSection);

  const initialEntries: PubFormValues["entries"] =
    (currentResume?.data.publications || []).map((p) => ({ ...p }));

  const { register, control, watch } = useForm<PubFormValues>({
    resolver: zodResolver(pubFormSchema),
    defaultValues: { entries: initialEntries },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "entries",
  });

  useEffect(() => {
    const subscription = watch((value) => {
      const formattedPublications: PublicationEntry[] = (value.entries || []).map((p) => ({
        id: p?.id || nanoid(),
        title: p?.title || "",
        publisher: p?.publisher,
        date: p?.date,
        url: p?.url,
        description: p?.description,
      }));

      updateSection("publications", formattedPublications);
    });
    return () => subscription.unsubscribe();
  }, [watch, updateSection]);

  const addEntry = () => {
    append({
      id: nanoid(),
      title: "",
      publisher: "",
      date: "",
      url: "",
      description: "",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b pb-2">
        <div>
          <h3 className="text-base font-bold text-white">Publications & Research</h3>
          <p className="text-xs text-slate-400">Add research papers, articles, or published books</p>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={addEntry}
          className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Publication</span>
        </Button>
      </div>

      {fields.length === 0 ? (
        <div className="text-center py-6 border border-dashed border-slate-800 rounded-lg bg-slate-900/40">
          <BookText className="w-8 h-8 text-slate-500 mx-auto mb-2" />
          <p className="text-xs text-slate-400 font-medium">No publications added yet</p>
          <Button type="button" variant="outline" size="sm" onClick={addEntry} className="mt-2 text-xs border-slate-700 bg-slate-800 hover:bg-slate-700 text-white">
            + Add Publication
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="p-4 border border-slate-800 rounded-xl bg-slate-900/90 space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-semibold text-slate-200">
                  Publication #{index + 1}
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
                <div className="space-y-1 sm:col-span-2">
                  <Label className="text-xs">Publication Title *</Label>
                  <Input placeholder="Optimizing Neural Networks for Edge Devices" {...register(`entries.${index}.title`)} />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Publisher / Journal (Optional)</Label>
                  <Input placeholder="IEEE / Springer / Medium" {...register(`entries.${index}.publisher`)} />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Date (Optional)</Label>
                  <Input type="month" {...register(`entries.${index}.date`)} />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <Label className="text-xs">Article / DOI URL (Optional)</Label>
                  <Input placeholder="https://doi.org/10.1145/..." {...register(`entries.${index}.url`)} />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Description / Abstract (Optional)</Label>
                <Textarea
                  placeholder="Co-authored research paper on memory optimization in lightweight vision transformers..."
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
