"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/auth.store";
import { useResumeStore } from "@/store/resume.store";
import { SECTION_ORDER_BY_USER_TYPE } from "@/config/sections.config";
import type { UserType, SectionKey } from "@/types/resume.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { JobRoleCombobox } from "@/components/ui/job-role-combobox";
import { TEMPLATES } from "@/config/templates.config";
import type { TemplateConfig } from "@/config/templates.config";
import {
  GraduationCap,
  Sparkles,
  Code2,
  Palette,
  BookOpen,
  Briefcase,
  Building2,
  Wrench,
  ArrowRight,
  ArrowLeft,
  Check,
  Zap,
  FileText,
  Target,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";

interface UserTypeOption {
  type: UserType;
  label: string;
  icon: React.ElementType;
  emoji: string;
  description: string;
}

const USER_TYPES: UserTypeOption[] = [
  {
    type: "student",
    label: "Student",
    icon: GraduationCap,
    emoji: "🎓",
    description: "Currently studying or in college",
  },
  {
    type: "fresher",
    label: "Fresher",
    icon: Sparkles,
    emoji: "👨‍💻",
    description: "Recent graduate looking for entry-level roles",
  },
  {
    type: "developer",
    label: "Developer",
    icon: Code2,
    emoji: "💻",
    description: "Software, web, mobile engineer or IT specialist",
  },
  {
    type: "designer",
    label: "Designer",
    icon: Palette,
    emoji: "🎨",
    description: "UI/UX, graphic, or product designer",
  },
  {
    type: "teacher",
    label: "Teacher",
    icon: BookOpen,
    emoji: "📚",
    description: "Educator, lecturer, tutor or instructor",
  },
  {
    type: "manager",
    label: "Manager",
    icon: Briefcase,
    emoji: "💼",
    description: "Project lead, engineering manager, executive",
  },
  {
    type: "experienced",
    label: "Experienced",
    icon: Building2,
    emoji: "🏢",
    description: "3+ years of corporate or industry experience",
  },
  {
    type: "other",
    label: "Other",
    icon: Wrench,
    emoji: "🔧",
    description: "Freelancer, consultant, or career changer",
  },
];


const RECOMMENDED_TEMPLATES: Record<UserType, string> = {
  student: "fresher-basic",
  fresher: "fresher-basic",
  developer: "dev-template",
  designer: "modern-pro",
  teacher: "corporate-pro",
  manager: "corporate-pro",
  experienced: "corporate-pro",
  freelancer: "minimal-white",
  other: "minimal-white",
};

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateQuery = searchParams.get("template");

  const setUserType = useAuthStore((s) => s.setUserType);
  const setOnboardingCompleted = useAuthStore((s) => s.setOnboardingCompleted);
  const setResume = useResumeStore((s) => s.setResume);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedUserType, setSelectedUserType] = useState<UserType | null>(null);
  const [targetJob, setTargetJob] = useState("");
  const [startMode, setStartMode] = useState<"quick" | "choose" | "fresh">(
    templateQuery ? "choose" : "quick"
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    templateQuery || "minimal-white"
  );
  const [isCreating, setIsCreating] = useState(false);
  const [allTemplates, setAllTemplates] = useState<TemplateConfig[]>(TEMPLATES);

  // Load published templates (built-in + dynamic) from API
  useEffect(() => {
    fetch("/api/templates")
      .then((res) => res.json())
      .then((data) => {
        if (data.templates && Array.isArray(data.templates)) {
          setAllTemplates(data.templates);
        }
      })
      .catch(() => {
        /* fallback to hardcoded TEMPLATES */
      });
  }, []);

  const handleUserTypeSelect = (type: UserType) => {
    setSelectedUserType(type);
    if (!templateQuery) {
      setSelectedTemplateId(RECOMMENDED_TEMPLATES[type] || "minimal-white");
    }
  };

  const handleFinish = async () => {
    if (!selectedUserType) {
      toast.error("Please select a profile type");
      return;
    }

    setIsCreating(true);
    const toastId = toast.loading("Setting up your resume workspace...");

    try {
      setUserType(selectedUserType);
      setOnboardingCompleted(true);

      const sectionOrder: SectionKey[] =
        SECTION_ORDER_BY_USER_TYPE[selectedUserType] || SECTION_ORDER_BY_USER_TYPE.other;

      let finalTemplateId = selectedTemplateId;
      if (startMode === "quick") {
        finalTemplateId = RECOMMENDED_TEMPLATES[selectedUserType] || "minimal-white";
      } else if (startMode === "fresh") {
        finalTemplateId = "minimal-white";
      }

      const matchedTemplate = allTemplates.find(
        (t) => t.id === finalTemplateId || t.slug === finalTemplateId
      );
      const effectiveTemplateId = matchedTemplate?.id || finalTemplateId;
      const effectiveTemplateConfig = matchedTemplate?.templateConfig || null;

      const res = await fetch("/api/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: targetJob ? `${targetJob} Resume` : `${selectedUserType.toUpperCase()} Resume`,
          userType: selectedUserType,
          targetJob,
          templateId: effectiveTemplateId,
          sectionOrder,
          templateConfig: effectiveTemplateConfig,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create resume");
      }

      const newResume = await res.json();
      setResume(newResume);

      toast.dismiss(toastId);
      toast.success("Workspace ready!", { duration: 3000 });
      router.push(`/editor/${newResume.id}`);
    } catch (err) {
      console.error("Onboarding setup error:", err);
      toast.dismiss(toastId);
      toast.error("Error creating resume. Redirecting to dashboard...", { duration: 4000 });
      router.push("/dashboard");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-8">
      {/* Header & Step Indicator */}
      <header className="max-w-4xl mx-auto w-full pt-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 font-bold text-sm">
              RF
            </span>
            <span className="font-extrabold text-lg text-white tracking-tight">ResumeForge</span>
          </div>

          <div className="text-xs font-semibold text-slate-400">
            Step <span className="text-indigo-400 font-bold">{step}</span> of 3
          </div>
        </div>

        {/* Animated Progress Bar */}
        <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-indigo-500 rounded-full"
            initial={{ width: "33%" }}
            animate={{ width: step === 1 ? "33%" : step === 2 ? "66%" : "100%" }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
          />
        </div>
      </header>

      {/* Main Form Content Container */}
      <main className="max-w-4xl mx-auto w-full my-auto py-8">
        <AnimatePresence mode="wait">
          {/* STEP 1: Who are you? */}
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2 max-w-xl mx-auto">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Who are you?
                </h1>
                <p className="text-xs sm:text-sm text-slate-400">
                  Select your current role so we can tailor the resume section layout and scoring rules.
                </p>
              </div>

              {/* Grid 1 col on 320px, 2 cols on 390px+, 4 cols on desktop */}
              <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                {USER_TYPES.map((item) => {
                  const isSelected = selectedUserType === item.type;
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.type}
                      type="button"
                      onClick={() => handleUserTypeSelect(item.type)}
                      className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between gap-3 relative group ${
                        isSelected
                          ? "bg-indigo-950/50 border-indigo-500 ring-2 ring-indigo-500/40 shadow-lg shadow-indigo-950/50"
                          : "bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
                      }`}
                    >
                      {isSelected && (
                        <span className="absolute top-3 right-3 p-1 rounded-full bg-indigo-500 text-white shadow">
                          <Check className="w-3 h-3" />
                        </span>
                      )}

                      <div className="p-2.5 rounded-xl w-fit bg-slate-950 border border-slate-800 text-indigo-400 group-hover:scale-105 transition-transform">
                        <Icon className="w-5 h-5" />
                      </div>

                      <div className="space-y-1">
                        <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                          <span>{item.label}</span>
                          <span className="text-xs">{item.emoji}</span>
                        </h3>
                        <p className="text-[11px] text-slate-400 leading-normal">
                          {item.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Footer controls for Step 1 */}
              <div className="flex justify-end pt-4">
                <Button
                  type="button"
                  disabled={!selectedUserType}
                  onClick={() => setStep(2)}
                  className="h-10 px-6 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-md flex items-center gap-2"
                >
                  <span>Next: Target Job</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: What job are you targeting? */}
          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-6 max-w-2xl mx-auto"
            >
              <div className="text-center space-y-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center justify-center gap-2">
                  <Target className="w-7 h-7 text-indigo-400" />
                  <span>What job are you targeting?</span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-400">
                  We will use this to optimize ATS keyword checks and section order.
                </p>
              </div>

              {/* Text Input */}
              <div className="space-y-2 bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
                <label className="text-xs font-bold text-slate-300">Target Role Title</label>
                <JobRoleCombobox 
                  value={targetJob}
                  onChange={setTargetJob}
                />
              </div>

              {/* Footer controls for Step 2 */}
              <div className="flex items-center justify-between pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="h-10 px-5 text-xs bg-slate-900 border-slate-800 text-slate-300 hover:text-white"
                >
                  <ArrowLeft className="w-4 h-4 mr-1.5" />
                  <span>Back</span>
                </Button>

                <Button
                  type="button"
                  disabled={!targetJob.trim()}
                  onClick={() => setStep(3)}
                  className="h-10 px-6 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-md flex items-center gap-2"
                >
                  <span>Next: Choose Template</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: How do you want to start? */}
          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-6 max-w-3xl mx-auto"
            >
              <div className="text-center space-y-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  How do you want to start?
                </h1>
                <p className="text-xs sm:text-sm text-slate-400">
                  Select your preferred creation mode to launch your workspace.
                </p>
              </div>

              {/* 3 Start Option Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Quick Start */}
                <button
                  type="button"
                  onClick={() => setStartMode("quick")}
                  className={`p-5 rounded-2xl border text-left flex flex-col justify-between gap-4 transition-all relative ${
                    startMode === "quick"
                      ? "bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-500/40 shadow-lg"
                      : "bg-slate-900/70 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 w-fit">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-bold text-white">⚡ Quick Start</h3>
                      <Badge className="bg-amber-500/20 text-amber-300 text-[9px] border-amber-500/30">
                        Recommended
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Best template auto-selected based on your profile as {selectedUserType}.
                    </p>
                  </div>
                </button>

                {/* Choose Template */}
                <button
                  type="button"
                  onClick={() => setStartMode("choose")}
                  className={`p-5 rounded-2xl border text-left flex flex-col justify-between gap-4 transition-all relative ${
                    startMode === "choose"
                      ? "bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-500/40 shadow-lg"
                      : "bg-slate-900/70 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 w-fit">
                    <Palette className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white">🎨 Choose Template</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Browse all 5 templates and select your favorite design.
                    </p>
                  </div>
                </button>

                {/* Start Fresh */}
                <button
                  type="button"
                  onClick={() => setStartMode("fresh")}
                  className={`p-5 rounded-2xl border text-left flex flex-col justify-between gap-4 transition-all relative ${
                    startMode === "fresh"
                      ? "bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-500/40 shadow-lg"
                      : "bg-slate-900/70 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="p-3 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 w-fit">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white">📄 Start Fresh</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Blank resume with standard clean single-column layout.
                    </p>
                  </div>
                </button>
              </div>

              {/* If "Choose Template" mode is active, show template grid picker */}
              {startMode === "choose" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-3 pt-2"
                >
                  <span className="text-xs font-bold text-slate-300">Select Template:</span>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                    {allTemplates.map((tmpl) => {
                      const isSelected = selectedTemplateId === tmpl.id;
                      return (
                        <button
                          key={tmpl.id}
                          type="button"
                          onClick={() => setSelectedTemplateId(tmpl.id)}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            isSelected
                              ? "bg-indigo-600 text-white border-indigo-500 shadow"
                              : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
                          }`}
                        >
                          <span className="text-[10px] font-bold block opacity-80 uppercase">
                            {tmpl.category}
                          </span>
                          <span className="text-xs font-semibold block truncate">
                            {tmpl.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Footer controls for Step 3 */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="h-10 px-5 text-xs bg-slate-900 border-slate-800 text-slate-300 hover:text-white"
                >
                  <ArrowLeft className="w-4 h-4 mr-1.5" />
                  <span>Back</span>
                </Button>

                <Button
                  type="button"
                  disabled={isCreating}
                  onClick={handleFinish}
                  className="h-11 px-8 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2"
                >
                  <span>Build My Resume Now</span>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer hint */}
      <footer className="max-w-4xl mx-auto w-full text-center pb-4">
        <p className="text-[11px] text-slate-500">
          Powered by ResumeForge ATS Optimization Engine
        </p>
      </footer>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      }
    >
      <OnboardingContent />
    </Suspense>
  );
}
