import React from "react";
import type { ResumeData, ResumeTheme, SectionKey } from "@/types/resume.types";
import { normalizeTemplateData, NormalizedTemplateData } from "@/lib/templates/normalize-template-data";
import {
  User, Mail, Phone, MapPin, Globe, ExternalLink,
  Briefcase, GraduationCap, Code2, Terminal, Award, FileBadge,
  Sparkles, CheckCircle2, Laptop, Bookmark
} from "lucide-react";

interface DynamicTemplateProps {
  data: ResumeData;
  theme: ResumeTheme;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config?: any | null;
  sectionOrder?: SectionKey[];
}

// Helper to resolve profile icon dynamically
function renderProfileIconComponent(iconName?: string, primaryColor?: string) {
  const iconProps = { className: "w-7 h-7", style: { color: primaryColor || "#3b82f6" } };
  const lower = (iconName || "user").toLowerCase();

  if (lower.includes("code") || lower.includes("dev")) return <Code2 {...iconProps} />;
  if (lower.includes("term")) return <Terminal {...iconProps} />;
  if (lower.includes("brief") || lower.includes("work")) return <Briefcase {...iconProps} />;
  if (lower.includes("laptop")) return <Laptop {...iconProps} />;
  if (lower.includes("spark")) return <Sparkles {...iconProps} />;
  if (lower.includes("grad") || lower.includes("edu")) return <GraduationCap {...iconProps} />;
  
  return <User {...iconProps} />;
}

