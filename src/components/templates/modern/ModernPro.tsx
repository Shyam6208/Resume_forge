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

interface ModernProProps {
  data: ResumeData;
  theme: ResumeTheme;
}

export function ModernPro({ data, theme }: ModernProProps) {
  const sidebarBg = theme.primaryColor || "#1e293b";
  const mainFontColor = "#1e293b";

  return (
    <div
      className="bg-white text-slate-900 shadow-md mx-auto print:shadow-none flex min-h-[297mm] overflow-hidden"
      style={{
        width: "210mm",
        minHeight: "297mm",
        fontFamily: theme.fontFamily || "Inter",
        fontSize: theme.fontSize ? `${theme.fontSize}px` : "13px",
      }}
    >
      {/* Left Sidebar (32%) */}
      <div
        className="w-[32%] p-6 text-white space-y-6 shrink-0"
        style={{ backgroundColor: sidebarBg }}
      >
        {/* Photo */}
        {theme.showPhoto && data.personalInfo.profilePhoto && (
          <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-2 border-white/20 shadow-md">
            <img
              src={data.personalInfo.profilePhoto}
              alt={data.personalInfo.fullName}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Sidebar Contact Info */}
        <div className="space-y-2 text-xs opacity-90 border-b border-white/10 pb-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white/70">Contact</h3>
          {data.personalInfo.email && (
            <p className="break-all">{data.personalInfo.email}</p>
          )}
          {data.personalInfo.phone && <p>{data.personalInfo.phone}</p>}
          {(data.personalInfo.city || data.personalInfo.country) && (
            <p>
              {[data.personalInfo.city, data.personalInfo.country]
                .filter(Boolean)
                .join(", ")}
            </p>
          )}
          {data.personalInfo.website && (
            <p className="break-all">{data.personalInfo.website.replace(/^https?:\/\//, "")}</p>
          )}
          {data.personalInfo.linkedin && (
            <p className="break-all">LinkedIn: {data.personalInfo.linkedin}</p>
          )}
          {data.personalInfo.github && (
            <p className="break-all">GitHub: {data.personalInfo.github}</p>
          )}
        </div>

        {/* Sidebar Skills */}
        <SectionWrapper isEmpty={isSectionEmpty.skills(data)}>
          <div className="border-b border-white/10 pb-4">
            <SkillsSection skills={data.skills} theme={{ ...theme, primaryColor: "#ffffff", secondaryColor: "#e2e8f0" }} />
          </div>
        </SectionWrapper>

        {/* Sidebar Languages */}
        <SectionWrapper isEmpty={isSectionEmpty.languages(data)}>
          <div className="border-b border-white/10 pb-4">
            <LanguagesSection languages={data.languages} theme={{ ...theme, primaryColor: "#ffffff" }} />
          </div>
        </SectionWrapper>

        {/* Sidebar Interests */}
        <SectionWrapper isEmpty={isSectionEmpty.interests(data)}>
          <div>
            <InterestsSection interests={data.interests} theme={{ ...theme, primaryColor: "#ffffff" }} />
          </div>
        </SectionWrapper>
      </div>

      {/* Main Content Area (68%) */}
      <div className="w-[68%] p-6 space-y-5">
        {/* Name Header */}
        <div className="border-b pb-4" style={{ borderColor: theme.primaryColor }}>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: theme.primaryColor }}
          >
            {data.personalInfo.fullName}
          </h1>
          {data.personalInfo.professionalTitle && (
            <p className="text-sm font-medium text-slate-600 mt-1">
              {data.personalInfo.professionalTitle}
            </p>
          )}
        </div>

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

        {/* Certifications */}
        <SectionWrapper isEmpty={isSectionEmpty.certifications(data)}>
          <CertificationsSection certifications={data.certifications} theme={theme} />
        </SectionWrapper>

        {/* Achievements */}
        <SectionWrapper isEmpty={isSectionEmpty.achievements(data)}>
          <AchievementsSection achievements={data.achievements} theme={theme} />
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
    </div>
  );
}
