import {
  ResumeData,
  ExperienceEntry,
  EducationEntry,
  ProjectEntry,
} from "@/types/resume.types";
import { generateUUID } from "@/utils/uuid";

export type ConfidenceScore = "HIGH" | "MEDIUM" | "LOW";

export interface SectionConfidence {
  personalInfo: ConfidenceScore;
  summary: ConfidenceScore;
  experience: ConfidenceScore;
  education: ConfidenceScore;
  projects: ConfidenceScore;
  skills: ConfidenceScore;
  certifications: ConfidenceScore;
}

export interface ImportMetadata {
  confidence: SectionConfidence;
  warnings: string[];
  unmappedContent: string[];
}

export interface ParseResult {
  resumeData: ResumeData;
  metadata: ImportMetadata;
}

// Basic regex patterns
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const PHONE_REGEX = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
const URL_REGEX = /https?:\/\/[^\s]+/;
const LINKEDIN_REGEX = /linkedin\.com\/in\/[^\s]+/;
const GITHUB_REGEX = /github\.com\/[^\s]+/;

const BULLET_REGEX = /^[•◦▪▸▹●○→*+]\s+|^-\s+|^\d+[\.\)]\s+/;

const MONTHS = "jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|sept|september|oct|october|nov|november|dec|december";
const DATE_REGEX = new RegExp(`(?:(?:${MONTHS})\s+\d{4}|\d{2}/\d{4}|\b(?:19|20)\d{2}\b)`, "i");
const DATE_RANGE_SPLIT = /\s*(?:-|–|—|to)\s*/;
const CURRENT_KEYWORDS = /present|current|now/i;

function normalizeDate(raw: string): string {
  const yearMatch = raw.match(/\b((?:19|20)\d{2})\b/);
  if (!yearMatch) return raw.trim();
  const year = yearMatch[1];
  
  const monthMatch = raw.match(new RegExp(`(${MONTHS})`, "i"));
  if (monthMatch) {
    const m = monthMatch[1].toLowerCase();
    const map: Record<string, string> = { jan: "01", january: "01", feb: "02", february: "02", mar: "03", march: "03", apr: "04", april: "04", may: "05", jun: "06", june: "06", jul: "07", july: "07", aug: "08", august: "08", sep: "09", sept: "09", september: "09", oct: "10", october: "10", nov: "11", november: "11", dec: "12", december: "12" };
    const mapped = map[m] || "01";
    return `${year}-${mapped}`;
  }
  const numericMonthMatch = raw.match(/\b(\d{1,2})\/((?:19|20)\d{2})\b/);
  if (numericMonthMatch) {
    const m = numericMonthMatch[1].padStart(2, '0');
    return `${numericMonthMatch[2]}-${m}`;
  }
  return year;
}

const SKILL_ALIASES: Record<string, string> = {
  "reactjs": "React",
  "react.js": "React",
  "nodejs": "Node.js",
  "node.js": "Node.js",
  "js": "JavaScript",
  "ts": "TypeScript",
  "vuejs": "Vue",
  "vue.js": "Vue",
};

function normalizeSkill(skill: string): string {
  const s = skill.trim();
  const lower = s.toLowerCase();
  if (SKILL_ALIASES[lower]) return SKILL_ALIASES[lower];
  return s;
}

