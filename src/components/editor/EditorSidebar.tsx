"use client";

import { useResumeStore } from "@/store/resume.store";
import { useUIStore } from "@/store/ui.store";
import { SECTION_CONFIG } from "@/config/sections.config";
import { isSectionEmpty } from "@/utils/section-checker";
import type { SectionKey } from "@/types/resume.types";
import {
  User,
  FileText,
  Briefcase,
  GraduationCap,
  FolderKanban,
  Wrench,
  Award,
  Trophy,
  Globe,
  Heart,
  HeartHandshake,
  BookText,
  Users,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ICON_MAP: Record<string, React.ElementType> = {
  User,
  FileText,
  Briefcase,
  GraduationCap,
  FolderKanban,
  Wrench,
  Award,
  Trophy,
  Globe,
  Heart,
  HeartHandshake,
  BookText,
  Users,
};

export function EditorSidebar() {
  const currentResume = useResumeStore((s) => s.currentResume);
  const addSection = useResumeStore((s) => s.addSection);
  const removeSection = useResumeStore((s) => s.removeSection);
  const activeSection = useUIStore((s) => s.activeSection);
  const setActiveSection = useUIStore((s) => s.setActiveSection);

  const sectionOrder = currentResume?.sectionOrder || [];
  const resumeData = currentResume?.data;
  const allSectionKeys = Object.keys(SECTION_CONFIG) as SectionKey[];

  // Display all sections: added sections first in order, followed by optional unadded sections
  const displaySections = [
    ...sectionOrder,
    ...allSectionKeys.filter((key) => !sectionOrder.includes(key)),
  ];

  // Unused optional sections available to add via dropdown shortcut
  const availableToAdd = allSectionKeys.filter(
    (key) => !sectionOrder.includes(key)
  );

  const handleSectionSelect = (sectionKey: SectionKey) => {
    if (!sectionOrder.includes(sectionKey)) {
      addSection(sectionKey);
    }
    setActiveSection(sectionKey);
  };

  const handleRemoveSection = (e: React.MouseEvent, sectionKey: SectionKey) => {
    e.stopPropagation();
    e.preventDefault();
    removeSection(sectionKey);
    if (activeSection === sectionKey) {
      const remaining = sectionOrder.filter((s) => s !== sectionKey);
      setActiveSection(remaining[0] || "personalInfo");
    }
  };

  return (
    <div className="w-full bg-[#0B0F17] border-r border-white/[0.08] flex flex-col h-full text-slate-300">
      <div className="p-3.5 border-b border-white/[0.08]">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">
          Resume Sections
        </h3>
      </div>

      {/* Scrollable Section List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {displaySections.map((sectionKey) => {
          const config = SECTION_CONFIG[sectionKey];
          if (!config) return null;

          const IconComponent = ICON_MAP[config.iconName] || FileText;
          const isActive = activeSection === sectionKey;
          const isAdded = sectionOrder.includes(sectionKey);
          const isEmpty = resumeData ? isSectionEmpty[sectionKey](resumeData) : true;

          return (
            <div
              key={sectionKey}
              className={`group flex items-center justify-between px-3 py-2.5 min-h-[42px] rounded-xl cursor-pointer text-xs transition-all ${
                isActive
                  ? "bg-gradient-to-r from-cyan-500/15 to-emerald-500/10 border border-cyan-500/30 text-cyan-300 font-bold shadow-sm"
                  : isAdded
                  ? "hover:bg-white/[0.05] text-slate-300 hover:text-white"
                  : "hover:bg-white/[0.03] text-slate-500 hover:text-slate-400"
              }`}
              onClick={() => handleSectionSelect(sectionKey)}
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <IconComponent className={`w-4 h-4 shrink-0 ${isActive ? "text-cyan-400" : "text-slate-400"}`} />
                <span className="truncate">{config.label}</span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Completion Status Dot */}
                <div
                  className={`w-2 h-2 rounded-full ${
                    !isAdded
                      ? "bg-slate-700"
                      : isEmpty
                      ? "bg-slate-600"
                      : "bg-emerald-400"
                  }`}
                  title={
                    !isAdded
                      ? "Click to add section"
                      : isEmpty
                      ? "Section empty"
                      : "Section completed"
                  }
                />

                {/* Remove optional section button */}
                {config.optional && isAdded && sectionKey !== "personalInfo" && (
                  <button
                    type="button"
                    onClick={(e) => handleRemoveSection(e, sectionKey)}
                    className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition-all p-0.5"
                    title="Remove section"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Optional Section Button */}
      {availableToAdd.length > 0 && (
        <div className="p-3 border-t border-white/[0.08]">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full h-8.5 text-xs bg-white/[0.05] border-white/[0.08] text-slate-300 hover:text-white hover:bg-white/[0.1] flex items-center justify-center gap-1.5 rounded-xl font-medium transition-all"
                />
              }
            >
              <Plus className="w-3.5 h-3.5 text-cyan-400" />
              <span>Add Optional Section</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-52 bg-[#0B0F17]/95 border-white/[0.08] backdrop-blur-2xl text-slate-200 p-1.5 rounded-2xl shadow-2xl">
              {availableToAdd.map((key) => {
                const config = SECTION_CONFIG[key];
                return (
                  <DropdownMenuItem
                    key={key}
                    onClick={() => addSection(key)}
                    className="text-xs cursor-pointer hover:bg-white/[0.06] focus:bg-white/[0.06] rounded-xl px-2.5 py-2 text-slate-200 hover:text-white transition-colors"
                  >
                    + {config.label}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}
