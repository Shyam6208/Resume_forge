"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import type { Resume, UserType } from "@/types/resume.types";
import { calculateResumeScore } from "@/utils/score-calculator";
import { TEMPLATES } from "@/config/templates.config";
import { usePDFExport } from "@/hooks/usePDFExport";
import { useResumeStore } from "@/store/resume.store";
import {
  MoreVertical,
  Edit2,
  Download,
  Copy,
  Trash2,
  Check,
  X,
  Loader2,
  LayoutTemplate,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import toast from "react-hot-toast";

interface ResumeCardProps {
  resume: Resume;
  onUpdate: (updatedResume: Resume) => void;
  onDelete: (resumeId: string) => void;
  onDuplicate: (newResume: Resume) => void;
}

export function ResumeCard({
  resume,
  onUpdate,
  onDelete,
  onDuplicate,
}: ResumeCardProps) {
  const setResume = useResumeStore((s) => s.setResume);
  const { isExporting: isExportingPDF, exportPDF } = usePDFExport();

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(resume.title);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);

  const templateInfo = TEMPLATES.find((t) => t.id === resume.templateId) || TEMPLATES[0];

  // Calculate score dynamically
  const scoreResult = calculateResumeScore(resume.data, (resume.targetJob as UserType) || "developer");
  const score = scoreResult.score;

  const handleSaveTitle = async () => {
    if (!titleInput.trim() || titleInput === resume.title) {
      setIsEditingTitle(false);
      return;
    }

    const updated = { ...resume, title: titleInput.trim(), updatedAt: new Date().toISOString() };
    onUpdate(updated);
    setIsEditingTitle(false);

    try {
      await fetch(`/api/resume/${resume.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: titleInput.trim() }),
      });
      toast.success("Resume title updated!");
    } catch (err) {
      console.warn("Could not sync updated title with server:", err);
    }
  };

  const handleDuplicate = async () => {
    setIsDuplicating(true);
    const toastId = toast.loading("Duplicating resume...");

    try {
      const res = await fetch("/api/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `${resume.title} (Copy)`,
          templateId: resume.templateId,
          targetJob: resume.targetJob,
          data: resume.data,
          theme: resume.theme,
          sectionOrder: resume.sectionOrder,
        }),
      });

      if (!res.ok) throw new Error("Failed to duplicate resume");
      const duplicatedResume: Resume = await res.json();
      onDuplicate(duplicatedResume);
      toast.dismiss(toastId);
      toast.success("Resume duplicated successfully!", { duration: 3000 });
    } catch (err) {
      console.error("Duplicate error:", err);
      toast.dismiss(toastId);
      toast.error("Failed to duplicate resume", { duration: 4000 });
    } finally {
      setIsDuplicating(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    const toastId = toast.loading("Deleting resume...");

    try {
      await fetch(`/api/resume/${resume.id}`, {
        method: "DELETE",
      });
      onDelete(resume.id);
      toast.dismiss(toastId);
      toast.success("Resume deleted", { duration: 3000 });
    } catch (err) {
      console.error("Delete error:", err);
      toast.dismiss(toastId);
      toast.error("Failed to delete resume", { duration: 4000 });
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleDownloadPDF = () => {
    setResume(resume);
    exportPDF(resume.id);
  };

  const formattedDate = (() => {
    try {
      return formatDistanceToNow(new Date(resume.updatedAt), { addSuffix: true });
    } catch {
      return "recently";
    }
  })();

  const primaryAccent = resume.theme?.primaryColor || "#6366f1"; // Indigo default
  
  // Score color logic
  let scoreColor = "text-emerald-400";
  let scoreBg = "bg-emerald-500/20";
  let scoreBorder = "border-emerald-500/30";
  let progressColor = "bg-emerald-500";
  
  if (score < 70) {
    scoreColor = "text-rose-400";
    scoreBg = "bg-rose-500/20";
    scoreBorder = "border-rose-500/30";
    progressColor = "bg-rose-500";
  } else if (score < 90) {
    scoreColor = "text-amber-400";
    scoreBg = "bg-amber-500/20";
    scoreBorder = "border-amber-500/30";
    progressColor = "bg-amber-500";
  }

  return (
    <div className="group rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all duration-300 overflow-hidden flex flex-col shadow-sm hover:shadow-xl hover:-translate-y-1 relative">
      
      {/* Top Visual Preview Placeholder Area */}
      <div className="h-32 relative bg-slate-950 overflow-hidden flex items-center justify-center border-b border-slate-800">
        {/* Abstract template representation */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none transition-transform duration-500 group-hover:scale-105"
          style={{ 
            background: `linear-gradient(135deg, ${primaryAccent}40 0%, transparent 100%)` 
          }}
        />
        <div className="absolute -right-4 -top-8 w-24 h-24 rounded-full blur-2xl opacity-30" style={{ backgroundColor: primaryAccent }} />
        
        {/* Template Icon Placeholder */}
        <div className="relative z-10 w-12 h-16 bg-white/5 border border-white/10 rounded-sm shadow-xl flex flex-col items-center justify-start p-1.5 gap-1 transform rotate-[-2deg] transition-transform duration-300 group-hover:rotate-0">
          <div className="w-full h-1.5 rounded-full opacity-50" style={{ backgroundColor: primaryAccent }} />
          <div className="w-full h-0.5 rounded-full bg-white/20 mt-1" />
          <div className="w-3/4 h-0.5 rounded-full bg-white/20 self-start" />
          <div className="w-full h-0.5 rounded-full bg-white/20 mt-1" />
          <div className="w-full h-0.5 rounded-full bg-white/20" />
        </div>

        {/* Top Right: More Menu */}
        <div className="absolute top-2 right-2 z-20">
          <DropdownMenu>
            <DropdownMenuTrigger className="p-1.5 rounded-lg text-slate-300 hover:text-white bg-slate-900/50 hover:bg-slate-800 backdrop-blur border border-slate-700/50 transition-colors focus:outline-none">
              <MoreVertical className="w-4 h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 bg-slate-900 border-slate-800 text-slate-200">
              <DropdownMenuItem
                onClick={() => setIsEditingTitle(true)}
                className="text-xs flex items-center gap-2 cursor-pointer hover:bg-slate-800"
              >
                <Edit2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Rename Title</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={handleDuplicate}
                disabled={isDuplicating}
                className="text-xs flex items-center gap-2 cursor-pointer hover:bg-slate-800"
              >
                <Copy className="w-3.5 h-3.5 text-emerald-400" />
                <span>Duplicate</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-slate-800" />

              <DropdownMenuItem
                onClick={() => setShowDeleteConfirm(true)}
                className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 cursor-pointer flex items-center gap-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Bottom Left: Template Badge */}
        <div className="absolute bottom-3 left-4 z-20 flex items-center gap-2">
          <div className="px-2.5 py-1 rounded-md bg-slate-900/80 backdrop-blur border border-slate-700/50 text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
            <LayoutTemplate className="w-3 h-3 text-indigo-400" />
            {templateInfo.name}
          </div>
        </div>
      </div>

      {/* Main Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div className="space-y-4">
          
          {/* Title & Target Role */}
          <div className="space-y-1.5">
            {isEditingTitle ? (
              <div className="flex items-center gap-1">
                <Input
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveTitle()}
                  autoFocus
                  className="h-8 text-xs bg-slate-950 border-indigo-500 text-white"
                />
                <button
                  type="button"
                  onClick={handleSaveTitle}
                  className="p-1.5 rounded bg-indigo-600 text-white hover:bg-indigo-500 shrink-0"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingTitle(false)}
                  className="p-1.5 rounded bg-slate-800 text-slate-400 hover:text-white shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <Link
                href={`/editor/${resume.id}`}
                onClick={() => setResume(resume)}
                className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-1 block"
                title={resume.title}
              >
                {resume.title}
              </Link>
            )}

            <div className="flex items-center justify-between">
              {resume.targetJob ? (
                <span className="text-xs text-slate-400 truncate max-w-[60%] block" title={resume.targetJob}>
                  Target: <span className="text-slate-300 font-medium">{resume.targetJob}</span>
                </span>
              ) : (
                <span className="text-xs text-slate-500 italic">No target job</span>
              )}
              <span className="text-[10px] text-slate-500 shrink-0">
                {formattedDate}
              </span>
            </div>
          </div>

          {/* ATS Score Progress Bar */}
          <div className="space-y-2 pt-2 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">ATS Score</span>
              <div className={`px-2 py-0.5 rounded-full border ${scoreBg} ${scoreBorder} ${scoreColor} text-[10px] font-bold flex items-center gap-1`}>
                {score}/100
              </div>
            </div>
            {/* Progress Track */}
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${progressColor} transition-all duration-1000 ease-out`}
                style={{ width: `${score}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Card Action Footer Buttons */}
      <div className="p-5 pt-0 grid grid-cols-2 gap-3">
        <Link
          href={`/editor/${resume.id}`}
          onClick={() => setResume(resume)}
          className="h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <Edit2 className="w-3.5 h-3.5 text-indigo-400" />
          <span>Edit</span>
        </Link>

        <Button
          type="button"
          disabled={isExportingPDF}
          onClick={handleDownloadPDF}
          className="h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          {isExportingPDF ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Download className="w-3.5 h-3.5" />
          )}
          <span>PDF</span>
        </Button>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-white flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-rose-400" />
              <span>Delete Resume?</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Are you sure you want to delete <span className="font-semibold text-white">"{resume.title}"</span>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteConfirm(false)}
              className="h-9 text-xs bg-slate-800 border-slate-700 text-slate-300 hover:text-white rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isDeleting}
              onClick={handleDelete}
              className="h-9 text-xs bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl"
            >
              {isDeleting ? "Deleting..." : "Delete Resume"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
