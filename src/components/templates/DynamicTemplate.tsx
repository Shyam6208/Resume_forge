import React from "react";
import type { ResumeData, ResumeTheme } from "@/types/resume.types";
import { isSectionEmpty } from "@/utils/section-checker";
import { SectionWrapper } from "@/components/sections/SectionWrapper";
import {
  PersonalInfoSection,
  SummarySection,
  ExperienceSection,
  EducationSection,
  ProjectsSection,
  SkillsSection,
  CertificationsSection,
  AchievementsSection,
  LanguagesSection,
  VolunteerSection,
  PublicationsSection,
  ReferencesSection,
} from "@/components/sections";
import { DynamicTemplateConfig } from "@/lib/templates/template-validator";

interface DynamicTemplateProps {
  data: ResumeData;
  theme: ResumeTheme;
  config?: DynamicTemplateConfig | null;
}

export function DynamicTemplate({ data, theme, config }: DynamicTemplateProps) {
  const mergedTheme: ResumeTheme = {
    ...theme,
    primaryColor: config?.themeOverrides?.primaryColor || theme.primaryColor || "#4f46e5",
    secondaryColor: config?.themeOverrides?.secondaryColor || theme.secondaryColor || "#1e293b",
    fontFamily: config?.themeOverrides?.fontFamily || theme.fontFamily || "Inter",
  };

  const layoutStyle = config?.layoutStyle || "single-column";

  if (layoutStyle === "two-column-left" || layoutStyle === "two-column-right") {
    const isLeftSidebar = layoutStyle === "two-column-left";
    return (
      <div
        className="bg-white text-slate-900 shadow-md mx-auto print:shadow-none grid grid-cols-12 min-h-[297mm] w-[210mm] overflow-hidden"
        style={{
          fontFamily: mergedTheme.fontFamily,
          fontSize: theme.fontSize ? `${theme.fontSize}px` : "13px",
        }}
      >
        {/* Sidebar */}
        <div
          className={`col-span-4 p-6 space-y-6 text-white ${
            isLeftSidebar ? "order-1" : "order-2"
          }`}
          style={{ backgroundColor: mergedTheme.primaryColor }}
        >
          <PersonalInfoSection data={data.personalInfo} theme={mergedTheme} />

          <SectionWrapper isEmpty={isSectionEmpty.skills(data)}>
            <SkillsSection skills={data.skills} theme={mergedTheme} />
          </SectionWrapper>

          <SectionWrapper isEmpty={isSectionEmpty.languages(data)}>
            <LanguagesSection languages={data.languages} theme={mergedTheme} />
          </SectionWrapper>

          <SectionWrapper isEmpty={isSectionEmpty.certifications(data)}>
            <CertificationsSection certifications={data.certifications} theme={mergedTheme} />
          </SectionWrapper>
        </div>

        {/* Main Content Area */}
        <div
          className={`col-span-8 p-6 space-y-5 bg-white ${
            isLeftSidebar ? "order-2" : "order-1"
          }`}
        >
          <SectionWrapper isEmpty={isSectionEmpty.summary(data)}>
            <SummarySection summary={data.summary} theme={mergedTheme} />
          </SectionWrapper>

          <SectionWrapper isEmpty={isSectionEmpty.experience(data)}>
            <ExperienceSection experience={data.experience} theme={mergedTheme} />
          </SectionWrapper>

          <SectionWrapper isEmpty={isSectionEmpty.projects(data)}>
            <ProjectsSection projects={data.projects} theme={mergedTheme} />
          </SectionWrapper>

          <SectionWrapper isEmpty={isSectionEmpty.education(data)}>
            <EducationSection education={data.education} theme={mergedTheme} />
          </SectionWrapper>

          <SectionWrapper isEmpty={isSectionEmpty.achievements(data)}>
            <AchievementsSection achievements={data.achievements} theme={mergedTheme} />
          </SectionWrapper>
        </div>
      </div>
    );
  }

  // Single Column / Top Banner Default
  return (
    <div
      className="bg-white text-slate-900 shadow-md mx-auto print:shadow-none p-8 space-y-5"
      style={{
        width: "210mm",
        minHeight: "297mm",
        fontFamily: mergedTheme.fontFamily,
        fontSize: theme.fontSize ? `${theme.fontSize}px` : "13px",
      }}
    >
      {/* Banner / Header */}
      {layoutStyle === "top-banner" ? (
        <div
          className="p-6 rounded-2xl text-white mb-6"
          style={{ backgroundColor: mergedTheme.primaryColor }}
        >
          <PersonalInfoSection data={data.personalInfo} theme={mergedTheme} />
        </div>
      ) : (
        <PersonalInfoSection data={data.personalInfo} theme={mergedTheme} />
      )}

      {/* Summary */}
      <SectionWrapper isEmpty={isSectionEmpty.summary(data)}>
        <SummarySection summary={data.summary} theme={mergedTheme} />
      </SectionWrapper>

      {/* Work Experience */}
      <SectionWrapper isEmpty={isSectionEmpty.experience(data)}>
        <ExperienceSection experience={data.experience} theme={mergedTheme} />
      </SectionWrapper>

      {/* Projects */}
      <SectionWrapper isEmpty={isSectionEmpty.projects(data)}>
        <ProjectsSection projects={data.projects} theme={mergedTheme} />
      </SectionWrapper>

      {/* Education */}
      <SectionWrapper isEmpty={isSectionEmpty.education(data)}>
        <EducationSection education={data.education} theme={mergedTheme} />
      </SectionWrapper>

      {/* Skills */}
      <SectionWrapper isEmpty={isSectionEmpty.skills(data)}>
        <SkillsSection skills={data.skills} theme={mergedTheme} />
      </SectionWrapper>

      {/* Certifications */}
      <SectionWrapper isEmpty={isSectionEmpty.certifications(data)}>
        <CertificationsSection certifications={data.certifications} theme={mergedTheme} />
      </SectionWrapper>

      {/* Achievements */}
      <SectionWrapper isEmpty={isSectionEmpty.achievements(data)}>
        <AchievementsSection achievements={data.achievements} theme={mergedTheme} />
      </SectionWrapper>

      {/* Languages */}
      <SectionWrapper isEmpty={isSectionEmpty.languages(data)}>
        <LanguagesSection languages={data.languages} theme={mergedTheme} />
      </SectionWrapper>

      {/* Volunteer */}
      <SectionWrapper isEmpty={isSectionEmpty.volunteer(data)}>
        <VolunteerSection volunteer={data.volunteer} theme={mergedTheme} />
      </SectionWrapper>

      {/* Publications */}
      <SectionWrapper isEmpty={isSectionEmpty.publications(data)}>
        <PublicationsSection publications={data.publications} theme={mergedTheme} />
      </SectionWrapper>

      {/* References */}
      <SectionWrapper isEmpty={isSectionEmpty.references(data)}>
        <ReferencesSection references={data.references} theme={mergedTheme} />
      </SectionWrapper>
    </div>
  );
}
