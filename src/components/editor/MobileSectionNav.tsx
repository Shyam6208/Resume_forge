"use client";

import { useResumeStore } from "@/store/resume.store";
import { useUIStore } from "@/store/ui.store";
import { SECTION_CONFIG } from "@/config/sections.config";
import { isSectionEmpty } from "@/utils/section-checker";
import type { SectionKey } from "@/types/resume.types";
import { useRef, useEffect } from "react";
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
} from "lucide-react";

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

/**
 * Horizontal scrollable section pills for mobile editor.
 * Renders only sections in the current resume's sectionOrder.
 */
export function MobileSectionNav() {
  const currentResume = useResumeStore((s) => s.currentResume);
  const addSection = useResumeStore((s) => s.addSection);
  const activeSection = useUIStore((s) => s.activeSection);
  const setActiveSection = useUIStore((s) => s.setActiveSection);
  const scrollRef = useRef<HTMLDivElement>(null);

  const sectionOrder = currentResume?.sectionOrder || [];
  const resumeData = currentResume?.data;
  const currentActive: SectionKey = activeSection || sectionOrder[0] || "personalInfo";

  // Auto-scroll active section into view
  useEffect(() => {
    if (!scrollRef.current) return;
    const activeEl = scrollRef.current.querySelector(`[data-section="${currentActive}"]`);
    if (activeEl) {
      activeEl.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
    }
  }, [currentActive]);

  const handleSectionSelect = (sectionKey: SectionKey) => {
    if (!sectionOrder.includes(sectionKey)) {
      addSection(sectionKey);
    }
    setActiveSection(sectionKey);
  };

  return (
    <div
      ref={scrollRef}
      className="flex items-center gap-1.5 overflow-x-auto px-2 py-1.5 scrollbar-none min-w-0"
    >
      {sectionOrder.map((sectionKey) => {
        const config = SECTION_CONFIG[sectionKey];
        if (!config) return null;

        const IconComponent = ICON_MAP[config.iconName] || FileText;
        const isActive = currentActive === sectionKey;
        const isEmpty = resumeData ? isSectionEmpty[sectionKey](resumeData) : true;

        // Short label for mobile pills
        const shortLabel = config.label
          .replace("Personal Information", "Personal")
          .replace("Professional Summary", "Summary")
          .replace("Work Experience", "Experience")
          .replace("Skills & Technologies", "Skills")
          .replace("Certifications & Licenses", "Certs")
          .replace("Key Achievements", "Achieve")
          .replace("Interests & Hobbies", "Interests")
          .replace("Volunteer Experience", "Volunteer")
          .replace("Publications & Research", "Pubs");

        return (
          <button
            key={sectionKey}
            type="button"
            data-section={sectionKey}
            onClick={() => handleSectionSelect(sectionKey)}
            className={`shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors whitespace-nowrap ${
              isActive
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            <IconComponent className="w-3 h-3 shrink-0" />
            <span>{shortLabel}</span>
            {!isEmpty && !isActive && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
            )}
          </button>
        );
      })}
    </div>
  );
}