export function DynamicTemplate({ data, theme, config, sectionOrder }: DynamicTemplateProps) {
  // 1. Merge and extract effective data from config / data
  const rawSource = config && typeof config === "object" ? { ...config, ...data } : data;
  const normData: NormalizedTemplateData = normalizeTemplateData(rawSource, data);

  // Canonical section visibility gate
  const isSectionVisible = (key: SectionKey) => {
    if (!sectionOrder || sectionOrder.length === 0) return true;
    return sectionOrder.includes(key);
  };

  const experienceList = normData.experience || [];
  const educationList = normData.education || [];
  const projectsList = normData.projects || [];
  const achievementsList = normData.achievements || [];
  const certificationsList = normData.certifications || [];

  // 2. Extract theme overrides
  const themeOverrides = config?.themeOverrides || {};
  const primaryColor = themeOverrides.primaryColor || theme.primaryColor || "#3b82f6";
  const secondaryColor = themeOverrides.secondaryColor || theme.secondaryColor || "#1e293b";
  const accentColor = themeOverrides.accentColor || primaryColor;
  const textColor = themeOverrides.textColor || "#1e293b";
  const mutedColor = themeOverrides.mutedColor || themeOverrides.mutedTextColor || "#64748b";
  const borderColor = themeOverrides.borderColor || "#e2e8f0";
  const pageBg = themeOverrides.backgroundColor || themeOverrides.pageBackground || "#ffffff";
  const fontFamily = themeOverrides.fontFamily || theme.fontFamily || "Inter, -apple-system, BlinkMacSystemFont, sans-serif";

  // 3. Extract layout configuration
  const rawLayout = config?.layoutStyle || config?.template || "two-column-left";

  let hasSidebar = true;
  let gridColumns = "30% 70%";
  let sidebarBg = themeOverrides.sidebarColor || themeOverrides.sidebarBg || themeOverrides.sidebarBackground || "#182131";
  let sidebarTextColor = themeOverrides.sidebarTextColor || "#ffffff";
  let sidebarPadding = "28px 20px";
  let mainBg = pageBg;
  let mainPadding = "28px 24px";
  let isTopBanner = false;
  let isSingleColumn = false;
  let isRightSidebar = false;

  if (typeof rawLayout === "object" && rawLayout !== null) {
    if (rawLayout.page?.gridTemplateColumns) {
      gridColumns = rawLayout.page.gridTemplateColumns;
      hasSidebar = gridColumns.includes(" ");
    }
    if (rawLayout.sidebar?.background || rawLayout.sidebar?.backgroundColor) {
      sidebarBg = rawLayout.sidebar.background || rawLayout.sidebar.backgroundColor;
    }
    if (rawLayout.sidebar?.color || rawLayout.sidebar?.textColor) {
      sidebarTextColor = rawLayout.sidebar.color || rawLayout.sidebar.textColor;
    }
    if (rawLayout.sidebar?.padding) {
      sidebarPadding = rawLayout.sidebar.padding;
    }
    if (rawLayout.main?.background || rawLayout.main?.backgroundColor) {
      mainBg = rawLayout.main.background || rawLayout.main.backgroundColor;
    }
    if (rawLayout.main?.padding) {
      mainPadding = rawLayout.main.padding;
    }
  } else if (typeof rawLayout === "string") {
    if (rawLayout === "single-column") {
      hasSidebar = false;
      isSingleColumn = true;
    } else if (rawLayout === "top-banner" || rawLayout === "banner") {
      hasSidebar = false;
      isTopBanner = true;
    } else if (rawLayout === "two-column-right" || rawLayout === "right-sidebar") {
      hasSidebar = true;
      isRightSidebar = true;
      gridColumns = "70% 30%";
    } else {
      // Default: two-column-left / modern-developer-sidebar
      hasSidebar = true;
      gridColumns = "30% 70%";
    }
  }

  // 4. Header Config
  const headerConfig = config?.headerConfig || {};
  const pi = normData.personalInfo;
  const nameParts = (pi.fullName || "").split(" ");
  const firstName = nameParts[0] || "YOUR";
  const lastName = nameParts.slice(1).join(" ") || "NAME";

  // 5. Skill Pill Styling
  const pillStyle = normData.skillsConfig?.pill || {};
  const pillBg = pillStyle.background || pillStyle.backgroundColor || "rgba(255, 255, 255, 0.10)";
  const pillColor = pillStyle.color || pillStyle.textColor || sidebarTextColor;
  const pillBorder = pillStyle.border || "1px solid rgba(255, 255, 255, 0.16)";
  const pillRadius = pillStyle.borderRadius || "4px";
  const pillFontSize = pillStyle.fontSize || "11px";

  // 6. Experience Timeline Config
  const expTimeline = normData.experienceConfig?.timeline || {};
  const isTimelineEnabled = Boolean(expTimeline.enabled ?? (experienceList.length > 0));
  const timelineLineColor = expTimeline.lineColor || "#cbd5e1";
  const timelineLineWidth = expTimeline.lineWidth || "2px";
  const timelineDotColor = expTimeline.dotColor || primaryColor;
  const timelineDotSize = expTimeline.dotSize || "8.5px";

  // 7. Bottom Section (Achievements + Certifications visibility & 2-Column support)
  const bottomSection = normData.bottomSectionConfig;
  const hasAchievements = isSectionVisible("achievements") && achievementsList.length > 0;
  const hasCertifications = isSectionVisible("certifications") && certificationsList.length > 0;
  const isBottomTwoCols = (bottomSection?.columns === 2) || (hasAchievements && hasCertifications);

  // --- RENDER SIDEBAR COMPONENT ---
  const renderSidebarContent = () => (
    <aside
      className="h-full flex flex-col justify-start space-y-6 shrink-0 print:text-black"
      style={{
        backgroundColor: sidebarBg,
        color: sidebarTextColor,
        padding: sidebarPadding,
        order: isRightSidebar ? 2 : 1,
      }}
    >
      {/* 1. Profile Header in Sidebar (Personal Info) */}
      {isSectionVisible("personalInfo") && (
        <div className="space-y-2.5 pb-5 border-b" style={{ borderColor: "rgba(255,255,255,0.15)" }}>
          {/* Profile Icon Support (headerConfig.showProfileIcon === true) */}
          {headerConfig.showProfileIcon && (
            <div
              className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center border-2 shadow-md transition-all"
              style={{
                borderColor: primaryColor,
                backgroundColor: "rgba(255, 255, 255, 0.06)",
                boxShadow: `0 0 12px ${primaryColor}30`,
              }}
            >
              {renderProfileIconComponent(headerConfig.profileIcon, primaryColor)}
            </div>
          )}

          {/* Optional photo if configured */}
          {headerConfig.showPhoto && pi.profilePhoto && (
            <div
              className={`w-20 h-20 overflow-hidden mx-auto mb-3 border-2 shadow-md ${
                headerConfig.photoShape === "circle" ? "rounded-full" : "rounded-xl"
              }`}
              style={{ borderColor: primaryColor }}
            >
              <img src={pi.profilePhoto} alt={pi.fullName} className="w-full h-full object-cover" />
            </div>
          )}

          <h1 className="text-[21px] font-black tracking-tight uppercase leading-tight">
            <span style={{ color: sidebarTextColor }}>{firstName} </span>
            <span style={{ color: primaryColor }}>{lastName}</span>
          </h1>
          {pi.professionalTitle && (
            <p
              className="text-[11.5px] font-bold uppercase tracking-wider"
              style={{ color: headerConfig.taglineColor || primaryColor }}
            >
              {pi.professionalTitle}
            </p>
          )}
        </div>
      )}

      {/* 2. Contact Section */}
      {isSectionVisible("personalInfo") && (
        <div className="space-y-3 pb-5 border-b" style={{ borderColor: "rgba(255,255,255,0.15)" }}>
          <h3
            className="text-[11.5px] font-extrabold uppercase tracking-wider flex items-center gap-1.5"
            style={{ color: primaryColor }}
          >
            <Bookmark className="w-3 h-3" style={{ color: primaryColor }} />
            <span>Contact</span>
          </h3>
          <div className="space-y-2.5 text-[11.5px] opacity-95">
            {pi.email && (
              <div className="flex items-center gap-2.5 break-all">
                <Mail className="w-3.5 h-3.5 shrink-0" style={{ color: primaryColor }} />
                <span className="leading-tight">{pi.email}</span>
              </div>
            )}
            {pi.phone && (
              <div className="flex items-center gap-2.5">
                <Phone className="w-3.5 h-3.5 shrink-0" style={{ color: primaryColor }} />
                <span className="leading-tight">{pi.phone}</span>
              </div>
            )}
            {(pi.city || pi.address) && (
              <div className="flex items-center gap-2.5">
                <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: primaryColor }} />
                <span className="leading-tight">{[pi.city, pi.country || pi.address].filter(Boolean).join(", ")}</span>
              </div>
            )}
            {pi.linkedin && (
              <div className="flex items-center gap-2.5 break-all">
                <ExternalLink className="w-3.5 h-3.5 shrink-0" style={{ color: primaryColor }} />
                <span className="leading-tight">{pi.linkedin.replace(/^https?:\/\/(www\.)?/, "")}</span>
              </div>
            )}
            {pi.github && (
              <div className="flex items-center gap-2.5 break-all">
                <Code2 className="w-3.5 h-3.5 shrink-0" style={{ color: primaryColor }} />
                <span className="leading-tight">{pi.github.replace(/^https?:\/\/(www\.)?/, "")}</span>
              </div>
            )}
            {pi.website && (
              <div className="flex items-center gap-2.5 break-all">
                <Globe className="w-3.5 h-3.5 shrink-0" style={{ color: primaryColor }} />
                <span className="leading-tight">{pi.website.replace(/^https?:\/\/(www\.)?/, "")}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Skills Section with Pill Styling */}
      {isSectionVisible("skills") && normData.skillsConfig?.categories && Object.keys(normData.skillsConfig.categories).length > 0 && (
        <div className="space-y-3 pb-5 border-b" style={{ borderColor: "rgba(255,255,255,0.15)" }}>
          <h3
            className="text-[11.5px] font-extrabold uppercase tracking-wider flex items-center gap-1.5"
            style={{ color: primaryColor }}
          >
            <Code2 className="w-3 h-3" style={{ color: primaryColor }} />
            <span>{normData.skillsConfig.title || "Skills & Expertise"}</span>
          </h3>
          <div className="space-y-3">
            {Object.entries(normData.skillsConfig.categories).map(([catName, skillItems]) => (
              <div key={catName} className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-85 block">
                  {catName}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {skillItems.map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      className="inline-block px-2.5 py-0.5 font-medium transition-all"
                      style={{
                        backgroundColor: pillBg,
                        color: pillColor,
                        border: pillBorder,
                        borderRadius: pillRadius,
                        fontSize: pillFontSize,
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Education in Sidebar */}
      {isSectionVisible("education") && educationList.length > 0 && (
        <div className="space-y-3 pb-2">
          <h3
            className="text-[11.5px] font-extrabold uppercase tracking-wider flex items-center gap-1.5"
            style={{ color: primaryColor }}
          >
            <GraduationCap className="w-3 h-3" style={{ color: primaryColor }} />
            <span>{normData.educationConfig?.title || "Education"}</span>
          </h3>
          <div className="space-y-3 text-xs">
            {educationList.map((edu) => (
              <div key={edu.id} className="space-y-0.5">
                <p className="font-bold text-[11.5px] leading-snug" style={{ color: sidebarTextColor }}>
                  {edu.degree}
                </p>
                <p className="text-[11px] opacity-85">{edu.institution}</p>
                <div className="flex items-center justify-between text-[10.5px] opacity-75 pt-0.5">
                  <span>{[edu.startDate, edu.endDate].filter(Boolean).join(" - ")}</span>
                  {edu.grade && (
                    <span className="font-bold text-emerald-400">
                      CGPA: {edu.grade}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );

  // --- RENDER MAIN CONTENT COMPONENT ---
  const renderMainContent = () => (
    <main
      className="h-full flex flex-col space-y-6 print:text-black"
      style={{
        backgroundColor: mainBg,
        color: textColor,
        padding: mainPadding,
        order: isRightSidebar ? 1 : 2,
      }}
    >
      {/* If single column or top banner, render header in main area */}
      {(!hasSidebar || isTopBanner || isSingleColumn) && isSectionVisible("personalInfo") && (
        <div className={`space-y-2 border-b pb-5 ${isTopBanner ? "bg-slate-900 text-white p-6 -m-6 mb-6 rounded-b-2xl" : ""}`} style={{ borderColor }}>
          <h1 className="text-2xl font-black tracking-tight uppercase">
            <span style={{ color: isTopBanner ? "#ffffff" : textColor }}>{firstName} </span>
            <span style={{ color: primaryColor }}>{lastName}</span>
          </h1>
          {pi.professionalTitle && (
            <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: primaryColor }}>
              {pi.professionalTitle}
            </p>
          )}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs pt-2 opacity-90" style={{ color: isTopBanner ? "#e2e8f0" : mutedColor }}>
            {pi.email && <span>{pi.email}</span>}
            {pi.phone && <span>• {pi.phone}</span>}
            {pi.city && <span>• {pi.city}</span>}
            {pi.linkedin && <span>• {pi.linkedin}</span>}
            {pi.github && <span>• {pi.github}</span>}
          </div>
        </div>
      )}

      {/* Professional Summary */}
      {isSectionVisible("summary") && normData.summary && (
        <section className="space-y-2.5">
          <div className="flex items-center gap-2 pb-1.5 border-b" style={{ borderColor }}>
            <div
              className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${primaryColor}18` }}
            >
              <Sparkles className="w-3.5 h-3.5" style={{ color: primaryColor }} />
            </div>
            <h2
              className="text-[12.5px] font-extrabold uppercase tracking-wider"
              style={{ color: primaryColor }}
            >
              {normData.professionalSummaryConfig?.title || "Professional Summary"}
            </h2>
          </div>
          <p className="text-[12.5px] leading-relaxed text-slate-800" style={{ color: textColor }}>
            {normData.summary}
          </p>
        </section>
      )}

      {/* Experience Section (with Real Timeline Support) */}
      {isSectionVisible("experience") && experienceList.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2 pb-1.5 border-b" style={{ borderColor }}>
            <div
              className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${primaryColor}18` }}
            >
              <Briefcase className="w-3.5 h-3.5" style={{ color: primaryColor }} />
            </div>
            <h2
              className="text-[12.5px] font-extrabold uppercase tracking-wider"
              style={{ color: primaryColor }}
            >
              {normData.experienceConfig?.title || "Work Experience"}
            </h2>
          </div>

          <div
            className={`space-y-4 ${
              isTimelineEnabled ? "relative pl-5 ml-1.5" : ""
            }`}
            style={
              isTimelineEnabled
                ? {
                    borderLeft: `${timelineLineWidth} solid ${timelineLineColor}`,
                  }
                : undefined
            }
          >
            {experienceList.map((exp) => (
              <div key={exp.id} className="relative space-y-1">
                {/* Timeline Dot */}
                {isTimelineEnabled && (
                  <span
                    className="absolute -left-[24.5px] top-1.5 rounded-full shadow-sm"
                    style={{
                      width: timelineDotSize,
                      height: timelineDotSize,
                      backgroundColor: timelineDotColor,
                      boxShadow: "0 0 0 3px #ffffff",
                    }}
                  />
                )}

                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                  <span className="text-[13px] font-bold text-slate-900" style={{ color: textColor }}>
                    {exp.position} <span className="font-normal text-slate-500" style={{ color: mutedColor }}>at</span>{" "}
                    <span style={{ color: primaryColor }}>{exp.company}</span>
                  </span>
                  <span className="text-[11px] font-semibold tracking-wide shrink-0" style={{ color: mutedColor }}>
                    {[exp.startDate, exp.endDate || (exp.isCurrentlyWorking ? "Present" : "")].filter(Boolean).join(" - ")}
                  </span>
                </div>

                {exp.location && (
                  <p className="text-[10.5px] font-medium" style={{ color: mutedColor }}>
                    {exp.location}
                  </p>
                )}

                {exp.description && (
                  <p className="text-[12px] text-slate-700 leading-snug">{exp.description}</p>
                )}

                {exp.responsibilities && exp.responsibilities.length > 0 && (
                  <ul className="list-disc list-inside space-y-0.5 text-[12px] text-slate-700 pl-0.5">
                    {exp.responsibilities.map((resp, rIdx) => (
                      <li key={rIdx} className="leading-relaxed">
                        <span style={{ color: textColor }}>{resp}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects Section (with Tech Stack Alignment) */}
      {isSectionVisible("projects") && projectsList.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2 pb-1.5 border-b" style={{ borderColor }}>
            <div
              className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${primaryColor}18` }}
            >
              <Code2 className="w-3.5 h-3.5" style={{ color: primaryColor }} />
            </div>
            <h2
              className="text-[12.5px] font-extrabold uppercase tracking-wider"
              style={{ color: primaryColor }}
            >
              {normData.projectsConfig?.title || "Projects"}
            </h2>
          </div>

          <div className="space-y-3.5">
            {projectsList.map((proj) => (
              <div key={proj.id} className="space-y-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-bold tracking-tight" style={{ color: textColor }}>
                      {proj.name}
                    </span>
                    {proj.githubLink && (
                      <a
                        href={proj.githubLink.startsWith("http") ? proj.githubLink : `https://${proj.githubLink}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-semibold hover:underline flex items-center gap-0.5 opacity-85 hover:opacity-100"
                        style={{ color: primaryColor }}
                      >
                        <span>Link</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>

                  {proj.technologies && proj.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {proj.technologies.map((t, tIdx) => (
                        <span
                          key={tIdx}
                          className="text-[10px] font-semibold px-2 py-0.5 rounded"
                          style={{
                            backgroundColor: `${primaryColor}12`,
                            color: primaryColor,
                            border: `1px solid ${primaryColor}25`,
                          }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {proj.description && (
                  <p className="text-[12px] text-slate-700 leading-relaxed" style={{ color: textColor }}>
                    {proj.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Bottom Section: Achievements & Certifications (True 2-Column Support) */}
      {(hasAchievements || hasCertifications) && (
        <section className="space-y-3">
          <div
            className={
              isBottomTwoCols
                ? "grid grid-cols-2 gap-6"
                : "space-y-4"
            }
          >
            {/* Column 1: Achievements */}
            {hasAchievements && (
              <div className="space-y-2.5">
                <div className="flex items-center gap-1.5 pb-1 border-b" style={{ borderColor }}>
                  <Award className="w-3.5 h-3.5" style={{ color: primaryColor }} />
                  <h3
                    className="text-[11.5px] font-extrabold uppercase tracking-wider"
                    style={{ color: primaryColor }}
                  >
                    Achievements
                  </h3>
                </div>
                <ul className="space-y-1.5 text-[12px]">
                  {achievementsList.map((ach) => (
                    <li key={ach.id} className="flex items-start gap-1.5 leading-snug">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: primaryColor }} />
                      <span style={{ color: textColor }}>{ach.title}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Column 2: Certifications */}
            {hasCertifications && (
              <div className="space-y-2.5">
                <div className="flex items-center gap-1.5 pb-1 border-b" style={{ borderColor }}>
                  <FileBadge className="w-3.5 h-3.5" style={{ color: primaryColor }} />
                  <h3
                    className="text-[11.5px] font-extrabold uppercase tracking-wider"
                    style={{ color: primaryColor }}
                  >
                    Certifications
                  </h3>
                </div>
                <ul className="space-y-1.5 text-[12px]">
                  {certificationsList.map((cert) => (
                    <li key={cert.id} className="flex items-start gap-1.5 leading-snug">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: primaryColor }} />
                      <div>
                        <span className="font-medium" style={{ color: textColor }}>{cert.name}</span>
                        {cert.organization && (
                          <span className="text-[10.5px] block" style={{ color: mutedColor }}>
                            {cert.organization}
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      {/* If single column, render Education in main area */}
      {(!hasSidebar || isSingleColumn) && isSectionVisible("education") && educationList.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2 pb-1.5 border-b" style={{ borderColor }}>
            <div
              className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${primaryColor}18` }}
            >
              <GraduationCap className="w-3.5 h-3.5" style={{ color: primaryColor }} />
            </div>
            <h2
              className="text-[12.5px] font-extrabold uppercase tracking-wider"
              style={{ color: primaryColor }}
            >
              Education
            </h2>
          </div>
          <div className="space-y-2">
            {educationList.map((edu) => (
              <div key={edu.id} className="flex justify-between items-baseline text-xs">
                <div>
                  <p className="font-bold">{edu.degree}</p>
                  <p className="text-slate-600 text-[11px]">{edu.institution}</p>
                </div>
                <div className="text-right text-[11px] text-slate-500">
                  <span>{[edu.startDate, edu.endDate].filter(Boolean).join(" - ")}</span>
                  {edu.grade && <p className="font-semibold text-emerald-600">CGPA: {edu.grade}</p>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );

  // --- ROOT A4 CONTAINER ---
  return (
    <div
      className="a4-resume-page bg-white shadow-xl mx-auto print:shadow-none print:m-0 overflow-hidden box-border"
      style={{
        width: "210mm",
        minHeight: "297mm",
        fontFamily,
        backgroundColor: pageBg,
        color: textColor,
        display: hasSidebar ? "grid" : "block",
        gridTemplateColumns: hasSidebar ? gridColumns : undefined,
      }}
    >
      {hasSidebar && !isRightSidebar && renderSidebarContent()}
      {renderMainContent()}
      {hasSidebar && isRightSidebar && renderSidebarContent()}
    </div>
  );
}
