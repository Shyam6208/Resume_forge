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
import { BookOpen, Copy } from "lucide-react";
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

  if (!isOpen) {
    return null;
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeLibrary()}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto bg-card/95 border-l border-white/[0.08] backdrop-blur-2xl text-foreground">
        <SheetHeader className="border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-emerald-500/20 text-cyan-400 border border-cyan-500/30">
              <BookOpen className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <SheetTitle className="text-base font-bold text-foreground">Summary Library</SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground">
                Choose a pre-written, ATS-friendly professional summary template
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="py-4 space-y-4">
          {/* Role Filter Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Filter by Target Role</label>
            <Select
              value={selectedRole}
              onValueChange={(val) => setSelectedRole(val as RoleCategory)}
            >
              <SelectTrigger className="w-full text-xs bg-card/80 border-white/[0.08] text-foreground rounded-xl">
                <SelectValue placeholder="Select role category" />
              </SelectTrigger>
              <SelectContent className="bg-card border-white/[0.08] text-foreground rounded-xl">
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
                className="p-4 border rounded-2xl bg-card/70 hover:border-cyan-500/30 transition-all space-y-3 shadow-xs border-white/[0.08] backdrop-blur-md"
              >
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px] bg-cyan-500/10 text-cyan-300 border-cyan-500/20 font-semibold">
                    {item.role}
                  </Badge>
                </div>

                <p className="text-xs text-foreground/90 leading-relaxed">
                  {item.text}
                </p>

                <Button
                  type="button"
                  size="sm"
                  onClick={() => handleUseSummary(item.text)}
                  className="w-full h-8 text-xs bg-gradient-to-r from-cyan-500 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 font-extrabold flex items-center justify-center gap-1.5 rounded-xl shadow-md shadow-cyan-500/20"
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
