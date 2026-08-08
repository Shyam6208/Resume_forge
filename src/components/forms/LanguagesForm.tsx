"use client";

import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { nanoid } from "nanoid";
import { useResumeStore } from "@/store/resume.store";
import type { LanguageEntry, LanguageProficiency } from "@/types/resume.types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Languages } from "lucide-react";

const languageEntrySchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Language name is required"),
  proficiency: z.enum(["beginner", "intermediate", "advanced", "native"]),
});

const languageFormSchema = z.object({
  entries: z.array(languageEntrySchema),
});

type LanguageFormValues = z.infer<typeof languageFormSchema>;

const PROFICIENCY_DOTS: Record<LanguageProficiency, number> = {
  beginner: 2,
  intermediate: 3,
  advanced: 4,
  native: 5,
};

export function LanguagesForm() {
  const currentResume = useResumeStore((s) => s.currentResume);
  const updateSection = useResumeStore((s) => s.updateSection);

  const initialEntries: LanguageFormValues["entries"] =
    (currentResume?.data.languages || []).map((l) => ({ ...l }));

  const { register, control, watch, setValue } = useForm<LanguageFormValues>({
    resolver: zodResolver(languageFormSchema),
    defaultValues: { entries: initialEntries },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "entries",
  });

  useEffect(() => {
    const subscription = watch((value) => {
      const formattedLanguages: LanguageEntry[] = (value.entries || []).map((l) => ({
        id: l?.id || nanoid(),
        name: l?.name || "",
        proficiency: l?.proficiency || "native",
      }));

      updateSection("languages", formattedLanguages);
    });
    return () => subscription.unsubscribe();
  }, [watch, updateSection]);

  const addEntry = (presetName?: string, presetLevel: LanguageProficiency = "native") => {
    append({
      id: nanoid(),
      name: presetName || "",
      proficiency: presetLevel,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b pb-2">
        <div>
          <h3 className="text-base font-bold text-white">Languages</h3>
          <p className="text-xs text-slate-400">Add languages you speak and your proficiency level</p>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={() => addEntry()}
          className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Language</span>
        </Button>
      </div>

      {fields.length === 0 ? (
        <div className="text-center py-6 border border-dashed border-slate-800 rounded-lg bg-slate-900/40">
          <Languages className="w-8 h-8 text-slate-500 mx-auto mb-2" />
          <p className="text-xs text-slate-400 font-medium">No languages added yet</p>
          <div className="flex justify-center gap-2 mt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => addEntry("English", "native")} className="text-xs border-slate-700 bg-slate-800 hover:bg-slate-700 text-white">
              + English (Native)
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => addEntry("Spanish", "intermediate")} className="text-xs border-slate-700 bg-slate-800 hover:bg-slate-700 text-white">
              + Spanish (Intermediate)
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {fields.map((field, index) => {
            const currentLevel = watch(`entries.${index}.proficiency`) || "intermediate";
            const dots = PROFICIENCY_DOTS[currentLevel] || 3;

            return (
              <div key={field.id} className="p-3 border border-slate-800 rounded-xl bg-slate-900/90 flex items-center justify-between gap-3 shadow-xs">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  <div className="space-y-1">
                    <Label className="text-xs">Language Name *</Label>
                    <Input placeholder="English / French / Spanish" {...register(`entries.${index}.name`)} />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Proficiency Level *</Label>
                    <Select
                      value={currentLevel}
                      onValueChange={(val) => {
                        if (val) {
                          setValue(`entries.${index}.proficiency`, val as LanguageProficiency);
                        }
                      }}
                    >
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner (Basic)</SelectItem>
                        <SelectItem value="intermediate">Intermediate (Conversational)</SelectItem>
                        <SelectItem value="advanced">Advanced (Fluent)</SelectItem>
                        <SelectItem value="native">Native / Bilingual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Dots preview */}
                <div className="flex items-center gap-1 shrink-0 pt-4">
                  {[1, 2, 3, 4, 5].map((d) => (
                    <div
                      key={d}
                      className={`w-2 h-2 rounded-full ${
                        d <= dots ? "bg-indigo-600" : "bg-slate-200"
                      }`}
                    />
                  ))}
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(index)}
                  className="h-8 w-8 p-0 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0 mt-4"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
