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

interface CorporateProProps {
  data: ResumeData;
  theme: ResumeTheme;
}

export function CorporatePro({ data, theme }: CorporateProProps) {
  const corporateTheme: ResumeTheme = {
    ...theme,
    primaryColor: theme.primaryColor || "#1e3a8a", // Navy Blue
    secondaryColor: theme.secondaryColor || "#334155",
  };

  return (
    <div
      className="bg-white text-slate-900 shadow-md mx-auto print:shadow-none p-8 space-y-5 border-t-8"
      style={{
        width: "210mm",
        minHeight: "297mm",
        fontFamily: theme.fontFamily || "Inter",
        fontSize: theme.fontSize ? `${theme.fontSize}px` : "13px",
        borderColor: corporateTheme.primaryColor,
      }}
    >
      {/* Header */}
      <PersonalInfoSection data={data.personalInfo} theme={corporateTheme} />

      {/* Executive Summary */}
      <SectionWrapper isEmpty={isSectionEmpty.summary(data)}>
        <SummarySection summary={data.summary} theme={corporateTheme} />
      </SectionWrapper>

      {/* Professional Experience (Primary focus for corporate/MBA) */}
      <SectionWrapper isEmpty={isSectionEmpty.experience(data)}>
        <ExperienceSection experience={data.experience} theme={corporateTheme} />
      </SectionWrapper>

      {/* Education */}
      <SectionWrapper isEmpty={isSectionEmpty.education(data)}>
        <EducationSection education={data.education} theme={corporateTheme} />
      </SectionWrapper>

      {/* Core Competencies & Skills */}
      <SectionWrapper isEmpty={isSectionEmpty.skills(data)}>
        <SkillsSection skills={data.skills} theme={corporateTheme} />
      </SectionWrapper>

      {/* Strategic Projects */}
      <SectionWrapper isEmpty={isSectionEmpty.projects(data)}>
        <ProjectsSection projects={data.projects} theme={corporateTheme} />
      </SectionWrapper>

      {/* Certifications */}
      <SectionWrapper isEmpty={isSectionEmpty.certifications(data)}>
        <CertificationsSection certifications={data.certifications} theme={corporateTheme} />
      </SectionWrapper>

      {/* Honors & Key Accomplishments */}
      <SectionWrapper isEmpty={isSectionEmpty.achievements(data)}>
        <AchievementsSection achievements={data.achievements} theme={corporateTheme} />
      </SectionWrapper>

      {/* Languages */}
      <SectionWrapper isEmpty={isSectionEmpty.languages(data)}>
        <LanguagesSection languages={data.languages} theme={corporateTheme} />
      </SectionWrapper>

      {/* Volunteer */}
      <SectionWrapper isEmpty={isSectionEmpty.volunteer(data)}>
        <VolunteerSection volunteer={data.volunteer} theme={corporateTheme} />
      </SectionWrapper>

      {/* Publications */}
      <SectionWrapper isEmpty={isSectionEmpty.publications(data)}>
        <PublicationsSection publications={data.publications} theme={corporateTheme} />
      </SectionWrapper>

      {/* References */}
      <SectionWrapper isEmpty={isSectionEmpty.references(data)}>
        <ReferencesSection references={data.references} theme={corporateTheme} />
      </SectionWrapper>
    </div>
  );
}
