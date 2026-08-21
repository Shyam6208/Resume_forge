import type { ResumeData, SectionKey, Skills } from "@/types/resume.types";

const SKILL_CATEGORY_LABELS: Record<keyof Skills, string> = {
  programming: "Programming Languages",
  frontend: "Frontend",
  backend: "Backend",
  database: "Databases",
  cloud: "Cloud & DevOps",
  tools: "Tools & Technologies",
  languages: "Languages",
  softSkills: "Soft Skills",
  other: "Other",
};

/**
 * Converts structured ResumeData into a beautifully formatted plain-text (ASCII/Markdown) resume.
 * Ideal for pasting into applicant tracking systems (Taleo, Workday, Greenhouse) or plain text forms.
 */
export function generatePlainTextResume(
  data: ResumeData,
  sectionOrder: SectionKey[] = []
): string {
  const lines: string[] = [];

  const addDivider = (char = "=", len = 60) => {
    lines.push(char.repeat(len));
  };

  // --- Header / Personal Info ---
  if (data.personalInfo) {
    const p = data.personalInfo;
    if (p.fullName) lines.push(p.fullName.toUpperCase());
    if (p.professionalTitle) lines.push(p.professionalTitle);

    const contactParts: string[] = [];
    if (p.email) contactParts.push(`Email: ${p.email}`);
    if (p.phone) contactParts.push(`Phone: ${p.phone}`);
    if (p.city || p.country) {
      contactParts.push(`Location: ${[p.city, p.country].filter(Boolean).join(", ")}`);
    }
    if (contactParts.length > 0) lines.push(contactParts.join(" | "));

    const linkParts: string[] = [];
    if (p.linkedin) linkParts.push(`LinkedIn: ${p.linkedin}`);
    if (p.github) linkParts.push(`GitHub: ${p.github}`);
    if (p.website || p.portfolio) linkParts.push(`Portfolio: ${p.website || p.portfolio}`);
    if (linkParts.length > 0) lines.push(linkParts.join(" | "));

    lines.push("");
  }

  // Helper to render sections
  const renderSection = (key: SectionKey) => {
    switch (key) {
      case "summary":
        if (data.summary?.trim()) {
          addDivider();
          lines.push("PROFESSIONAL SUMMARY");
          addDivider();
          lines.push(data.summary.trim());
          lines.push("");
        }
        break;

      case "experience":
        if (data.experience && data.experience.length > 0) {
          addDivider();
          lines.push("WORK EXPERIENCE");
          addDivider();
          data.experience.forEach((exp) => {
            const dateRange = `${exp.startDate} - ${exp.isCurrentlyWorking ? "Present" : exp.endDate || "Present"}`;
            const loc = exp.location ? ` | ${exp.location}` : "";
            lines.push(`${exp.position.toUpperCase()} at ${exp.company}${loc}`);
            lines.push(`Period: ${dateRange}`);
            if (exp.description) {
              lines.push(exp.description);
            }
            if (exp.responsibilities && exp.responsibilities.length > 0) {
              exp.responsibilities.forEach((r) => {
                if (r.trim()) lines.push(`  • ${r.trim()}`);
              });
            }
            lines.push("");
          });
        }
        break;

      case "education":
        if (data.education && data.education.length > 0) {
          addDivider();
          lines.push("EDUCATION");
          addDivider();
          data.education.forEach((edu) => {
            const dateRange = `${edu.startDate} - ${edu.isCurrentlyStudying ? "Present" : edu.endDate || "Present"}`;
            const branch = edu.branch ? ` in ${edu.branch}` : "";
            const grade = edu.grade ? ` (GPA/Grade: ${edu.grade})` : "";
            lines.push(`${edu.degree}${branch} — ${edu.institution}`);
            lines.push(`Period: ${dateRange}${grade}`);
            if (edu.description) {
              lines.push(edu.description);
            }
            lines.push("");
          });
        }
        break;

      case "projects":
        if (data.projects && data.projects.length > 0) {
          addDivider();
          lines.push("PROJECTS");
          addDivider();
          data.projects.forEach((proj) => {
            const links = [proj.liveDemo && `Live: ${proj.liveDemo}`, proj.githubLink && `GitHub: ${proj.githubLink}`]
              .filter(Boolean)
              .join(" | ");
            lines.push(proj.name.toUpperCase());
            if (proj.technologies && proj.technologies.length > 0) {
              lines.push(`Tech Stack: ${proj.technologies.join(", ")}`);
            }
            if (links) lines.push(links);
            if (proj.description) lines.push(proj.description);
            if (proj.highlights && proj.highlights.length > 0) {
              proj.highlights.forEach((h) => {
                if (h.trim()) lines.push(`  • ${h.trim()}`);
              });
            }
            lines.push("");
          });
        }
        break;

      case "skills":
        if (data.skills) {
          const categories = Object.keys(data.skills) as (keyof Skills)[];
          const hasSkills = categories.some((k) => (data.skills?.[k]?.length ?? 0) > 0);

          if (hasSkills) {
            addDivider();
            lines.push("TECHNICAL & PROFESSIONAL SKILLS");
            addDivider();
            categories.forEach((catKey) => {
              const items = data.skills?.[catKey];
              if (items && items.length > 0) {
                const label = SKILL_CATEGORY_LABELS[catKey] || catKey;
                lines.push(`${label}: ${items.join(", ")}`);
              }
            });
            lines.push("");
          }
        }
        break;

      case "certifications":
        if (data.certifications && data.certifications.length > 0) {
          addDivider();
          lines.push("CERTIFICATIONS");
          addDivider();
          data.certifications.forEach((c) => {
            const dateStr = c.issueDate ? ` (${c.issueDate})` : "";
            lines.push(`• ${c.name} — ${c.organization}${dateStr}`);
            if (c.credentialUrl) lines.push(`  Credential URL: ${c.credentialUrl}`);
          });
          lines.push("");
        }
        break;

      case "achievements":
        if (data.achievements && data.achievements.length > 0) {
          addDivider();
          lines.push("ACHIEVEMENTS & AWARDS");
          addDivider();
          data.achievements.forEach((a) => {
            const org = a.organization ? ` (${a.organization})` : "";
            const date = a.date ? ` [${a.date}]` : "";
            lines.push(`• ${a.title}${org}${date}`);
            if (a.description) lines.push(`  ${a.description}`);
          });
          lines.push("");
        }
        break;

      case "languages":
        if (data.languages && data.languages.length > 0) {
          addDivider();
          lines.push("LANGUAGES");
          addDivider();
          const langStr = data.languages
            .map((l) => `${l.name} (${l.proficiency})`)
            .join(", ");
          lines.push(langStr);
          lines.push("");
        }
        break;

      case "volunteer":
        if (data.volunteer && data.volunteer.length > 0) {
          addDivider();
          lines.push("VOLUNTEER & LEADERSHIP");
          addDivider();
          data.volunteer.forEach((v) => {
            lines.push(`${v.role} at ${v.organization} (${v.startDate || ""} - ${v.endDate || "Present"})`);
            if (v.description) lines.push(v.description);
            lines.push("");
          });
        }
        break;

      case "publications":
        if (data.publications && data.publications.length > 0) {
          addDivider();
          lines.push("PUBLICATIONS & ARTICLES");
          addDivider();
          data.publications.forEach((pub) => {
            const date = pub.date ? ` (${pub.date})` : "";
            const publisher = pub.publisher ? ` — ${pub.publisher}` : "";
            lines.push(`• "${pub.title}"${publisher}${date}`);
            if (pub.url) lines.push(`  Link: ${pub.url}`);
          });
          lines.push("");
        }
        break;

      case "interests":
        if (data.interests && data.interests.length > 0) {
          addDivider();
          lines.push("INTERESTS");
          addDivider();
          lines.push(data.interests.join(", "));
          lines.push("");
        }
        break;

      case "references":
        if (data.references && data.references.length > 0) {
          addDivider();
          lines.push("REFERENCES");
          addDivider();
          data.references.forEach((ref) => {
            lines.push(`${ref.name} — ${ref.position || ""} at ${ref.company || ""}`);
            if (ref.email) lines.push(`  Email: ${ref.email}`);
            if (ref.phone) lines.push(`  Phone: ${ref.phone}`);
            lines.push("");
          });
        }
        break;
    }
  };

  const keysToRender = sectionOrder.length > 0
    ? sectionOrder
    : (["summary", "experience", "education", "projects", "skills", "certifications", "achievements", "languages"] as SectionKey[]);

  keysToRender.forEach((key) => renderSection(key));

  return lines.join("\n").trim();
}

/**
 * Initiates a browser client-side download of the plain-text resume
 */
export function downloadPlainTextResume(
  data: ResumeData,
  title: string = "Resume",
  sectionOrder: SectionKey[] = []
) {
  const textContent = generatePlainTextResume(data, sectionOrder);
  const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  const sanitizedTitle = (title || "Resume").replace(/[^a-zA-Z0-9_-]/g, "_");
  anchor.href = url;
  anchor.download = `${sanitizedTitle}.txt`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
