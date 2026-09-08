import type { ResumeData, ResumeTheme, SectionKey } from "@/types/resume.types";
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

interface CorporateProProps {
  data: ResumeData;
  theme: ResumeTheme;
  sectionOrder?: SectionKey[];
}

export function CorporatePro({ data, theme, sectionOrder }: CorporateProProps) {
  const corporateTheme: ResumeTheme = {
    ...theme,
    primaryColor: theme.primaryColor || "#1e3a8a", // Navy Blue
    secondaryColor: theme.secondaryColor || "#334155",
  };

  const isVisible = (key: SectionKey) => !sectionOrder || sectionOrder.includes(key);

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
      {isVisible("personalInfo") && (
        <PersonalInfoSection data={data.personalInfo} theme={corporateTheme} />
      )}

      {/* Executive Summary */}
      <SectionWrapper isEmpty={isSectionEmpty.summary(data)} isVisible={isVisible("summary")}>
        <SummarySection summary={data.summary} theme={corporateTheme} />
      </SectionWrapper>

      {/* Professional Experience (Primary focus for corporate/MBA) */}
      <SectionWrapper isEmpty={isSectionEmpty.experience(data)} isVisible={isVisible("experience")}>
        <ExperienceSection experience={data.experience} theme={corporateTheme} />
      </SectionWrapper>

      {/* Education */}
      <SectionWrapper isEmpty={isSectionEmpty.education(data)} isVisible={isVisible("education")}>
        <EducationSection education={data.education} theme={corporateTheme} />
      </SectionWrapper>

      {/* Core Competencies & Skills */}
      <SectionWrapper isEmpty={isSectionEmpty.skills(data)} isVisible={isVisible("skills")}>
        <SkillsSection skills={data.skills} theme={corporateTheme} />
      </SectionWrapper>

      {/* Strategic Projects */}
      <SectionWrapper isEmpty={isSectionEmpty.projects(data)} isVisible={isVisible("projects")}>
        <ProjectsSection projects={data.projects} theme={corporateTheme} />
      </SectionWrapper>

      {/* Certifications */}
      <SectionWrapper isEmpty={isSectionEmpty.certifications(data)} isVisible={isVisible("certifications")}>
        <CertificationsSection certifications={data.certifications} theme={corporateTheme} />
      </SectionWrapper>

      {/* Honors & Key Accomplishments */}
      <SectionWrapper isEmpty={isSectionEmpty.achievements(data)} isVisible={isVisible("achievements")}>
        <AchievementsSection achievements={data.achievements} theme={corporateTheme} />
      </SectionWrapper>

      {/* Languages */}
      <SectionWrapper isEmpty={isSectionEmpty.languages(data)} isVisible={isVisible("languages")}>
        <LanguagesSection languages={data.languages} theme={corporateTheme} />
      </SectionWrapper>

      {/* Interests */}
      <SectionWrapper isEmpty={isSectionEmpty.interests(data)} isVisible={isVisible("interests")}>
        <InterestsSection interests={data.interests} theme={corporateTheme} />
      </SectionWrapper>

      {/* Volunteer */}
      <SectionWrapper isEmpty={isSectionEmpty.volunteer(data)} isVisible={isVisible("volunteer")}>
        <VolunteerSection volunteer={data.volunteer} theme={corporateTheme} />
      </SectionWrapper>

      {/* Publications */}
      <SectionWrapper isEmpty={isSectionEmpty.publications(data)} isVisible={isVisible("publications")}>
        <PublicationsSection publications={data.publications} theme={corporateTheme} />
      </SectionWrapper>

      {/* References */}
      <SectionWrapper isEmpty={isSectionEmpty.references(data)} isVisible={isVisible("references")}>
        <ReferencesSection references={data.references} theme={corporateTheme} />
      </SectionWrapper>
    </div>
  );
}
