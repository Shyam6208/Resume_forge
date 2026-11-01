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

  const currentProjects = useResumeStore((s) => s.currentResume?.data.projects);
  const updateSection = useResumeStore((s) => s.updateSection);

  const isOpen = isLibraryOpen && libraryType === "projects";

  if (!isOpen) {
    return null;
  }

  const handleUseProject = (proj: (typeof projectsData)[0]) => {
    const list = currentProjects || [];
    const newProject = {
      id: crypto.randomUUID(),
      name: proj.name,
      description: proj.description,
      technologies: proj.technologies,
    };

    updateSection("projects", [...list, newProject]);
    toast.success(`Project "${proj.name}" added to your resume!`);
    closeLibrary();
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeLibrary()}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto bg-card/95 border-l border-white/[0.08] backdrop-blur-2xl text-foreground">
        <SheetHeader className="border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-emerald-500/20 text-cyan-400 border border-cyan-500/30">
              <FolderKanban className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <SheetTitle className="text-base font-bold text-foreground">Project Template Library</SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground">
                Browse ready-to-use project architectures for full-stack, frontend, and backend builds
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="py-4 space-y-3.5">
          {projectsData.map((project) => (
            <div
              key={project.id}
              className="p-4 border rounded-2xl bg-card/70 hover:border-cyan-500/30 transition-all space-y-2.5 shadow-xs border-white/[0.08] backdrop-blur-md"
            >
              <h4 className="text-xs font-bold text-foreground">{project.name}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {project.description}
              </p>

              <div className="flex flex-wrap gap-1.5 py-1">
                {project.technologies.map((tech, i) => (
                  <Badge
                    key={i}
                    variant="secondary"
                    className="text-[10px] bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-medium"
                  >
                    {tech}
                  </Badge>
                ))}
              </div>

              <Button
                type="button"
                size="sm"
                onClick={() => handleUseProject(project)}
                className="w-full h-8 text-xs bg-gradient-to-r from-cyan-500 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 font-extrabold flex items-center justify-center gap-1.5 mt-2 rounded-xl shadow-md shadow-cyan-500/20"
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
