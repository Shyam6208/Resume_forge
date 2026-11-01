"use client";

import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { nanoid } from "nanoid";
import { useResumeStore } from "@/store/resume.store";
import { useUIStore } from "@/store/ui.store";
import type { ProjectEntry } from "@/types/resume.types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, FolderKanban } from "lucide-react";
import { ImproveWithAIButton } from "@/components/ai/ImproveWithAIButton";

const projectEntrySchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Project name is required"),
  technologiesText: z.string(), // comma separated or tag list
  description: z.string().min(1, "Description is required"),
  githubLink: z.string().optional(),
  liveDemo: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

const projectsFormSchema = z.object({
  entries: z.array(projectEntrySchema),
});

type ProjectsFormValues = z.infer<typeof projectsFormSchema>;

export function ProjectsForm() {
  const currentResume = useResumeStore((s) => s.currentResume);
  const updateSection = useResumeStore((s) => s.updateSection);
  const jobDescription = useUIStore((s) => s.jobDescription);

  const initialEntries: ProjectsFormValues["entries"] =
    (currentResume?.data.projects || []).map((p) => ({
      ...p,
      technologiesText: p.technologies?.join(", ") || "",
    }));

  const { register, control, watch, setValue } = useForm<ProjectsFormValues>({
    resolver: zodResolver(projectsFormSchema),
    defaultValues: { entries: initialEntries },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "entries",
  });

  useEffect(() => {
    const subscription = watch((value) => {
      const formattedProjects: ProjectEntry[] = (value.entries || []).map((p) => ({
        id: p?.id || nanoid(),
        name: p?.name || "",
        technologies: p?.technologiesText
          ? p.technologiesText
              .split(",")
              .map((t) => t.trim())
              .filter((t) => t.length > 0)
          : [],
        description: p?.description || "",
        githubLink: p?.githubLink,
        liveDemo: p?.liveDemo,
        startDate: p?.startDate,
        endDate: p?.endDate,
      }));

      updateSection("projects", formattedProjects);
    });
    return () => subscription.unsubscribe();
  }, [watch, updateSection]);

  const addEntry = () => {
    append({
      id: nanoid(),
      name: "",
      technologiesText: "",
      description: "",
      githubLink: "",
      liveDemo: "",
      startDate: "",
      endDate: "",
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-emerald-500/20 text-cyan-400 border border-cyan-500/30 shadow-md shadow-cyan-500/10">
            <FolderKanban className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">Projects</h3>
            <p className="text-xs text-muted-foreground">
              Add your personal, open-source, or client projects — essential for technical profiles
            </p>
          </div>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={addEntry}
          className="bg-gradient-to-r from-cyan-500 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 font-extrabold text-xs rounded-xl shadow-md shadow-cyan-500/20 flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Project</span>
        </Button>
      </div>

      {fields.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-white/[0.1] rounded-2xl bg-card/40 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-muted-foreground flex items-center justify-center mx-auto">
            <FolderKanban className="w-6 h-6 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="text-xs text-foreground font-semibold">No projects added yet</p>
            <p className="text-[11px] text-muted-foreground">Showcase key architectures, apps, or open-source repositories.</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addEntry}
            className="text-xs border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-foreground rounded-xl"
          >
            + Add First Project
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
                    Project #{index + 1}
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
                  <Label className="text-xs font-semibold text-foreground">Project Name *</Label>
                  <Input
                    placeholder="Distributed Task Queue"
                    {...register(`entries.${index}.name`)}
                    className="bg-card/80 border-white/[0.08] text-foreground focus-visible:ring-1 focus-visible:ring-cyan-500/50 rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">Technologies (comma separated)</Label>
                  <Input
                    placeholder="React, Next.js, Go, Redis, Docker"
                    {...register(`entries.${index}.technologiesText`)}
                    className="bg-card/80 border-white/[0.08] text-foreground focus-visible:ring-1 focus-visible:ring-cyan-500/50 rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">GitHub Link (Optional)</Label>
                  <Input
                    placeholder="github.com/user/project"
                    {...register(`entries.${index}.githubLink`)}
                    className="bg-card/80 border-white/[0.08] text-foreground focus-visible:ring-1 focus-visible:ring-cyan-500/50 rounded-xl font-mono text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">Live Demo URL (Optional)</Label>
                  <Input
                    placeholder="https://myproject.vercel.app"
                    {...register(`entries.${index}.liveDemo`)}
                    className="bg-card/80 border-white/[0.08] text-foreground focus-visible:ring-1 focus-visible:ring-cyan-500/50 rounded-xl font-mono text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Label className="text-xs font-semibold text-foreground">Description & Key Highlights *</Label>
                  <div className="flex flex-wrap items-center gap-2">
                    <ImproveWithAIButton 
                      sectionKey="projects" 
                      currentData={watch(`entries.${index}.description`) || ""}
                      onApply={(improvedData) => setValue(`entries.${index}.description`, improvedData, { shouldDirty: true, shouldValidate: true })}
                    />
                    {jobDescription.trim().length >= 30 && (
                      <ImproveWithAIButton 
                        sectionKey="projects" 
                        mode="optimize"
                        currentData={watch(`entries.${index}.description`) || ""}
                        onApply={(improvedData) => setValue(`entries.${index}.description`, improvedData, { shouldDirty: true, shouldValidate: true })}
                      />
                    )}
                  </div>
                </div>
                <Textarea
                  placeholder="Built a high-throughput queue handler with Redis stream persistence, reducing latency by 45%..."
                  className="min-h-[90px] text-xs leading-relaxed bg-card/80 border-white/[0.08] text-foreground focus-visible:ring-1 focus-visible:ring-cyan-500/50 rounded-xl"
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
