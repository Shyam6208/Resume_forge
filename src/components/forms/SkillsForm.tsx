"use client";

import { useState } from "react";
import { useResumeStore } from "@/store/resume.store";
import type { Skills } from "@/types/resume.types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Plus, Lightbulb, Cpu } from "lucide-react";

type SkillCategoryKey = keyof Skills;

const CATEGORIES: { key: SkillCategoryKey; label: string }[] = [
  { key: "frontend", label: "Frontend" },
  { key: "backend", label: "Backend" },
  { key: "database", label: "Databases" },
  { key: "cloud", label: "Cloud & DevOps" },
  { key: "programming", label: "Languages" },
  { key: "softSkills", label: "Soft Skills" },
  { key: "tools", label: "Tools" },
  { key: "languages", label: "Spoken Languages" },
  { key: "other", label: "Other" },
];

const PRESET_SUGGESTIONS: Record<SkillCategoryKey, string[]> = {
  frontend: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Vue.js", "HTML5/CSS3", "Redux", "Zustand"],
  backend: ["Node.js", "Express", "Python", "Django", "FastAPI", "Go", "Java", "Spring Boot", "GraphQL"],
  database: ["PostgreSQL", "MongoDB", "Redis", "MySQL", "Supabase", "Prisma", "Firebase"],
  cloud: ["AWS", "Docker", "Kubernetes", "Vercel", "CI/CD", "GitHub Actions", "Terraform"],
  programming: ["TypeScript", "JavaScript", "Python", "C++", "Java", "Go", "Rust", "SQL"],
  softSkills: ["Problem Solving", "Team Leadership", "Communication", "Agile/Scrum", "Mentorship"],
  tools: ["Git", "VS Code", "Postman", "Figma", "Jira", "Linux", "Webpack"],
  languages: ["English", "Spanish", "French", "German", "Hindi", "Mandarin"],
  other: ["System Design", "REST APIs", "Microservices", "Unit Testing", "SEO"],
};

export function SkillsForm() {
  const currentResume = useResumeStore((s) => s.currentResume);
  const updateSection = useResumeStore((s) => s.updateSection);

  const [activeCategory, setActiveCategory] = useState<SkillCategoryKey>("frontend");
  const [tagInput, setTagInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(true);

  const skillsState: Skills = currentResume?.data.skills || {};

  const currentCategoryList = skillsState[activeCategory] || [];

  const addSkillToCategory = (skillName: string) => {
    const trimmed = skillName.trim();
    if (!trimmed) return;
    if (currentCategoryList.includes(trimmed)) return;

    const updatedSkills: Skills = {
      ...skillsState,
      [activeCategory]: [...currentCategoryList, trimmed],
    };

    updateSection("skills", updatedSkills);
  };

  const removeSkillFromCategory = (skillToRemove: string) => {
    const updatedList = currentCategoryList.filter((s) => s !== skillToRemove);
    const updatedSkills: Skills = {
      ...skillsState,
      [activeCategory]: updatedList,
    };
    updateSection("skills", updatedSkills);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkillToCategory(tagInput);
      setTagInput("");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-emerald-500/20 text-cyan-400 border border-cyan-500/30 shadow-md shadow-cyan-500/10">
            <Cpu className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">Skills & Expertise</h3>
            <p className="text-xs text-muted-foreground">Organize your technical and soft skills by category</p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowSuggestions(!showSuggestions)}
          className="text-xs flex items-center gap-1.5 bg-white/[0.04] border-white/[0.08] text-foreground hover:bg-white/[0.08] rounded-xl"
        >
          <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
          <span>{showSuggestions ? "Hide Suggestions" : "Show Suggestions"}</span>
        </Button>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-1.5 border-b border-white/[0.06] pb-3">
        {CATEGORIES.map((cat) => {
          const count = (skillsState[cat.key] || []).length;
          const isActive = activeCategory === cat.key;

          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => setActiveCategory(cat.key)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
                isActive
                  ? "bg-gradient-to-r from-cyan-500 to-emerald-400 text-slate-950 font-extrabold shadow-md shadow-cyan-500/20"
                  : "bg-card/80 text-muted-foreground hover:text-foreground hover:bg-white/[0.04] border border-white/[0.06]"
              }`}
            >
              <span>{cat.label}</span>
              {count > 0 && (
                <span
                  className={`px-1.5 py-0.2 text-[10px] rounded-full font-bold ${
                    isActive ? "bg-slate-950/20 text-slate-950" : "bg-white/[0.08] text-muted-foreground"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active Category Skill Input */}
      <div className="space-y-3.5">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-foreground">
            Add Skill to {CATEGORIES.find((c) => c.key === activeCategory)?.label}
          </Label>
          <div className="flex gap-2">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type skill name and press Enter or comma (e.g. React, Next.js)"
              className="text-xs flex-1 bg-card/80 border-white/[0.08] text-foreground focus-visible:ring-1 focus-visible:ring-cyan-500/50 rounded-xl"
            />
            <Button
              type="button"
              size="sm"
              onClick={() => {
                addSkillToCategory(tagInput);
                setTagInput("");
              }}
              className="bg-gradient-to-r from-cyan-500 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 font-bold text-xs shrink-0 rounded-xl shadow-md shadow-cyan-500/20"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>
        </div>

        {/* Current Category Skill Pills */}
        <div className="min-h-[60px] p-3.5 rounded-2xl border border-white/[0.08] bg-card/70 flex flex-wrap gap-2 items-center backdrop-blur-md">
          {currentCategoryList.length === 0 ? (
            <span className="text-xs text-muted-foreground italic">No skills added in this category yet</span>
          ) : (
            currentCategoryList.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 shadow-xs hover:border-cyan-500/40 transition-colors"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => removeSkillFromCategory(skill)}
                  className="text-cyan-400/70 hover:text-rose-400 transition-colors ml-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))
          )}
        </div>

        {/* Suggestions Panel */}
        {showSuggestions && (
          <div className="p-4 border border-white/[0.08] bg-card/60 rounded-2xl space-y-2.5 backdrop-blur-md">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span>Suggested {CATEGORIES.find((c) => c.key === activeCategory)?.label} Skills:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_SUGGESTIONS[activeCategory].map((preset) => {
                const isAdded = currentCategoryList.includes(preset);
                return (
                  <button
                    key={preset}
                    type="button"
                    disabled={isAdded}
                    onClick={() => addSkillToCategory(preset)}
                    className={`px-2.5 py-1 text-xs rounded-xl border transition-all ${
                      isAdded
                        ? "bg-card/40 text-muted-foreground/40 border-white/[0.04] cursor-not-allowed"
                        : "bg-white/[0.04] hover:bg-cyan-500/10 border-white/[0.08] hover:border-cyan-500/30 text-muted-foreground hover:text-cyan-300 cursor-pointer shadow-xs"
                    }`}
                  >
                    {isAdded ? `✓ ${preset}` : `+ ${preset}`}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
