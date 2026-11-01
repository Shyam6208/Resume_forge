"use client";

import { useState } from "react";
import { useResumeStore } from "@/store/resume.store";
import type { Skills } from "@/types/resume.types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
            className="text-xs flex items-center gap-1.5 text-cyan-300 border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 rounded-xl transition-all"
          />
        }
      >
        <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
        <span>Smart Skills Explorer</span>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[min(360px,calc(100vw-2rem))] max-w-[calc(100vw-2rem)] p-4 space-y-3 bg-card/95 border-white/[0.08] text-foreground backdrop-blur-2xl rounded-2xl shadow-xl shadow-cyan-950/20">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
          <span className="text-xs font-bold text-foreground">Skills Explorer</span>
          <span className="text-[10px] text-muted-foreground">Click to toggle skills</span>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
          <Input
            placeholder="Search skills (e.g. React, Python)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 text-xs h-8 bg-card/80 border-white/[0.08] text-foreground focus-visible:ring-1 focus-visible:ring-cyan-500/50 rounded-xl"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-1 border-b border-white/[0.06] pb-2 max-h-[70px] overflow-y-auto">
          {(Object.keys(CATEGORY_NAMES) as SkillCategory[]).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-2 py-0.5 text-[10px] font-semibold rounded-lg transition-colors ${
                activeCategory === cat
                  ? "bg-gradient-to-r from-cyan-500 to-emerald-400 text-slate-950 font-extrabold"
                  : "bg-white/[0.04] text-muted-foreground hover:text-foreground"
              }`}
            >
              {CATEGORY_NAMES[cat]}
            </button>
          ))}
        </div>

        {/* Skills Pills List */}
        <div className="max-h-[180px] overflow-y-auto flex flex-wrap gap-1.5 p-1">
          {filteredSkills.length === 0 ? (
            <span className="text-xs text-muted-foreground italic py-2">No skills matching &ldquo;{search}&rdquo;</span>
          ) : (
            filteredSkills.map((skill) => {
              const currentList = existingSkills[activeCategory] || [];
              const isAdded = currentList.includes(skill);

              return (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(activeCategory, skill)}
                  className={`px-2.5 py-1 text-xs rounded-xl border text-left transition-all flex items-center gap-1.5 ${
                    isAdded
                      ? "bg-cyan-500/20 text-cyan-200 border-cyan-500/40 font-semibold shadow-xs"
                      : "bg-white/[0.04] text-muted-foreground border-white/[0.08] hover:border-cyan-500/30 hover:text-foreground"
                  }`}
                >
                  {isAdded ? (
                    <Check className="w-3 h-3 text-cyan-300 shrink-0" />
                  ) : (
                    <Plus className="w-3 h-3 text-muted-foreground shrink-0" />
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
