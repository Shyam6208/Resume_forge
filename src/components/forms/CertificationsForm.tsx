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
    <div className="space-y-5">
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-emerald-500/20 text-cyan-400 border border-cyan-500/30 shadow-md shadow-cyan-500/10">
            <Award className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">Certifications & Licenses</h3>
            <p className="text-xs text-muted-foreground">Add verified professional certifications, cloud badges, and training</p>
          </div>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={() => addEntry()}
          className="bg-gradient-to-r from-cyan-500 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 font-extrabold text-xs rounded-xl shadow-md shadow-cyan-500/20 flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Certification</span>
        </Button>
      </div>

      {/* Quick Add Presets */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[11px] font-semibold text-muted-foreground">Quick Add:</span>
        <button
          type="button"
          onClick={() => addEntry("AWS Certified Solutions Architect", "Amazon Web Services")}
          className="text-xs px-2.5 py-1 rounded-xl border border-white/[0.08] bg-white/[0.04] hover:bg-cyan-500/10 hover:border-cyan-500/30 text-cyan-300 hover:text-cyan-200 transition-colors"
        >
          + AWS Certified
        </button>
        <button
          type="button"
          onClick={() => addEntry("Google Cloud Professional", "Google")}
          className="text-xs px-2.5 py-1 rounded-xl border border-white/[0.08] bg-white/[0.04] hover:bg-cyan-500/10 hover:border-cyan-500/30 text-cyan-300 hover:text-cyan-200 transition-colors"
        >
          + GCP Professional
        </button>
        <button
          type="button"
          onClick={() => addEntry("Meta Front-End Developer", "Coursera / Meta")}
          className="text-xs px-2.5 py-1 rounded-xl border border-white/[0.08] bg-white/[0.04] hover:bg-cyan-500/10 hover:border-cyan-500/30 text-cyan-300 hover:text-cyan-200 transition-colors"
        >
          + Meta Front-End
        </button>
      </div>

      {fields.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-white/[0.1] rounded-2xl bg-card/40 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-muted-foreground flex items-center justify-center mx-auto">
            <Award className="w-6 h-6 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="text-xs text-foreground font-semibold">No certifications added yet</p>
            <p className="text-[11px] text-muted-foreground">Add cloud licenses, bootcamp accreditations, or industry certificates.</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addEntry()}
            className="text-xs border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-foreground rounded-xl"
          >
            + Add Certification
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
                    Certification #{index + 1}
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
                  <Label className="text-xs font-semibold text-foreground">Certification Name *</Label>
                  <Input
                    placeholder="AWS Certified Solutions Architect"
                    {...register(`entries.${index}.name`)}
                    className="bg-card/80 border-white/[0.08] text-foreground focus-visible:ring-1 focus-visible:ring-cyan-500/50 rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">Issuing Organization *</Label>
                  <Input
                    placeholder="Amazon Web Services"
                    {...register(`entries.${index}.organization`)}
                    className="bg-card/80 border-white/[0.08] text-foreground focus-visible:ring-1 focus-visible:ring-cyan-500/50 rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">Issue Date *</Label>
                  <Input
                    type="month"
                    {...register(`entries.${index}.issueDate`)}
                    className="bg-card/80 border-white/[0.08] text-foreground focus-visible:ring-1 focus-visible:ring-cyan-500/50 rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">Expiration Date (Optional)</Label>
                  <Input
                    type="month"
                    {...register(`entries.${index}.expiryDate`)}
                    className="bg-card/80 border-white/[0.08] text-foreground focus-visible:ring-1 focus-visible:ring-cyan-500/50 rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">Credential ID (Optional)</Label>
                  <Input
                    placeholder="AWS-12345678"
                    {...register(`entries.${index}.credentialId`)}
                    className="bg-card/80 border-white/[0.08] text-foreground focus-visible:ring-1 focus-visible:ring-cyan-500/50 rounded-xl font-mono text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">Credential URL (Optional)</Label>
                  <Input
                    placeholder="https://credly.com/badges/..."
                    {...register(`entries.${index}.credentialUrl`)}
                    className="bg-card/80 border-white/[0.08] text-foreground focus-visible:ring-1 focus-visible:ring-cyan-500/50 rounded-xl font-mono text-xs"
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
