"use client";

import { useUIStore } from "@/store/ui.store";
import { useResumeStore } from "@/store/resume.store";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FolderKanban, Plus } from "lucide-react";
import toast from "react-hot-toast";
import projectsData from "@/data/projects.json";

export function ProjectLibrary() {
  const isLibraryOpen = useUIStore((s) => s.isLibraryOpen);
  const libraryType = useUIStore((s) => s.libraryType);
  const closeLibrary = useUIStore((s) => s.closeLibrary);

  const currentResume = useResumeStore((s) => s.currentResume);
  const updateSection = useResumeStore((s) => s.updateSection);

  const isOpen = isLibraryOpen && libraryType === "projects";

  const handleUseProject = (proj: (typeof projectsData)[0]) => {
    const currentProjects = currentResume?.data.projects || [];
    const newProject = {
      id: crypto.randomUUID(),
      name: proj.name,
      description: proj.description,
      technologies: proj.technologies,
    };

    updateSection("projects", [...currentProjects, newProject]);
    toast.success(`Project "${proj.name}" added to your resume!`);
    closeLibrary();
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeLibrary()}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="border-b pb-3">
          <div className="flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-indigo-600" />
            <SheetTitle className="text-base">Project Template Library</SheetTitle>
          </div>
          <SheetDescription className="text-xs">
            Browse ready-to-use project templates for full-stack, frontend, and backend builds
          </SheetDescription>
        </SheetHeader>

        <div className="py-4 space-y-3">
          {projectsData.map((project) => (
            <div
              key={project.id}
              className="p-4 border rounded-xl bg-card hover:border-indigo-200 transition-all space-y-2 shadow-2xs"
            >
              <h4 className="text-xs font-bold text-slate-100">{project.name}</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {project.description}
              </p>

              <div className="flex flex-wrap gap-1 py-1">
                {project.technologies.map((tech, i) => (
                  <Badge
                    key={i}
                    variant="secondary"
                    className="text-[10px] bg-slate-800 text-slate-300 border border-slate-700 font-medium"
                  >
                    {tech}
                  </Badge>
                ))}
              </div>

              <Button
                type="button"
                size="sm"
                onClick={() => handleUseProject(project)}
                className="w-full h-8 text-xs bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center gap-1 mt-2"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Use Project Template</span>
              </Button>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
