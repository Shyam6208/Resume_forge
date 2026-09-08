// ============================================================
// ResumeForge — Complete Resume Type System
// ============================================================

// --- Personal Info ---
export interface PersonalInfo {
  fullName: string;
  professionalTitle?: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  website?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  dateOfBirth?: string;
  nationality?: string;
  profilePhoto?: string;
}

// --- Experience ---
export interface ExperienceEntry {
  id: string;
  company: string;
  position: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isCurrentlyWorking: boolean;
  responsibilities: string[];
  description?: string;
}

// --- Education ---
export interface EducationEntry {
  id: string;
  institution: string;
  degree: string;
  branch?: string;
  grade?: string;
  startDate: string;
  endDate?: string;
  isCurrentlyStudying: boolean;
  description?: string;
}

// --- Projects ---
export interface ProjectEntry {
  id: string;
  name: string;
  technologies: string[];
  description: string;
  githubLink?: string;
  liveDemo?: string;
  startDate?: string;
  endDate?: string;
  highlights?: string[];
}

// --- Skills ---
export interface Skills {
  frontend?: string[];
  backend?: string[];
  database?: string[];
  cloud?: string[];
  programming?: string[];
  softSkills?: string[];
  tools?: string[];
  languages?: string[];
  other?: string[];
}

// --- Certifications ---
export interface CertificationEntry {
  id: string;
  name: string;
  organization: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
}

// --- Achievements ---
export interface AchievementEntry {
  id: string;
  title: string;
  description?: string;
  date?: string;
  organization?: string;
}

// --- Languages ---
export type LanguageProficiency =
  | "beginner"
  | "intermediate"
  | "advanced"
  | "native";

export interface LanguageEntry {
  id: string;
  name: string;
  proficiency: LanguageProficiency;
}

// --- Volunteer ---
export interface VolunteerEntry {
  id: string;
  organization: string;
  role: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

// --- Publications ---
export interface PublicationEntry {
  id: string;
  title: string;
  publisher?: string;
  date?: string;
  url?: string;
  description?: string;
}

// --- References ---
export interface ReferenceEntry {
  id: string;
  name: string;
  position?: string;
  company?: string;
  email?: string;
  phone?: string;
}

// ============================================================
// Resume Data (JSONB stored in Supabase)
// ============================================================

export interface ResumeData {
  personalInfo: PersonalInfo; // ← only required field
  summary?: string;
  experience?: ExperienceEntry[];
  education?: EducationEntry[];
  projects?: ProjectEntry[];
  skills?: Skills;
  certifications?: CertificationEntry[];
  achievements?: AchievementEntry[];
  languages?: LanguageEntry[];
  interests?: string[];
  volunteer?: VolunteerEntry[];
  publications?: PublicationEntry[];
  references?: ReferenceEntry[];
}

// ============================================================
// Resume Theme (JSONB stored in Supabase)
// ============================================================

export type PageMargins = "narrow" | "normal" | "wide";
export type DividerStyle = "solid" | "dashed" | "none";

export interface ResumeTheme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  fontSize: number;
  headingSize: number;
  lineHeight: number;
  sectionSpacing: number;
  pageMargins: PageMargins;
  borderRadius: number;
  dividerStyle: DividerStyle;
  showPhoto: boolean;
  showIcons: boolean;
}

// ============================================================
// Section Keys & User Types
// ============================================================

export type SectionKey =
  | "personalInfo"
  | "summary"
  | "experience"
  | "education"
  | "projects"
  | "skills"
  | "certifications"
  | "achievements"
  | "languages"
  | "interests"
  | "volunteer"
  | "publications"
  | "references";

export type UserType =
  | "student"
  | "fresher"
  | "developer"
  | "designer"
  | "teacher"
  | "manager"
  | "experienced"
  | "freelancer"
  | "other";

// ============================================================
// Full Resume Object
// ============================================================

export interface Resume {
  id: string;
  userId: string;
  title: string;
  slug: string;
  templateId: string;
  data: ResumeData;
  theme: ResumeTheme;
  sectionOrder: SectionKey[];
  isPublic: boolean;
  targetJob?: string;
  downloadCount: number;
  createdAt: string;
  updatedAt: string;
  isTemporary?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  templateConfig?: any | null;
}

// ============================================================
// Default Constants
// ============================================================

export const DEFAULT_THEME: ResumeTheme = {
  primaryColor: "#1e293b",
  secondaryColor: "#475569",
  accentColor: "#3b82f6",
  fontFamily: "Inter",
  fontSize: 14,
  headingSize: 18,
  lineHeight: 1.5,
  sectionSpacing: 16,
  pageMargins: "normal",
  borderRadius: 4,
  dividerStyle: "solid",
  showPhoto: false,
  showIcons: true,
};

export const DEFAULT_SECTION_ORDER: SectionKey[] = [
  "personalInfo",
  "summary",
  "experience",
  "education",
  "projects",
  "skills",
  "certifications",
  "achievements",
  "languages",
  "interests",
  "volunteer",
  "publications",
  "references",
];
