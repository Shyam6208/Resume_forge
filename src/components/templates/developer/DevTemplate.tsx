import type { ResumeData, ResumeTheme, SectionKey } from "@/types/resume.types";
import { isSectionEmpty } from "@/utils/section-checker";
import { SectionWrapper } from "@/components/sections/SectionWrapper";
import {
  SummarySection,
  ExperienceSection,
  EducationSection,
  ProjectsSection,
  SkillsSection,
  CertificationsSection,
  AchievementsSection,
  LanguagesSection,
  InterestsSection,
  VolunteerSection,
  PublicationsSection,
  ReferencesSection,
} from "@/components/sections";

interface DevTemplateProps {
  data: ResumeData;
  theme: ResumeTheme;
  sectionOrder?: SectionKey[];
}

export function DevTemplate({ data, theme, sectionOrder }: DevTemplateProps) {
  const headerBg = theme.primaryColor || "#0f172a";
  const isVisible = (key: SectionKey) => !sectionOrder || sectionOrder.includes(key);

  return (
    <div
      className="bg-white text-slate-900 shadow-md mx-auto print:shadow-none min-h-[297mm] flex flex-col"
      style={{
        width: "210mm",
        minHeight: "297mm",
        fontFamily: theme.fontFamily || "Inter",
        fontSize: theme.fontSize ? `${theme.fontSize}px` : "13px",
      }}
    >
      {/* Top Header Band */}
      {isVisible("personalInfo") && (
        <div className="p-6 text-white" style={{ backgroundColor: headerBg }}>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {data.personalInfo.fullName}
          </h1>
          {data.personalInfo.professionalTitle && (
            <p className="text-sm text-indigo-200 font-medium mt-0.5">
              {data.personalInfo.professionalTitle}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs text-slate-300">
            {data.personalInfo.email && (
              <span>📧 {data.personalInfo.email}</span>
            )}
            {data.personalInfo.github && (
              <span className="font-mono text-indigo-300">
                💻 github.com/{data.personalInfo.github.replace(/^https?:\/\/(www\.)?github\.com\//, "")}
              </span>
            )}
            {data.personalInfo.linkedin && (
              <span>🔗 {data.personalInfo.linkedin}</span>
            )}
            {data.personalInfo.website && (
              <span>🌐 {data.personalInfo.website.replace(/^https?:\/\//, "")}</span>
            )}
          </div>
        </div>
      )}

      {/* Main Body */}
      <div className="p-6 space-y-5 flex-1">
        {/* Summary */}
        <SectionWrapper isEmpty={isSectionEmpty.summary(data)} isVisible={isVisible("summary")}>
          <SummarySection summary={data.summary} theme={theme} />
        </SectionWrapper>

        {/* Skills & Tech Stack */}
        <SectionWrapper isEmpty={isSectionEmpty.skills(data)} isVisible={isVisible("skills")}>
          <SkillsSection skills={data.skills} theme={theme} />
        </SectionWrapper>

        {/* Work Experience */}
        <SectionWrapper isEmpty={isSectionEmpty.experience(data)} isVisible={isVisible("experience")}>
          <ExperienceSection experience={data.experience} theme={theme} />
        </SectionWrapper>

        {/* Prominent Projects */}
        <SectionWrapper isEmpty={isSectionEmpty.projects(data)} isVisible={isVisible("projects")}>
          <ProjectsSection projects={data.projects} theme={theme} />
        </SectionWrapper>

        {/* Education */}
        <SectionWrapper isEmpty={isSectionEmpty.education(data)} isVisible={isVisible("education")}>
          <EducationSection education={data.education} theme={theme} />
        </SectionWrapper>

        {/* Certifications */}
        <SectionWrapper isEmpty={isSectionEmpty.certifications(data)} isVisible={isVisible("certifications")}>
          <CertificationsSection certifications={data.certifications} theme={theme} />
        </SectionWrapper>

        {/* Achievements */}
        <SectionWrapper isEmpty={isSectionEmpty.achievements(data)} isVisible={isVisible("achievements")}>
          <AchievementsSection achievements={data.achievements} theme={theme} />
        </SectionWrapper>

        {/* Languages */}
        <SectionWrapper isEmpty={isSectionEmpty.languages(data)} isVisible={isVisible("languages")}>
          <LanguagesSection languages={data.languages} theme={theme} />
        </SectionWrapper>

        {/* Interests */}
        <SectionWrapper isEmpty={isSectionEmpty.interests(data)} isVisible={isVisible("interests")}>
          <InterestsSection interests={data.interests} theme={theme} />
        </SectionWrapper>

        {/* Volunteer */}
        <SectionWrapper isEmpty={isSectionEmpty.volunteer(data)} isVisible={isVisible("volunteer")}>
          <VolunteerSection volunteer={data.volunteer} theme={theme} />
        </SectionWrapper>

        {/* Publications */}
        <SectionWrapper isEmpty={isSectionEmpty.publications(data)} isVisible={isVisible("publications")}>
          <PublicationsSection publications={data.publications} theme={theme} />
        </SectionWrapper>

        {/* References */}
        <SectionWrapper isEmpty={isSectionEmpty.references(data)} isVisible={isVisible("references")}>
          <ReferencesSection references={data.references} theme={theme} />
        </SectionWrapper>
      </div>
    </div>
  );
}
