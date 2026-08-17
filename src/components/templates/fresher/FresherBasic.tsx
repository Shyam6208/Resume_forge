import type { ResumeData, ResumeTheme } from "@/types/resume.types";
import { isSectionEmpty } from "@/utils/section-checker";
import { SectionWrapper } from "@/components/sections/SectionWrapper";
import {
  PersonalInfoSection,
  EducationSection,
  ProjectsSection,
  SkillsSection,
  CertificationsSection,
  AchievementsSection,
  LanguagesSection,
  ExperienceSection,
  InterestsSection,
  VolunteerSection,
  PublicationsSection,
  ReferencesSection,
} from "@/components/sections";

interface FresherBasicProps {
  data: ResumeData;
  theme: ResumeTheme;
}

export function FresherBasic({ data, theme }: FresherBasicProps) {
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
      {/* Personal Info Header */}
      <PersonalInfoSection data={data.personalInfo} theme={theme} />

      {/* Career Objective */}
      <SectionWrapper isEmpty={isSectionEmpty.summary(data)}>
        <div className="mb-4">
          <h2
            className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2"
            style={{ color: theme.primaryColor }}
          >
            Career Objective
          </h2>
          <p className="text-xs text-slate-700 leading-relaxed text-justify">
            {data.summary}
          </p>
        </div>
      </SectionWrapper>

      {/* Prominent Education (First priority for students/freshers) */}
      <SectionWrapper isEmpty={isSectionEmpty.education(data)}>
        <div className="border-l-4 pl-3 py-1" style={{ borderColor: theme.primaryColor }}>
          <EducationSection education={data.education} theme={theme} />
        </div>
      </SectionWrapper>

      {/* Projects (Second priority) */}
      <SectionWrapper isEmpty={isSectionEmpty.projects(data)}>
        <ProjectsSection projects={data.projects} theme={theme} />
      </SectionWrapper>

      {/* Technical & Soft Skills */}
      <SectionWrapper isEmpty={isSectionEmpty.skills(data)}>
        <SkillsSection skills={data.skills} theme={theme} />
      </SectionWrapper>

      {/* Work / Internship Experience (Optional - auto hides if empty) */}
      <SectionWrapper isEmpty={isSectionEmpty.experience(data)}>
        <ExperienceSection experience={data.experience} theme={theme} />
      </SectionWrapper>

      {/* Certifications */}
      <SectionWrapper isEmpty={isSectionEmpty.certifications(data)}>
        <CertificationsSection certifications={data.certifications} theme={theme} />
      </SectionWrapper>

      {/* Key Achievements */}
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
