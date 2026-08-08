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
import { BookOpen } from "lucide-react";
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
    <div className="space-y-3">
      <div className="flex items-center justify-between border-b pb-2">
        <div>
          <h3 className="text-base font-bold text-white">
            {isFresher ? "Career Objective" : "Professional Summary"}
          </h3>
          <p className="text-xs text-slate-400">
            {isFresher
              ? "Career Objective — outline what you want to achieve and bring to a team"
              : "Write 2–4 concise lines summarizing your background and core skills"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ImproveWithAIButton sectionKey="summary" currentData={watch("summary") || ""} />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => openLibrary("summary")}
            className="flex items-center gap-1.5 text-xs text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/10"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>📚 Use Template</span>
          </Button>
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <Label htmlFor="summary" className="text-xs font-medium">
            Summary Content
          </Label>
          <span className={`text-[11px] ${charCount > 500 ? "text-destructive font-semibold" : "text-muted-foreground"}`}>
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
          className="min-h-[140px] text-xs leading-relaxed resize-y"
          {...register("summary")}
        />
      </div>
    </div>
  );
}
