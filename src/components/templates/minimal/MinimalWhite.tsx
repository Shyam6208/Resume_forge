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
  InterestsSection,
  VolunteerSection,
  PublicationsSection,
  ReferencesSection,
} from "@/components/sections";

interface MinimalWhiteProps {
  data: ResumeData;
  theme: ResumeTheme;
}

export function MinimalWhite({ data, theme }: MinimalWhiteProps) {
  return (
    <div
      className="bg-white text-slate-900 shadow-md mx-auto print:shadow-none p-8 space-y-5"
      style={{
        width: "210mm",
        minHeight: "297mm",
        fontFamily: theme.fontFamily || "Inter",
        fontSize: theme.fontSize ? `${theme.fontSize}px` : "13px",
      }}
    >
      {/* Header */}
      <PersonalInfoSection data={data.personalInfo} theme={theme} />

      {/* Summary */}
      <SectionWrapper isEmpty={isSectionEmpty.summary(data)}>
        <SummarySection summary={data.summary} theme={theme} />
      </SectionWrapper>

      {/* Work Experience */}
      <SectionWrapper isEmpty={isSectionEmpty.experience(data)}>
        <ExperienceSection experience={data.experience} theme={theme} />
      </SectionWrapper>

      {/* Projects */}
      <SectionWrapper isEmpty={isSectionEmpty.projects(data)}>
        <ProjectsSection projects={data.projects} theme={theme} />
      </SectionWrapper>

      {/* Education */}
      <SectionWrapper isEmpty={isSectionEmpty.education(data)}>
        <EducationSection education={data.education} theme={theme} />
      </SectionWrapper>

      {/* Skills */}
      <SectionWrapper isEmpty={isSectionEmpty.skills(data)}>
        <SkillsSection skills={data.skills} theme={theme} />
      </SectionWrapper>

      {/* Certifications */}
      <SectionWrapper isEmpty={isSectionEmpty.certifications(data)}>
        <CertificationsSection certifications={data.certifications} theme={theme} />
      </SectionWrapper>

      {/* Achievements */}
      <SectionWrapper isEmpty={isSectionEmpty.achievements(data)}>
        <AchievementsSection achievements={data.achievements} theme={theme} />
      </SectionWrapper>

      {/* Languages */}
      <SectionWrapper isEmpty={isSectionEmpty.languages(data)}>
        <LanguagesSection languages={data.languages} theme={theme} />
      </SectionWrapper>

      {/* Interests */}
      <SectionWrapper isEmpty={isSectionEmpty.interests(data)}>
        <InterestsSection interests={data.interests} theme={theme} />
      </SectionWrapper>

      {/* Volunteer */}
      <SectionWrapper isEmpty={isSectionEmpty.volunteer(data)}>
        <VolunteerSection volunteer={data.volunteer} theme={theme} />
      </SectionWrapper>

      {/* Publications */}
      <SectionWrapper isEmpty={isSectionEmpty.publications(data)}>
        <PublicationsSection publications={data.publications} theme={theme} />
      </SectionWrapper>

      {/* References */}
      <SectionWrapper isEmpty={isSectionEmpty.references(data)}>
        <ReferencesSection references={data.references} theme={theme} />
      </SectionWrapper>
    </div>
  );
}
