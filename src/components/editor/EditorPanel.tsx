"use client";

import { useUIStore } from "@/store/ui.store";
import { useResumeStore } from "@/store/resume.store";
import {
  PersonalInfoForm,
  SummaryForm,
  ExperienceForm,
  EducationForm,
  ProjectsForm,
  SkillsForm,
  CertificationsForm,
  AchievementsForm,
  LanguagesForm,
  InterestsForm,
  VolunteerForm,
  PublicationsForm,
  ReferencesForm,
} from "@/components/forms";
import type { SectionKey } from "@/types/resume.types";

export function EditorPanel() {
  const activeSection = useUIStore((s) => s.activeSection);
  const currentResume = useResumeStore((s) => s.currentResume);

  const sectionOrder = currentResume?.sectionOrder || [];
  const currentActive: SectionKey = activeSection || sectionOrder[0] || "personalInfo";

  const renderActiveForm = () => {
    switch (currentActive) {
      case "personalInfo":
        return <PersonalInfoForm />;
      case "summary":
        return <SummaryForm />;
      case "experience":
        return <ExperienceForm />;
      case "education":
        return <EducationForm />;
      case "projects":
        return <ProjectsForm />;
      case "skills":
        return <SkillsForm />;
      case "certifications":
        return <CertificationsForm />;
      case "achievements":
        return <AchievementsForm />;
      case "languages":
        return <LanguagesForm />;
      case "interests":
        return <InterestsForm />;
      case "volunteer":
        return <VolunteerForm />;
      case "publications":
        return <PublicationsForm />;
      case "references":
        return <ReferencesForm />;
      default:
        return <PersonalInfoForm />;
    }
  };

  return (
    <div className="w-full h-full bg-slate-900 overflow-y-auto p-4 sm:p-6 text-slate-100">
      <div className="max-w-2xl mx-auto space-y-6">
        {renderActiveForm()}
      </div>
    </div>
  );
}
