import type { ResumeData, PersonalInfo, ExperienceEntry, EducationEntry, ProjectEntry, Skills, CertificationEntry, AchievementEntry } from "@/types/resume.types";

export interface NormalizedTemplateData extends ResumeData {
  rawConfig?: any;
  professionalSummaryConfig?: {
    title?: string;
    content?: string;
  };
  experienceConfig?: {
    title?: string;
    timeline?: {
      enabled?: boolean;
      lineColor?: string;
      lineWidth?: string;
      dotColor?: string;
      dotSize?: string;
    };
    items?: ExperienceEntry[];
  };
  skillsConfig?: {
    title?: string;
    pill?: {
      background?: string;
      backgroundColor?: string;
      color?: string;
      textColor?: string;
      borderRadius?: string;
      fontSize?: string;
      border?: string;
      padding?: string;
    };
    categories?: Record<string, string[]>;
    items?: string[];
  };
  projectsConfig?: {
    title?: string;
    items?: ProjectEntry[];
  };
  educationConfig?: {
    title?: string;
    items?: EducationEntry[];
  };
  bottomSectionConfig?: {
    title?: string;
    columns?: number;
    achievements?: (string | AchievementEntry)[];
    certifications?: (string | CertificationEntry)[];
  };
}

/**
 * Normalizes custom template JSON or raw resume payload into standard ResumeForge ResumeData.
 * Handles loose formats, custom naming conventions, object wrapper structures (e.g. experience.items,
 * skills.categories, skills.pill, timeline configs, bottomSection columns: 2, etc.).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeTemplateData(source: any, fallbackData?: ResumeData): NormalizedTemplateData {
  if (!source || typeof source !== "object") {
    return {
      ...(fallbackData || getEmptyResumeData()),
      rawConfig: source,
    };
  }

  // --- 1. PERSONAL INFO ---
  const pi = source.personalInfo || source.contact || source.header || source.basics || {};
  const fullName = pi.name
    ? (pi.lastName ? `${pi.name} ${pi.lastName}` : pi.name)
    : (pi.fullName || fallbackData?.personalInfo.fullName || "Your Name");

  const personalInfo: PersonalInfo = {
    fullName,
    professionalTitle: pi.designation || pi.title || pi.professionalTitle || pi.role || pi.tagline || fallbackData?.personalInfo.professionalTitle || "",
    email: pi.email || fallbackData?.personalInfo.email || "",
    phone: pi.phone || pi.mobile || pi.contact || fallbackData?.personalInfo.phone || "",
    address: pi.address || pi.location || fallbackData?.personalInfo.address || "",
    city: pi.city || (typeof pi.location === "string" ? pi.location.split(",")[0]?.trim() : "") || fallbackData?.personalInfo.city || "",
    country: pi.country || (typeof pi.location === "string" ? pi.location.split(",")[1]?.trim() : "") || fallbackData?.personalInfo.country || "",
    website: pi.website || pi.url || pi.portfolio || fallbackData?.personalInfo.website || "",
    linkedin: pi.linkedin || fallbackData?.personalInfo.linkedin || "",
    github: pi.github || fallbackData?.personalInfo.github || "",
    portfolio: pi.portfolio || fallbackData?.personalInfo.portfolio || "",
    profilePhoto: pi.profilePhoto || pi.photo || pi.avatar || fallbackData?.personalInfo.profilePhoto || "",
  };

  // --- 2. PROFESSIONAL SUMMARY / ABOUT ---
  let summary = "";
  let professionalSummaryTitle = "Professional Summary";
  if (typeof source.professionalSummary === "string") {
    summary = source.professionalSummary;
  } else if (source.professionalSummary && typeof source.professionalSummary === "object") {
    summary = source.professionalSummary.content || source.professionalSummary.summary || source.professionalSummary.text || "";
    professionalSummaryTitle = source.professionalSummary.title || professionalSummaryTitle;
  } else if (typeof source.summary === "string") {
    summary = source.summary;
  } else if (source.summary && typeof source.summary === "object") {
    summary = source.summary.content || source.summary.text || "";
  } else if (typeof source.about === "string") {
    summary = source.about;
  } else if (source.about && typeof source.about === "object") {
    summary = source.about.content || source.about.text || "";
  } else if (typeof source.bio === "string") {
    summary = source.bio;
  } else {
    summary = fallbackData?.summary || "";
  }

  // --- 3. EXPERIENCE & TIMELINE ---
  let rawExpList: any[] = [];
  let experienceTitle = "Work Experience";
  let timelineConfig: any = undefined;

  if (Array.isArray(source.experience)) {
    rawExpList = source.experience;
  } else if (source.experience && typeof source.experience === "object") {
    experienceTitle = source.experience.title || experienceTitle;
    timelineConfig = source.experience.timeline;
    if (Array.isArray(source.experience.items)) {
      rawExpList = source.experience.items;
    } else if (Array.isArray(source.experience.list)) {
      rawExpList = source.experience.list;
    }
  } else if (Array.isArray(source.work)) {
    rawExpList = source.work;
  } else if (Array.isArray(source.workExperience)) {
    rawExpList = source.workExperience;
  }

  const experience: ExperienceEntry[] = rawExpList.length > 0
    ? rawExpList.map((item: any, idx: number) => {
        let responsibilities: string[] = [];
        if (Array.isArray(item.responsibilities)) {
          responsibilities = item.responsibilities;
        } else if (Array.isArray(item.description)) {
          responsibilities = item.description;
        } else if (Array.isArray(item.highlights)) {
          responsibilities = item.highlights;
        } else if (typeof item.description === "string") {
          responsibilities = item.description.split("\n").filter(Boolean);
        } else if (typeof item.responsibilities === "string") {
          responsibilities = item.responsibilities.split("\n").filter(Boolean);
        }

        return {
          id: item.id || `exp-${idx + 1}`,
          company: item.company || item.companyName || item.organization || "Company",
          position: item.position || item.role || item.title || item.designation || "Role",
          location: item.location || item.city || "",
          startDate: item.startDate || item.startYear || item.from || "",
          endDate: item.endDate || item.endYear || item.to || "Present",
          isCurrentlyWorking: Boolean(item.isCurrentlyWorking || item.current || (item.endDate === "Present")),
          responsibilities,
          description: typeof item.description === "string" ? item.description : undefined,
        };
      })
    : fallbackData?.experience || [];

  // --- 4. PROJECTS ---
  let rawProjList: any[] = [];
  let projectsTitle = "Projects";

  if (Array.isArray(source.projects)) {
    rawProjList = source.projects;
  } else if (source.projects && typeof source.projects === "object") {
    projectsTitle = source.projects.title || projectsTitle;
    if (Array.isArray(source.projects.items)) {
      rawProjList = source.projects.items;
    } else if (Array.isArray(source.projects.list)) {
      rawProjList = source.projects.list;
    }
  } else if (Array.isArray(source.personalProjects)) {
    rawProjList = source.personalProjects;
  }

  const projects: ProjectEntry[] = rawProjList.length > 0
    ? rawProjList.map((item: any, idx: number) => {
        let tech: string[] = [];
        if (Array.isArray(item.technologies)) tech = item.technologies;
        else if (Array.isArray(item.techStack)) tech = item.techStack;
        else if (Array.isArray(item.tools)) tech = item.tools;
        else if (typeof item.technologies === "string") tech = item.technologies.split(",").map((s: string) => s.trim());
        else if (typeof item.techStack === "string") tech = item.techStack.split(",").map((s: string) => s.trim());

        let desc = "";
        if (typeof item.description === "string") desc = item.description;
        else if (Array.isArray(item.description)) desc = item.description.join(" ");

        return {
          id: item.id || `proj-${idx + 1}`,
          name: item.name || item.title || item.projectName || "Project",
          technologies: tech,
          description: desc,
          githubLink: item.link || item.githubLink || item.github || item.repo || item.url || "",
          liveDemo: item.liveDemo || item.liveUrl || item.demo || "",
          startDate: item.startDate || item.startYear || "",
          endDate: item.endDate || item.endYear || "",
        };
      })
    : fallbackData?.projects || [];

  // --- 5. EDUCATION ---
  let rawEduList: any[] = [];
  let educationTitle = "Education";

  if (Array.isArray(source.education)) {
    rawEduList = source.education;
  } else if (source.education && typeof source.education === "object") {
    educationTitle = source.education.title || educationTitle;
    if (Array.isArray(source.education.items)) {
      rawEduList = source.education.items;
    } else if (Array.isArray(source.education.list)) {
      rawEduList = source.education.list;
    }
  } else if (Array.isArray(source.academics)) {
    rawEduList = source.academics;
  }

  const education: EducationEntry[] = rawEduList.length > 0
    ? rawEduList.map((item: any, idx: number) => ({
        id: item.id || `edu-${idx + 1}`,
        institution: item.institution || item.college || item.university || item.school || "Institution",
        degree: item.degree || item.course || item.qualification || "Degree",
        branch: item.branch || item.major || item.field || "",
        grade: item.cgpa || item.grade || item.gpa || item.percentage || item.score || "",
        startDate: item.startDate || item.startYear || item.from || "",
        endDate: item.endDate || item.endYear || item.to || "",
        isCurrentlyStudying: Boolean(item.isCurrentlyStudying || item.current),
        description: item.description || "",
      }))
    : fallbackData?.education || [];

  // --- 6. SKILLS & PILL STYLING ---
  let skillsTitle = "Skills & Expertise";
  let pillStyle: any = undefined;
  let rawSkillsCategories: Record<string, string[]> = {};
  const skills: Skills = {};

  if (source.skills && typeof source.skills === "object") {
    skillsTitle = source.skills.title || skillsTitle;
    pillStyle = source.skills.pill;

    if (source.skills.categories && typeof source.skills.categories === "object") {
      rawSkillsCategories = source.skills.categories;
    } else if (Array.isArray(source.skills.items)) {
      rawSkillsCategories = { "Technical Skills": source.skills.items };
    } else if (Array.isArray(source.skills)) {
      if (typeof source.skills[0] === "string") {
        rawSkillsCategories = { "Skills": source.skills };
      } else {
        source.skills.forEach((s: any) => {
          const cat = s.category || "Other";
          rawSkillsCategories[cat] = Array.isArray(s.items) ? s.items : [String(s.name || s)];
        });
      }
    } else {
      // Direct object categories e.g. { frontend: [...], backend: [...] }
      Object.entries(source.skills).forEach(([k, v]) => {
        if (k !== "title" && k !== "pill" && Array.isArray(v)) {
          rawSkillsCategories[k] = v.map(String);
        }
      });
    }
  }

  // Populate standard Skills interface
  Object.entries(rawSkillsCategories).forEach(([key, list]) => {
    const k = key.toLowerCase();
    if (k.includes("front")) skills.frontend = list;
    else if (k.includes("back")) skills.backend = list;
    else if (k.includes("data") || k.includes("db")) skills.database = list;
    else if (k.includes("cloud") || k.includes("devops")) skills.cloud = list;
    else if (k.includes("lang") || k.includes("program")) skills.programming = list;
    else if (k.includes("soft")) skills.softSkills = list;
    else if (k.includes("tool")) skills.tools = list;
    else if (!skills.other) skills.other = list;
    else skills.other = [...skills.other, ...list];
  });

  // --- 7. ACHIEVEMENTS & CERTIFICATIONS (WITH BOTTOM SECTION COLUMNS: 2 SUPPORT) ---
  let bottomSectionConfig: any = undefined;
  let achievementsList: any[] = [];
  let certificationsList: any[] = [];

  const rawAchAndCerts = source.achievementsAndCertifications || source.bottomSection;
  if (rawAchAndCerts && typeof rawAchAndCerts === "object") {
    bottomSectionConfig = {
      title: rawAchAndCerts.title || "Achievements & Certifications",
      columns: rawAchAndCerts.bottomSection?.columns || rawAchAndCerts.columns || 2,
      achievements: rawAchAndCerts.achievements || [],
      certifications: rawAchAndCerts.certifications || [],
    };
    achievementsList = Array.isArray(rawAchAndCerts.achievements) ? rawAchAndCerts.achievements : [];
    certificationsList = Array.isArray(rawAchAndCerts.certifications) ? rawAchAndCerts.certifications : [];
  }

  if (achievementsList.length === 0 && Array.isArray(source.achievements)) {
    achievementsList = source.achievements;
  }
  if (certificationsList.length === 0 && (Array.isArray(source.certifications) || Array.isArray(source.certificates))) {
    certificationsList = source.certifications || source.certificates || [];
  }

  const achievements: AchievementEntry[] = achievementsList.map((item: any, idx: number) => {
    if (typeof item === "string") {
      return {
        id: `ach-${idx + 1}`,
        title: item,
        description: "",
      };
    }
    return {
      id: item.id || `ach-${idx + 1}`,
      title: item.title || item.name || "Achievement",
      description: item.description || "",
      date: item.date || item.year || "",
    };
  });

  const certifications: CertificationEntry[] = certificationsList.map((item: any, idx: number) => {
    if (typeof item === "string") {
      return {
        id: `cert-${idx + 1}`,
        name: item,
        organization: "",
        issueDate: "",
      };
    }
    return {
      id: item.id || `cert-${idx + 1}`,
      name: item.name || item.title || "Certification",
      organization: item.organization || item.issuer || "",
      issueDate: item.issueDate || item.date || item.year || "",
      credentialUrl: item.credentialUrl || item.url || "",
    };
  });

  return {
    rawConfig: source,
    personalInfo,
    summary,
    experience,
    education,
    projects,
    skills,
    achievements,
    certifications,
    languages: source.languages || fallbackData?.languages || [],
    interests: source.interests || fallbackData?.interests || [],
    volunteer: source.volunteer || fallbackData?.volunteer || [],
    publications: source.publications || fallbackData?.publications || [],
    references: source.references || fallbackData?.references || [],
    professionalSummaryConfig: {
      title: professionalSummaryTitle,
      content: summary,
    },
    experienceConfig: {
      title: experienceTitle,
      timeline: timelineConfig,
      items: experience,
    },
    skillsConfig: {
      title: skillsTitle,
      pill: pillStyle,
      categories: rawSkillsCategories,
      items: Object.values(rawSkillsCategories).flat(),
    },
    projectsConfig: {
      title: projectsTitle,
      items: projects,
    },
    educationConfig: {
      title: educationTitle,
      items: education,
    },
    bottomSectionConfig,
  };
}

function getEmptyResumeData(): ResumeData {
  return {
    personalInfo: {
      fullName: "",
      email: "",
    },
    summary: "",
    experience: [],
    education: [],
    projects: [],
    skills: {},
    achievements: [],
    certifications: [],
  };
}
