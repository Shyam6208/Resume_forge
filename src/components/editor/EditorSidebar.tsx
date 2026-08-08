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
  GripVertical,
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

  return (
    <div className="w-full bg-slate-900 border-r border-slate-800 flex flex-col h-full text-slate-300">
      <div className="p-3 border-b border-slate-800">
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
              className={`group flex items-center justify-between px-2.5 py-2.5 min-h-[44px] rounded-lg cursor-pointer text-xs transition-colors ${
                isActive
                  ? "bg-indigo-600 text-white font-medium shadow-xs"
                  : isAdded
                  ? "hover:bg-slate-800 text-slate-300"
                  : "hover:bg-slate-800/80 text-slate-400"
              }`}
              onClick={() => handleSectionSelect(sectionKey)}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <IconComponent className="w-4 h-4 shrink-0" />
                <span className="truncate">{config.label}</span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {/* Completion Status Dot */}
                <div
                  className={`w-2 h-2 rounded-full ${
                    !isAdded
                      ? "bg-slate-700"
                      : isEmpty
                      ? "bg-slate-500"
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
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSection(sectionKey);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-400 transition-opacity p-0.5"
                    title="Hide section"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Optional Section Button */}
      {availableToAdd.length > 0 && (
        <div className="p-2 border-t border-slate-800">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full h-8 text-xs bg-slate-800/60 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 flex items-center justify-center gap-1.5"
                />
              }
            >
              <Plus className="w-3.5 h-3.5 text-indigo-400" />
              <span>Add Optional Section</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-52 bg-slate-900 border-slate-800 text-slate-200">
              {availableToAdd.map((key) => {
                const config = SECTION_CONFIG[key];
                return (
                  <DropdownMenuItem
                    key={key}
                    onClick={() => addSection(key)}
                    className="text-xs cursor-pointer hover:bg-slate-800 focus:bg-slate-800"
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
