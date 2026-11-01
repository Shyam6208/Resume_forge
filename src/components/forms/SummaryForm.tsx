"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useResumeStore } from "@/store/resume.store";
import { useAuthStore } from "@/store/auth.store";
import { useUIStore } from "@/store/ui.store";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { BookOpen, FileText } from "lucide-react";
import { ImproveWithAIButton } from "@/components/ai/ImproveWithAIButton";

// --- Zod Schema ---
const summarySchema = z.object({
  summary: z.string().optional(),
});

type SummaryFormValues = z.infer<typeof summarySchema>;

export function SummaryForm() {
  const currentResume = useResumeStore((s) => s.currentResume);
  const updateSection = useResumeStore((s) => s.updateSection);
  const userType = useAuthStore((s) => s.userType);
  const openLibrary = useUIStore((s) => s.openLibrary);
  const jobDescription = useUIStore((s) => s.jobDescription);

  const isFresher = userType === "fresher" || userType === "student";

  const { register, watch, setValue } = useForm<SummaryFormValues>({
    resolver: zodResolver(summarySchema),
    defaultValues: {
      summary: currentResume?.data.summary || "",
    },
    mode: "onChange",
  });

  const summaryValue = watch("summary") || "";
  const charCount = summaryValue.length;

  useEffect(() => {
    const subscription = watch((value) => {
      updateSection("summary", value.summary || "");
    });
    return () => subscription.unsubscribe();
  }, [watch, updateSection]);

  useEffect(() => {
    setValue("summary", currentResume?.data.summary || "");
  }, [currentResume?.data.summary, setValue]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-emerald-500/20 text-cyan-400 border border-cyan-500/30 shadow-md shadow-cyan-500/10">
            <FileText className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">
              {isFresher ? "Career Objective" : "Professional Summary"}
            </h3>
            <p className="text-xs text-muted-foreground">
              {isFresher
                ? "Outline what you want to achieve and bring to an engineering team"
                : "2–4 concise lines summarizing your background, specialty, and core achievements"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ImproveWithAIButton 
            sectionKey="summary" 
            currentData={watch("summary") || ""} 
            onApply={(improvedData) => setValue("summary", improvedData, { shouldDirty: true, shouldValidate: true })}
          />
          {jobDescription.trim().length >= 30 && (
            <ImproveWithAIButton 
              sectionKey="summary" 
              mode="optimize"
              currentData={watch("summary") || ""} 
              onApply={(improvedData) => setValue("summary", improvedData, { shouldDirty: true, shouldValidate: true })}
            />
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => openLibrary("summary")}
            className="flex items-center gap-1.5 text-xs text-cyan-300 border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 rounded-xl transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Use Template</span>
          </Button>
        </div>
      </div>

      <div className="space-y-2 p-4 sm:p-5 border border-white/[0.08] rounded-2xl bg-card/70 backdrop-blur-md shadow-sm">
        <div className="flex items-center justify-between">
          <Label htmlFor="summary" className="text-xs font-semibold text-foreground">
            Summary Content
          </Label>
          <span className={`text-[11px] font-mono ${charCount > 500 ? "text-rose-400 font-bold" : "text-muted-foreground"}`}>
            {charCount} / 500 chars
          </span>
        </div>

        <Textarea
          id="summary"
          placeholder={
            isFresher
              ? "Motivated computer science graduate seeking an entry-level software engineering role to leverage skills in React, TypeScript, and modern web applications..."
              : "Results-driven Software Engineer with 4+ years of experience building scalable web applications and REST APIs using Next.js, Node.js, and PostgreSQL..."
          }
          className="min-h-[140px] text-xs leading-relaxed resize-y bg-card/80 border-white/[0.08] text-foreground focus-visible:ring-1 focus-visible:ring-cyan-500/50 rounded-xl"
          {...register("summary")}
        />
      </div>
    </div>
  );
}
