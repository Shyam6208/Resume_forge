"use client";

import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { nanoid } from "nanoid";
import { useResumeStore } from "@/store/resume.store";
import type { CertificationEntry } from "@/types/resume.types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Award } from "lucide-react";

const certEntrySchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Certification name is required"),
  organization: z.string().min(1, "Organization is required"),
  issueDate: z.string().min(1, "Issue date is required"),
  expiryDate: z.string().optional(),
  credentialId: z.string().optional(),
  credentialUrl: z.string().optional(),
});

const certFormSchema = z.object({
  entries: z.array(certEntrySchema),
});

type CertFormValues = z.infer<typeof certFormSchema>;

export function CertificationsForm() {
  const currentResume = useResumeStore((s) => s.currentResume);
  const updateSection = useResumeStore((s) => s.updateSection);

  const initialEntries: CertFormValues["entries"] =
    (currentResume?.data.certifications || []).map((c) => ({ ...c }));

  const { register, control, watch } = useForm<CertFormValues>({
    resolver: zodResolver(certFormSchema),
    defaultValues: { entries: initialEntries },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "entries",
  });

  useEffect(() => {
    const subscription = watch((value) => {
      const formattedCerts: CertificationEntry[] = (value.entries || []).map((c) => ({
        id: c?.id || nanoid(),
        name: c?.name || "",
        organization: c?.organization || "",
        issueDate: c?.issueDate || "",
        expiryDate: c?.expiryDate,
        credentialId: c?.credentialId,
        credentialUrl: c?.credentialUrl,
      }));

      updateSection("certifications", formattedCerts);
    });
    return () => subscription.unsubscribe();
  }, [watch, updateSection]);

  const addEntry = (presetName?: string, presetOrg?: string) => {
    append({
      id: nanoid(),
      name: presetName || "",
      organization: presetOrg || "",
      issueDate: "",
      expiryDate: "",
      credentialId: "",
      credentialUrl: "",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b pb-2">
        <div>
          <h3 className="text-base font-bold text-white">Certifications & Licenses</h3>
          <p className="text-xs text-slate-400">Add relevant professional certifications and training</p>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={() => addEntry()}
          className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Certification</span>
        </Button>
      </div>

      {/* Quick Add Presets */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[11px] font-medium text-slate-400">Quick Add:</span>
        <button
          type="button"
          onClick={() => addEntry("AWS Certified Solutions Architect", "Amazon Web Services")}
          className="text-[11px] px-2 py-0.5 rounded border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-indigo-300 hover:text-indigo-200"
        >
          + AWS Certified
        </button>
        <button
          type="button"
          onClick={() => addEntry("Google Cloud Professional", "Google")}
          className="text-[11px] px-2 py-0.5 rounded border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-indigo-300 hover:text-indigo-200"
        >
          + GCP Professional
        </button>
        <button
          type="button"
          onClick={() => addEntry("Meta Front-End Developer", "Coursera / Meta")}
          className="text-[11px] px-2 py-0.5 rounded border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-indigo-300 hover:text-indigo-200"
        >
          + Meta Front-End
        </button>
      </div>

      {fields.length === 0 ? (
        <div className="text-center py-6 border border-dashed border-slate-800 rounded-lg bg-slate-900/40">
          <Award className="w-8 h-8 text-slate-500 mx-auto mb-2" />
          <p className="text-xs text-slate-400 font-medium">No certifications added yet</p>
          <Button type="button" variant="outline" size="sm" onClick={() => addEntry()} className="mt-2 text-xs border-slate-700 bg-slate-800 hover:bg-slate-700 text-white">
            + Add Certification
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="p-4 border border-slate-800 rounded-xl bg-slate-900/90 space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-semibold text-slate-200">
                  Certification #{index + 1}
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
                  <Label className="text-xs">Certification Name *</Label>
                  <Input placeholder="AWS Certified Solutions Architect" {...register(`entries.${index}.name`)} />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Issuing Organization *</Label>
                  <Input placeholder="Amazon Web Services" {...register(`entries.${index}.organization`)} />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Issue Date *</Label>
                  <Input type="month" {...register(`entries.${index}.issueDate`)} />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Expiration Date (Optional)</Label>
                  <Input type="month" {...register(`entries.${index}.expiryDate`)} />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Credential ID (Optional)</Label>
                  <Input placeholder="AWS-12345678" {...register(`entries.${index}.credentialId`)} />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Credential URL (Optional)</Label>
                  <Input placeholder="https://coursera.org/verify/..." {...register(`entries.${index}.credentialUrl`)} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
