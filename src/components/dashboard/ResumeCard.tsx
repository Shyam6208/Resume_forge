"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { formatDistanceToNow } from "date-fns";
import type { Resume } from "@/types/resume.types";
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
  Sparkles,
  Check,
  X,
  Palette,
  Loader2,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  const scoreResult = calculateResumeScore(resume.data, "developer");
  const score = scoreResult.score;

  // Score dots helper (●●●●○)
  const renderScoreDots = (scoreNum: number) => {
    const totalDots = 5;
    const activeDots = Math.round((scoreNum / 100) * totalDots);
    return (
      <span className="font-mono text-xs tracking-tight text-amber-400 font-bold flex items-center gap-0.5">
        {"●".repeat(activeDots)}
        <span className="text-slate-700">{"○".repeat(totalDots - activeDots)}</span>
      </span>
    );
  };

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
      toast.success("Resume duplicated successfully!", { id: toastId });
    } catch (err) {
      console.error("Duplicate error:", err);
      toast.error("Failed to duplicate resume", { id: toastId });
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
      toast.success("Resume deleted", { id: toastId });
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete resume", { id: toastId });
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

  const primaryAccent = resume.theme?.primaryColor || "#3b82f6";

  return (
    <div className="group rounded-2xl bg-slate-900/80 border border-slate-800/90 hover:border-indigo-500/50 hover:bg-slate-900 transition-all duration-200 overflow-hidden flex flex-col justify-between shadow-md relative">
      {/* Top Accent Color Bar */}
      <div
        className="h-2 w-full transition-all group-hover:h-2.5"
        style={{ backgroundColor: primaryAccent }}
      />

      {/* Main Card Content */}
      <div className="p-5 space-y-4">
        {/* Header: Template badge + 3 dots menu */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center font-bold text-xs text-indigo-400 shrink-0">
              RF
            </span>
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                {templateInfo.name}
              </span>
              <span className="text-[11px] text-slate-500 block">
                Updated {formattedDate}
              </span>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
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

        {/* Title / Title Editing */}
        <div className="space-y-1">
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
                className="p-1.5 rounded bg-indigo-600 text-white hover:bg-indigo-500"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsEditingTitle(false)}
                className="p-1.5 rounded bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <Link
              href={`/editor/${resume.id}`}
              onClick={() => setResume(resume)}
              className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-1 block"
            >
              {resume.title}
            </Link>
          )}

          {resume.targetJob && (
            <span className="text-xs text-slate-400 block truncate">
              Target: <span className="text-slate-300 font-medium">{resume.targetJob}</span>
            </span>
          )}
        </div>

        {/* Score Mini Badge: Dots + Number */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-semibold text-slate-300">Resume Score</span>
          </div>

          <div className="flex items-center gap-2">
            {renderScoreDots(score)}
            <span className="text-xs font-bold text-emerald-400">{score}/100</span>
          </div>
        </div>
      </div>

      {/* Card Action Footer Buttons: Edit & Download PDF */}
      <div className="p-4 pt-0 grid grid-cols-2 gap-2">
        <Link
          href={`/editor/${resume.id}`}
          onClick={() => setResume(resume)}
          className="h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
        >
          <Edit2 className="w-3.5 h-3.5 text-indigo-400" />
          <span>Edit</span>
        </Link>

        <Button
          type="button"
          disabled={isExportingPDF}
          onClick={handleDownloadPDF}
          className="h-9 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
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
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-sm">
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
              className="h-8 text-xs bg-slate-800 border-slate-700 text-slate-300 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isDeleting}
              onClick={handleDelete}
              className="h-8 text-xs bg-rose-600 hover:bg-rose-500 text-white font-semibold"
            >
              {isDeleting ? "Deleting..." : "Delete Resume"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
