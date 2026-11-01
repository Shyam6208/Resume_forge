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
    <div className="space-y-5">
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-emerald-500/20 text-cyan-400 border border-cyan-500/30 shadow-md shadow-cyan-500/10">
            <Languages className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">Languages</h3>
            <p className="text-xs text-muted-foreground">Add languages you speak and your proficiency level</p>
          </div>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={() => addEntry()}
          className="bg-gradient-to-r from-cyan-500 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 font-extrabold text-xs rounded-xl shadow-md shadow-cyan-500/20 flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Language</span>
        </Button>
      </div>

      {fields.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-white/[0.1] rounded-2xl bg-card/40 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-muted-foreground flex items-center justify-center mx-auto">
            <Languages className="w-6 h-6 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="text-xs text-foreground font-semibold">No languages added yet</p>
            <p className="text-[11px] text-muted-foreground">Select one of the presets or add custom languages.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addEntry("English", "native")}
              className="text-xs border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-foreground rounded-xl"
            >
              + English (Native)
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addEntry("Spanish", "intermediate")}
              className="text-xs border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-foreground rounded-xl"
            >
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
              <div
                key={field.id}
                className="p-4 border border-white/[0.08] hover:border-white/[0.12] rounded-2xl bg-card/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm backdrop-blur-md transition-all"
              >
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3.5 items-center">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">Language Name *</Label>
                    <Input
                      placeholder="English / French / Spanish"
                      {...register(`entries.${index}.name`)}
                      className="bg-card/80 border-white/[0.08] text-foreground focus-visible:ring-1 focus-visible:ring-cyan-500/50 rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">Proficiency Level *</Label>
                    <Select
                      value={currentLevel}
                      onValueChange={(val) => {
                        if (val) {
                          setValue(`entries.${index}.proficiency`, val as LanguageProficiency);
                        }
                      }}
                    >
                      <SelectTrigger className="h-9 text-xs bg-card/80 border-white/[0.08] text-foreground focus:ring-1 focus:ring-cyan-500/50 rounded-xl">
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-white/[0.08] text-foreground rounded-xl">
                        <SelectItem value="beginner">Beginner (Basic)</SelectItem>
                        <SelectItem value="intermediate">Intermediate (Conversational)</SelectItem>
                        <SelectItem value="advanced">Advanced (Fluent)</SelectItem>
                        <SelectItem value="native">Native / Bilingual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Dots preview & Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-3 pt-1 sm:pt-4">
                  <div className="flex items-center gap-1 shrink-0" title={`Level: ${dots}/5`}>
                    {[1, 2, 3, 4, 5].map((d) => (
                      <div
                        key={d}
                        className={`w-2 h-2 rounded-full transition-all ${
                          d <= dots
                            ? "bg-gradient-to-r from-cyan-400 to-emerald-400 shadow-xs shadow-cyan-400/50"
                            : "bg-white/[0.12]"
                        }`}
                      />
                    ))}
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                    className="h-8 w-8 p-0 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors shrink-0"
                    title="Remove Language"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
