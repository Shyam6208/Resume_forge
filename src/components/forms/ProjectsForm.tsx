"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { nanoid } from "nanoid";
import { useResumeStore } from "@/store/resume.store";
import type { ProjectEntry } from "@/types/resume.types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, FolderKanban, X } from "lucide-react";

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
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b pb-2">
        <div>
          <h3 className="text-base font-bold text-white">Projects</h3>
          <p className="text-xs text-slate-400">
            Add your college, personal, or open-source projects — essential for technical profiles
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={addEntry}
          className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Project</span>
        </Button>
      </div>

      {fields.length === 0 ? (
        <div className="text-center py-6 border border-dashed border-slate-800 rounded-lg bg-slate-900/40">
          <FolderKanban className="w-8 h-8 text-slate-500 mx-auto mb-2" />
          <p className="text-xs text-slate-400 font-medium">No projects added yet</p>
          <Button type="button" variant="outline" size="sm" onClick={addEntry} className="mt-2 text-xs border-slate-700 bg-slate-800 hover:bg-slate-700 text-white">
            + Add First Project
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="p-4 border border-slate-800 rounded-xl bg-slate-900/90 space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-semibold text-slate-200">
                  Project #{index + 1}
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
                  <Label className="text-xs">Project Name *</Label>
                  <Input placeholder="E-Commerce Platform" {...register(`entries.${index}.name`)} />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Technologies (comma separated)</Label>
                  <Input
                    placeholder="React, Node.js, PostgreSQL, Tailwind"
                    {...register(`entries.${index}.technologiesText`)}
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">GitHub Link (Optional)</Label>
                  <Input placeholder="github.com/user/repo" {...register(`entries.${index}.githubLink`)} />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Live Demo URL (Optional)</Label>
                  <Input placeholder="https://myproject.verce.app" {...register(`entries.${index}.liveDemo`)} />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Description & Key Highlights *</Label>
                <Textarea
                  placeholder="Built a full-stack e-commerce app with Stripe integration, handling 500+ daily orders..."
                  className="min-h-[80px] text-xs leading-relaxed"
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
