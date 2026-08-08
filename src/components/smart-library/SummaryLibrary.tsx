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
import { Badge } from "@/components/ui/badge";
import { BookOpen, Check, Copy } from "lucide-react";
import toast from "react-hot-toast";

// Import summary JSON files
import fresherSummaries from "@/data/summaries/fresher.json";
import studentSummaries from "@/data/summaries/student.json";
import seSummaries from "@/data/summaries/software-engineer.json";
import feSummaries from "@/data/summaries/frontend-developer.json";
import beSummaries from "@/data/summaries/backend-developer.json";
import daSummaries from "@/data/summaries/data-analyst.json";
import teacherSummaries from "@/data/summaries/teacher.json";
import mbaSummaries from "@/data/summaries/mba.json";

type RoleCategory =
  | "fresher"
  | "student"
  | "software-engineer"
  | "frontend"
  | "backend"
  | "data-analyst"
  | "teacher"
  | "mba";

const SUMMARY_MAP: Record<RoleCategory, { id: string; role: string; text: string }[]> = {
  fresher: fresherSummaries,
  student: studentSummaries,
  "software-engineer": seSummaries,
  frontend: feSummaries,
  backend: beSummaries,
  "data-analyst": daSummaries,
  teacher: teacherSummaries,
  mba: mbaSummaries,
};

export function SummaryLibrary() {
  const isLibraryOpen = useUIStore((s) => s.isLibraryOpen);
  const libraryType = useUIStore((s) => s.libraryType);
  const closeLibrary = useUIStore((s) => s.closeLibrary);
  const updateSection = useResumeStore((s) => s.updateSection);

  const [selectedRole, setSelectedRole] = useState<RoleCategory>("fresher");
  const isOpen = isLibraryOpen && libraryType === "summary";

  const summaries = SUMMARY_MAP[selectedRole] || fresherSummaries;

  const handleUseSummary = (text: string) => {
    updateSection("summary", text);
    toast.success("Summary inserted into your resume!");
    closeLibrary();
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeLibrary()}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="border-b pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <SheetTitle className="text-base">Summary Library</SheetTitle>
          </div>
          <SheetDescription className="text-xs">
            Choose a pre-written, ATS-friendly professional summary template
          </SheetDescription>
        </SheetHeader>

        <div className="py-4 space-y-4">
          {/* Role Filter Dropdown */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Filter by Target Role</label>
            <Select
              value={selectedRole}
              onValueChange={(val) => setSelectedRole(val as RoleCategory)}
            >
              <SelectTrigger className="w-full text-xs">
                <SelectValue placeholder="Select role category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fresher">Fresh Graduate / Entry-Level</SelectItem>
                <SelectItem value="student">Student / Intern</SelectItem>
                <SelectItem value="software-engineer">Software Engineer (General)</SelectItem>
                <SelectItem value="frontend">Frontend Developer</SelectItem>
                <SelectItem value="backend">Backend Developer</SelectItem>
                <SelectItem value="data-analyst">Data Analyst / Business Analyst</SelectItem>
                <SelectItem value="teacher">Teacher / Educator</SelectItem>
                <SelectItem value="mba">MBA / Management</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Cards List */}
          <div className="space-y-3">
            {summaries.map((item) => (
              <div
                key={item.id}
                className="p-3.5 border rounded-xl bg-card hover:border-indigo-500/50 transition-all space-y-2.5 shadow-2xs border-slate-800"
              >
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px] bg-slate-800 text-indigo-300 border-indigo-500/30">
                    {item.role}
                  </Badge>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed text-justify">
                  {item.text}
                </p>

                <Button
                  type="button"
                  size="sm"
                  onClick={() => handleUseSummary(item.text)}
                  className="w-full h-8 text-xs bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Use This Summary</span>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
