"use client";

import { useState } from "react";
import { useResumeStore } from "@/store/resume.store";
import type { Skills } from "@/types/resume.types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Search, Check, Plus } from "lucide-react";
import skillsData from "@/data/skills.json";

type SkillCategory = keyof Skills;

const CATEGORY_NAMES: Record<SkillCategory, string> = {
  frontend: "Frontend",
  backend: "Backend",
  database: "Databases",
  cloud: "Cloud & DevOps",
  programming: "Programming Languages",
  softSkills: "Soft Skills",
  tools: "Tools & Utilities",
  languages: "Spoken Languages",
  other: "Other Skills",
};

export function SkillsSuggestions() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<SkillCategory>("frontend");

  const currentResume = useResumeStore((s) => s.currentResume);
  const updateSection = useResumeStore((s) => s.updateSection);

  const existingSkills: Skills = currentResume?.data.skills || {};

  const toggleSkill = (category: SkillCategory, skillName: string) => {
    const list = existingSkills[category] || [];
    const isAdded = list.includes(skillName);

    const updatedList = isAdded
      ? list.filter((s) => s !== skillName)
      : [...list, skillName];

    updateSection("skills", {
      ...existingSkills,
      [category]: updatedList,
    });
  };

  const categorySkills = (skillsData as Record<SkillCategory, string[]>)[activeCategory] || [];
  const filteredSkills = categorySkills.filter((s) =>
    s.toLowerCase().includes(search.toLowerCase().trim())
  );

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-xs flex items-center gap-1.5 text-indigo-700 border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100"
          />
        }
      >
        <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
        <span>💡 Smart Skills Explorer</span>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[min(340px,calc(100vw-2rem))] max-w-[calc(100vw-2rem)] p-4 space-y-3">
        <div className="flex items-center justify-between border-b pb-2">
          <span className="text-xs font-bold text-slate-900">Skills Explorer</span>
          <span className="text-[10px] text-muted-foreground">Click to toggle skills</span>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
          <Input
            placeholder="Search skills (e.g. React, Python)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 text-xs h-8"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-1 border-b pb-2 max-h-[70px] overflow-y-auto">
          {(Object.keys(CATEGORY_NAMES) as SkillCategory[]).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-2 py-0.5 text-[10px] font-medium rounded transition-colors ${
                activeCategory === cat
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {CATEGORY_NAMES[cat]}
            </button>
          ))}
        </div>

        {/* Skills Pills List */}
        <div className="max-h-[180px] overflow-y-auto flex flex-wrap gap-1.5 p-1">
          {filteredSkills.length === 0 ? (
            <span className="text-xs text-slate-400 italic py-2">No skills matching &ldquo;{search}&rdquo;</span>
          ) : (
            filteredSkills.map((skill) => {
              const currentList = existingSkills[activeCategory] || [];
              const isAdded = currentList.includes(skill);

              return (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(activeCategory, skill)}
                  className={`px-2 py-1 text-xs rounded-md border text-left transition-all flex items-center gap-1 ${
                    isAdded
                      ? "bg-indigo-600 text-white border-indigo-600 font-medium shadow-2xs"
                      : "bg-slate-800/80 text-slate-200 border-slate-700 hover:border-indigo-500 hover:bg-slate-800"
                  }`}
                >
                  {isAdded ? (
                    <Check className="w-3 h-3 text-white shrink-0" />
                  ) : (
                    <Plus className="w-3 h-3 text-slate-400 shrink-0" />
                  )}
                  <span>{skill}</span>
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