export function parseResumeTextDeterministically(text: string): ParseResult {
  const warnings: string[] = [];
  const unmappedContent: string[] = [];

  let safeText = text.replace(/\u0000/g, "");
  safeText = safeText.replace(/\t/g, "    ");

  const linesRaw = safeText.split("\n");
  let multiColumnHints = 0;
  for (const line of linesRaw) {
    if (line.match(/ {5,}/) && line.trim().length > 10) {
      multiColumnHints++;
    }
  }
  if (multiColumnHints > 3) {
    warnings.push("This resume may use a multi-column layout. Please review the imported content before saving.");
  }

  const lines = linesRaw.map(l => l.replace(/ {2,}/g, " ").trim()).filter(Boolean);

  const resumeData: ResumeData = {
    personalInfo: {
      fullName: "",
      email: "",
    },
    summary: "",
    experience: [],
    education: [],
    projects: [],
    skills: {
      other: [],
    },
    certifications: [],
  };

  const confidence: SectionConfidence = {
    personalInfo: "LOW",
    summary: "LOW",
    experience: "LOW",
    education: "LOW",
    projects: "LOW",
    skills: "LOW",
    certifications: "LOW",
  };

  if (!lines.length) {
    warnings.push("Extracted text is empty.");
    return { resumeData, metadata: { confidence, warnings, unmappedContent } };
  }

  const topLines = lines.slice(0, 15).join("\n");
  
  const emailMatch = topLines.match(EMAIL_REGEX);
  if (emailMatch) {
    resumeData.personalInfo.email = emailMatch[0];
    confidence.personalInfo = "MEDIUM";
  }
  
  const phoneMatch = topLines.match(PHONE_REGEX);
  if (phoneMatch) {
    resumeData.personalInfo.phone = phoneMatch[0].trim();
  }
  
  const linkedInMatch = topLines.match(LINKEDIN_REGEX);
  if (linkedInMatch) {
    let raw = linkedInMatch[0];
    if (raw.endsWith("/")) raw = raw.slice(0, -1);
    resumeData.personalInfo.linkedin = "https://" + raw;
  }

  const githubMatch = topLines.match(GITHUB_REGEX);
  if (githubMatch) {
    let raw = githubMatch[0];
    if (raw.endsWith("/")) raw = raw.slice(0, -1);
    resumeData.personalInfo.github = "https://" + raw;
  }

  let foundName = "";
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i];
    const stripped = line.replace(/Email:|Phone:|LinkedIn:|GitHub:|Website:/ig, "").trim();
    if (stripped.length > 3 && stripped.length < 40 && !EMAIL_REGEX.test(line) && !PHONE_REGEX.test(line) && !URL_REGEX.test(line)) {
      foundName = stripped;
      break;
    }
  }
  
  if (foundName) {
    resumeData.personalInfo.fullName = foundName;
    if (resumeData.personalInfo.email) {
      confidence.personalInfo = "HIGH";
    }
  }

  type SectionType = "SUMMARY" | "EXPERIENCE" | "EDUCATION" | "SKILLS" | "PROJECTS" | "CERTIFICATIONS" | "UNKNOWN";
  
  const sections = new Map<SectionType, string[]>();
  let currentSection: SectionType = "UNKNOWN";
  const currentChunk: string[] = [];

  const getSectionType = (line: string): SectionType | null => {
    const upper = line.toUpperCase().replace(/[^A-Z\s]/g, "").trim();
    if (upper.length > 30 || upper.length < 3) return null;

    if (/^(SUMMARY|PROFESSIONAL SUMMARY|PROFILE|CAREER SUMMARY|OBJECTIVE|PROFESSIONAL PROFILE|ABOUT ME)$/.test(upper)) return "SUMMARY";
    if (/^(EXPERIENCE|WORK EXPERIENCE|PROFESSIONAL EXPERIENCE|EMPLOYMENT|EMPLOYMENT HISTORY|WORK HISTORY)$/.test(upper)) return "EXPERIENCE";
    if (/^(EDUCATION|ACADEMIC BACKGROUND|EDUCATIONAL QUALIFICATIONS)$/.test(upper)) return "EDUCATION";
    if (/^(SKILLS|TECHNICAL SKILLS|CORE SKILLS|TECHNOLOGIES|TECHNICAL PROFICIENCIES|CORE COMPETENCIES)$/.test(upper)) return "SKILLS";
    if (/^(PROJECTS|PERSONAL PROJECTS|ACADEMIC PROJECTS|KEY PROJECTS)$/.test(upper)) return "PROJECTS";
    if (/^(CERTIFICATIONS|CERTIFICATES|LICENSES CERTIFICATIONS)$/.test(upper)) return "CERTIFICATIONS";

    return null;
  };

  lines.forEach((line) => {
    const identifiedSection = getSectionType(line);
    if (identifiedSection) {
      if (currentChunk.length > 0) {
        if (!sections.has(currentSection)) sections.set(currentSection, []);
        sections.get(currentSection)!.push(...currentChunk);
        currentChunk.length = 0;
      }
      currentSection = identifiedSection;
    } else {
      currentChunk.push(line);
    }
  });
  
  if (currentChunk.length > 0) {
    if (!sections.has(currentSection)) sections.set(currentSection, []);
    sections.get(currentSection)!.push(...currentChunk);
  }

  if (sections.has("UNKNOWN")) {
    const unknownLines = sections.get("UNKNOWN")!;
    const remainingUnknown: string[] = [];
    let isSummary = false;
    for (const line of unknownLines) {
      if (!isSummary && line.length > 80) {
        isSummary = true;
      }
      const isContactLine = resumeData.personalInfo.fullName.includes(line) || line.match(EMAIL_REGEX) || line.match(PHONE_REGEX) || /Email:|Phone:|LinkedIn:|GitHub:/i.test(line);
      
      if (isSummary) {
        resumeData.summary = (resumeData.summary ? resumeData.summary + " " : "") + line;
        confidence.summary = "MEDIUM";
      } else if (!isContactLine) {
         remainingUnknown.push(line);
      }
    }
    if (remainingUnknown.length > 0) {
       unmappedContent.push(...remainingUnknown);
    }
  }

  if (sections.has("SUMMARY")) {
    resumeData.summary = sections.get("SUMMARY")!.join(" ");
    confidence.summary = "HIGH";
  }
  
  let dateWarningAdded = false;

  const extractDateRange = (line: string) => {
    const hasDate = DATE_REGEX.test(line);
    if (!hasDate) return null;
    
    const parts = line.split(DATE_RANGE_SPLIT);
    if (parts.length >= 2) {
       const sRaw = parts[0];
       const eRaw = parts[1];
       const start = normalizeDate(sRaw);
       let isCur = false;
       let end = undefined;
       
       if (CURRENT_KEYWORDS.test(eRaw)) {
          isCur = true;
       } else {
          end = normalizeDate(eRaw);
       }
       return { start, end, isCur };
    }
    
    return { start: normalizeDate(line), end: undefined, isCur: false };
  }

  if (sections.has("EXPERIENCE")) {
    const expLines = sections.get("EXPERIENCE")!;
    if (expLines.length > 0) confidence.experience = "LOW"; 
    
    let currentExp: Partial<ExperienceEntry> | null = null;
    
    expLines.forEach(line => {
      const isBullet = BULLET_REGEX.test(line);
      if (isBullet) {
        if (!currentExp) {
          currentExp = { id: generateUUID(), company: "Unknown Company", position: "Unknown Role", responsibilities: [] };
          resumeData.experience!.push(currentExp as ExperienceEntry);
        }
        const cleanedBullet = line.replace(BULLET_REGEX, "").trim();
        if (cleanedBullet) currentExp.responsibilities!.push(cleanedBullet);
      } else {
        if (line.length > 80 && currentExp && currentExp.responsibilities) {
           currentExp.responsibilities.push(line);
        } else {
           const dateMatch = extractDateRange(line);
           if (dateMatch) {
              if (currentExp && !currentExp.startDate && currentExp.startDate !== dateMatch.start) {
                  currentExp.startDate = dateMatch.start;
                  if (dateMatch.end) currentExp.endDate = dateMatch.end;
                  if (dateMatch.isCur) currentExp.isCurrentlyWorking = true;
              } else {
                  currentExp = { id: generateUUID(), company: "Unknown Company", position: "Unknown Role", responsibilities: [], startDate: dateMatch.start, endDate: dateMatch.end, isCurrentlyWorking: dateMatch.isCur };
                  resumeData.experience!.push(currentExp as ExperienceEntry);
              }
           } else {
              if (currentExp && !currentExp.position && currentExp.company === "Unknown Company") {
                 currentExp.company = line;
              } else if (currentExp && currentExp.position === "Unknown Role") {
                 currentExp.position = line;
              } else {
                 currentExp = { id: generateUUID(), company: line, position: "Unknown Role", responsibilities: [], isCurrentlyWorking: false, startDate: "" };
                 resumeData.experience!.push(currentExp as ExperienceEntry);
              }
           }
        }
      }
    });
    
    const expMap = new Map<string, ExperienceEntry>();
    const newExps: ExperienceEntry[] = [];
    resumeData.experience!.forEach(exp => {
      const key = `${exp.company}|${exp.position}|${exp.startDate}|${exp.endDate}`;
      if (!expMap.has(key)) {
         expMap.set(key, exp);
         newExps.push(exp);
      }
    });
    resumeData.experience = newExps;
  }

  if (sections.has("EDUCATION")) {
     const eduLines = sections.get("EDUCATION")!;
     if (eduLines.length > 0) confidence.education = "LOW"; 
     
     let currentEdu: Partial<EducationEntry> | null = null;
     eduLines.forEach(line => {
       if (line.length < 60 && !BULLET_REGEX.test(line)) {
          const dateMatch = extractDateRange(line);
          if (dateMatch) {
             if (currentEdu) {
                 currentEdu.startDate = dateMatch.start;
                 if (dateMatch.end) currentEdu.endDate = dateMatch.end;
                 if (dateMatch.isCur) currentEdu.isCurrentlyStudying = true;
             }
          } else {
             if (currentEdu && !currentEdu.degree) {
                 currentEdu.degree = line;
             } else {
                 currentEdu = { id: generateUUID(), institution: line, degree: "Unknown Degree", startDate: "", isCurrentlyStudying: false };
                 resumeData.education!.push(currentEdu as EducationEntry);
             }
          }
       } else if (currentEdu && !BULLET_REGEX.test(line)) {
          currentEdu.degree = currentEdu.degree === "Unknown Degree" ? line : currentEdu.degree + " " + line;
       }
     });
  }

  if (sections.has("SKILLS")) {
    const skillLines = sections.get("SKILLS")!;
    if (skillLines.length > 0) {
      const rawSkills = skillLines.flatMap(l => l.split(/[,|]/)).map(s => s.trim()).filter(Boolean);
      const skillSet = new Set<string>();
      rawSkills.forEach(s => skillSet.add(normalizeSkill(s)));
      resumeData.skills!.other = Array.from(skillSet);
      confidence.skills = "MEDIUM";
    }
  }

  if (sections.has("PROJECTS")) {
     const projLines = sections.get("PROJECTS")!;
     if (projLines.length > 0) confidence.projects = "LOW";
     
     let currentProj: Partial<ProjectEntry> | null = null;
     projLines.forEach(line => {
       const isBullet = BULLET_REGEX.test(line);
       if (isBullet) {
         if (!currentProj) {
           currentProj = { id: generateUUID(), name: "Unknown Project", description: "", technologies: [] };
           resumeData.projects!.push(currentProj as ProjectEntry);
         }
         const cleanedBullet = line.replace(BULLET_REGEX, "").trim();
         if (cleanedBullet) {
            currentProj.description = currentProj.description ? currentProj.description + "\n" + cleanedBullet : cleanedBullet;
         }
       } else {
         if (line.length > 80 && currentProj) {
            currentProj.description = currentProj.description ? currentProj.description + " " + line : line;
         } else {
            currentProj = { id: generateUUID(), name: line, description: "", technologies: [] };
            resumeData.projects!.push(currentProj as ProjectEntry);
         }
       }
     });
     
     const projMap = new Map<string, ProjectEntry>();
     const newProjs: ProjectEntry[] = [];
     resumeData.projects!.forEach(proj => {
       const key = `${proj.name}|${proj.description}`;
       if (!projMap.has(key)) {
          projMap.set(key, proj);
          newProjs.push(proj);
       }
     });
     resumeData.projects = newProjs;
  }

  const hasExpMissingDates = resumeData.experience!.some(e => !e.startDate && e.company !== "Unknown Company");
  if (hasExpMissingDates && !dateWarningAdded) {
     warnings.push("Some dates could not be confidently normalized.");
  }

  return {
    resumeData,
    metadata: {
      confidence,
      warnings,
      unmappedContent
    }
  };
}
