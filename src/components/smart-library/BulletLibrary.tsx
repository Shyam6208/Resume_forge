"use client";

import { useState } from "react";
import { useUIStore } from "@/store/ui.store";
import { useResumeStore } from "@/store/resume.store";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Lightbulb, Plus, Check } from "lucide-react";
import toast from "react-hot-toast";

import seBullets from "@/data/bullets/software-engineer.json";
import feBullets from "@/data/bullets/frontend-developer.json";
import beBullets from "@/data/bullets/backend-developer.json";
import daBullets from "@/data/bullets/data-analyst.json";
import teacherBullets from "@/data/bullets/teacher.json";
import fresherBullets from "@/data/bullets/fresher.json";

type RoleCategory =
  | "software-engineer"
  | "frontend"
  | "backend"
  | "data-analyst"
  | "teacher"
  | "fresher";

const BULLET_MAP: Record<RoleCategory, string[]> = {
  "software-engineer": seBullets.responsibilities,
  frontend: feBullets.responsibilities,
  backend: beBullets.responsibilities,
  "data-analyst": daBullets.responsibilities,
  teacher: teacherBullets.responsibilities,
  fresher: fresherBullets.responsibilities,
};

export function BulletLibrary() {
  const isLibraryOpen = useUIStore((s) => s.isLibraryOpen);
  const libraryType = useUIStore((s) => s.libraryType);
  const closeLibrary = useUIStore((s) => s.closeLibrary);

  const currentExperience = useResumeStore((s) => s.currentResume?.data.experience);
  const updateSection = useResumeStore((s) => s.updateSection);

  const [selectedRole, setSelectedRole] = useState<RoleCategory>("software-engineer");
  const [selectedBullets, setSelectedBullets] = useState<string[]>([]);

  const isOpen = isLibraryOpen && libraryType === "bullets";

  if (!isOpen) {
    return null;
  }

  const bullets = BULLET_MAP[selectedRole] || seBullets.responsibilities;

  const toggleBullet = (bullet: string) => {
    setSelectedBullets((prev) =>
      prev.includes(bullet)
        ? prev.filter((b) => b !== bullet)
        : [...prev, bullet]
    );
  };

  const handleAddSelected = () => {
    if (selectedBullets.length === 0) {
      toast.error("Please select at least one bullet point.");
      return;
    }

    const expList = currentExperience || [];

    if (expList.length === 0) {
      // Create a default experience entry if none exists
      const newEntry = {
        id: Date.now().toString(),
        company: "Company Name",
        position: "Role Title",
        startDate: new Date().toISOString().slice(0, 7),
        isCurrentlyWorking: true,
        responsibilities: selectedBullets,
      };
      updateSection("experience", [newEntry]);
    } else {
      // Append to the first / latest experience entry
      const updatedExperience = [...expList];
      const target = updatedExperience[0];
      const existingBullets = target.responsibilities || [];

      updatedExperience[0] = {
        ...target,
        responsibilities: [...existingBullets, ...selectedBullets],
      };
      updateSection("experience", updatedExperience);
    }

    toast.success(`Added ${selectedBullets.length} bullet points to experience!`);
    setSelectedBullets([]);
    closeLibrary();
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeLibrary()}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="border-b pb-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            <SheetTitle className="text-base">Responsibility Bullet Library</SheetTitle>
          </div>
          <SheetDescription className="text-xs">
            Select bullet points to insert into your experience section
          </SheetDescription>
        </SheetHeader>

        <div className="py-4 space-y-4">
          {/* Role Category Selector */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Select Job Role</label>
            <Select
              value={selectedRole}
              onValueChange={(val) => setSelectedRole(val as RoleCategory)}
            >
              <SelectTrigger className="w-full text-xs">
                <SelectValue placeholder="Select role category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="software-engineer">Software Engineer</SelectItem>
                <SelectItem value="frontend">Frontend Developer</SelectItem>
                <SelectItem value="backend">Backend Developer</SelectItem>
                <SelectItem value="data-analyst">Data Analyst</SelectItem>
                <SelectItem value="teacher">Teacher / Educator</SelectItem>
                <SelectItem value="fresher">Fresher / Graduate Project Bullets</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
            <span className="text-xs font-medium text-slate-300">
              {selectedBullets.length} selected
            </span>
            <Button
              type="button"
              size="sm"
              onClick={handleAddSelected}
              disabled={selectedBullets.length === 0}
              className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 h-8"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Selected Bullets</span>
            </Button>
          </div>

          {/* Bullets List with Checkboxes */}
          <div className="space-y-2">
            {bullets.map((bullet, idx) => {
              const isChecked = selectedBullets.includes(bullet);

              return (
                <div
                  key={idx}
                  onClick={() => toggleBullet(bullet)}
                  className={`p-3 border rounded-xl cursor-pointer transition-all flex items-start gap-3 text-xs leading-relaxed ${
                    isChecked
                      ? "bg-indigo-50/60 border-indigo-300 text-indigo-950 font-medium"
                      : "bg-card hover:border-slate-300 text-slate-700"
                  }`}
                >
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={() => toggleBullet(bullet)}
                    className="mt-0.5"
                  />
                  <span className="flex-1">• {bullet}</span>
                </div>
              );
            })}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
