"use client";

import { useState, useEffect } from "react";
import { useResumeStore } from "@/store/resume.store";
import type { Skills } from "@/types/resume.types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Plus, Lightbulb } from "lucide-react";

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
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b pb-2">
        <div>
          <h3 className="text-base font-bold text-white">Skills & Expertise</h3>
          <p className="text-xs text-slate-400">Organize your technical and soft skills by category</p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowSuggestions(!showSuggestions)}
          className="text-xs flex items-center gap-1.5"
        >
          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
          <span>{showSuggestions ? "Hide Suggestions" : "Show Suggestions"}</span>
        </Button>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-1 border-b pb-2">
        {CATEGORIES.map((cat) => {
          const count = (skillsState[cat.key] || []).length;
          const isActive = activeCategory === cat.key;

          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => setActiveCategory(cat.key)}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                isActive
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-300"
              }`}
            >
              <span>{cat.label}</span>
              {count > 0 && (
                <span
                  className={`px-1.5 py-0.2 text-[10px] rounded-full font-semibold ${
                    isActive ? "bg-white/20 text-white" : "bg-slate-700 text-slate-200"
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
      <div className="space-y-3">
        <div className="space-y-1">
          <Label className="text-xs">Add Skill to {CATEGORIES.find((c) => c.key === activeCategory)?.label}</Label>
          <div className="flex gap-2">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type skill name and press Enter or comma (e.g. React, Next.js)"
              className="text-xs flex-1"
            />
            <Button
              type="button"
              size="sm"
              onClick={() => {
                addSkillToCategory(tagInput);
                setTagInput("");
              }}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs shrink-0"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>
        </div>

        {/* Current Category Skill Pills */}
        <div className="min-h-[50px] p-3 rounded-lg border border-slate-800 bg-slate-950/60 flex flex-wrap gap-1.5 items-center">
          {currentCategoryList.length === 0 ? (
            <span className="text-xs text-slate-500 italic">No skills added in this category yet</span>
          ) : (
            currentCategoryList.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 border border-slate-700 shadow-2xs text-slate-200"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => removeSkillFromCategory(skill)}
                  className="text-slate-400 hover:text-rose-400 transition-colors ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))
          )}
        </div>

        {/* Suggestions Panel */}
        {showSuggestions && (
          <div className="p-3 border border-slate-800 bg-slate-900/60 rounded-lg space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400">
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
                    className={`px-2 py-0.5 text-xs rounded-md border transition-all ${
                      isAdded
                        ? "bg-slate-950 text-slate-500 border-slate-800 cursor-not-allowed"
                        : "bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-indigo-300 hover:text-indigo-200 cursor-pointer shadow-2xs"
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
