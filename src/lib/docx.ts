import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  BorderStyle,
  AlignmentType,
} from "docx";
import type { ResumeData, ResumeTheme } from "@/types/resume.types";
import { isSectionEmpty } from "@/utils/section-checker";

function hexToDocxColor(hex: string): string {
  if (!hex) return "1E293B";
  return hex.replace("#", "").toUpperCase();
}

function createSectionHeading(title: string, colorHex: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text: title.toUpperCase(),
        bold: true,
        size: 22,
        color: colorHex,
      }),
    ],
    spacing: { before: 280, after: 120 },
    border: {
      bottom: {
        color: colorHex,
        space: 4,
        style: BorderStyle.SINGLE,
        size: 6,
      },
    },
  });
}

export async function generateDOCX(
  data: ResumeData,
  theme: ResumeTheme
): Promise<Buffer> {
  const primaryColorHex = hexToDocxColor(theme?.primaryColor || "#1e293b");

  const children: Paragraph[] = [];

  // ==========================================================
  // 1. Personal Information
  // ==========================================================
  if (data.personalInfo) {
    const p = data.personalInfo;

    // Name
    children.push(
      new Paragraph({
        alignment: AlignmentType.LEFT,
        children: [
          new TextRun({
            text: p.fullName || "Your Name",
            bold: true,
            size: 32,
            color: primaryColorHex,
          }),
        ],
        spacing: { after: 60 },
      })
    );

    // Title
    if (p.professionalTitle) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: p.professionalTitle,
              size: 24,
              color: "475569",
              italics: true,
            }),
          ],
          spacing: { after: 120 },
        })
      );
    }

    // Contact info row
    const contactParts: string[] = [];
    if (p.email) contactParts.push(p.email);
    if (p.phone) contactParts.push(p.phone);
    if (p.city || p.address) {
      contactParts.push([p.address, p.city, p.country].filter(Boolean).join(", "));
    }
    if (p.linkedin) contactParts.push(p.linkedin);
    if (p.github) contactParts.push(p.github);
    if (p.website) contactParts.push(p.website);

    if (contactParts.length > 0) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: contactParts.join("   |   "),
              size: 18,
              color: "64748B",
            }),
          ],
          spacing: { after: 240 },
        })
      );
    }
  }

  // ==========================================================
  // 2. Professional Summary
  // ==========================================================
  if (!isSectionEmpty.summary(data) && data.summary) {
    children.push(createSectionHeading("Professional Summary", primaryColorHex));
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: data.summary,
            size: 20,
          }),
        ],
        spacing: { after: 160 },
      })
    );
  }

  // ==========================================================
  // 3. Work Experience
  // ==========================================================
  if (!isSectionEmpty.experience(data) && data.experience) {
    children.push(createSectionHeading("Work Experience", primaryColorHex));
    for (const exp of data.experience) {
      const dateStr = [exp.startDate, exp.isCurrentlyWorking ? "Present" : exp.endDate]
        .filter(Boolean)
        .join(" - ");

      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: exp.position || "Position",
              bold: true,
              size: 20,
            }),
            new TextRun({
              text: exp.company ? `  at ${exp.company}` : "",
              bold: true,
              size: 20,
              color: "334155",
            }),
            new TextRun({
              text: dateStr ? `   (${dateStr})` : "",
              italics: true,
              size: 18,
              color: "64748B",
            }),
          ],
          spacing: { before: 120, after: 40 },
        })
      );

      if (exp.description) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: exp.description, size: 19 })],
            spacing: { after: 40 },
          })
        );
      }

      if (exp.responsibilities && exp.responsibilities.length > 0) {
        for (const resp of exp.responsibilities) {
          children.push(
            new Paragraph({
              text: resp,
              bullet: { level: 0 },
              spacing: { after: 40 },
            })
          );
        }
      }
    }
  }

  // ==========================================================
  // 4. Education
  // ==========================================================
  if (!isSectionEmpty.education(data) && data.education) {
    children.push(createSectionHeading("Education", primaryColorHex));
    for (const edu of data.education) {
      const dateStr = [edu.startDate, edu.isCurrentlyStudying ? "Present" : edu.endDate]
        .filter(Boolean)
        .join(" - ");

      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: edu.degree || "Degree",
              bold: true,
              size: 20,
            }),
            new TextRun({
              text: edu.institution ? ` — ${edu.institution}` : "",
              size: 20,
              color: "334155",
            }),
            new TextRun({
              text: dateStr ? `   (${dateStr})` : "",
              italics: true,
              size: 18,
              color: "64748B",
            }),
          ],
          spacing: { before: 120, after: 40 },
        })
      );

      if (edu.grade) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: `Grade: ${edu.grade}`, italics: true, size: 18 })],
            spacing: { after: 40 },
          })
        );
      }
    }
  }

  // ==========================================================
  // 5. Projects
  // ==========================================================
  if (!isSectionEmpty.projects(data) && data.projects) {
    children.push(createSectionHeading("Projects", primaryColorHex));
    for (const proj of data.projects) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: proj.name,
              bold: true,
              size: 20,
            }),
            proj.technologies && proj.technologies.length > 0
              ? new TextRun({
                  text: ` [${proj.technologies.join(", ")}]`,
                  italics: true,
                  size: 18,
                  color: "475569",
                })
              : new TextRun({ text: "" }),
          ],
          spacing: { before: 120, after: 40 },
        })
      );

      if (proj.description) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: proj.description, size: 19 })],
            spacing: { after: 40 },
          })
        );
      }

      if (proj.githubLink || proj.liveDemo) {
        const links = [proj.githubLink, proj.liveDemo].filter(Boolean).join(" | ");
        children.push(
          new Paragraph({
            children: [new TextRun({ text: `Links: ${links}`, size: 18, color: "2563EB" })],
            spacing: { after: 60 },
          })
        );
      }
    }
  }

  // ==========================================================
  // 6. Skills
  // ==========================================================
  if (!isSectionEmpty.skills(data) && data.skills) {
    children.push(createSectionHeading("Skills & Expertise", primaryColorHex));
    for (const [categoryKey, skillsArr] of Object.entries(data.skills)) {
      if (skillsArr && skillsArr.length > 0) {
        const label = categoryKey
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase());

        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: `${label}: `, bold: true, size: 19, color: "1E293B" }),
              new TextRun({ text: skillsArr.join(", "), size: 19 }),
            ],
            spacing: { after: 60 },
          })
        );
      }
    }
  }

  // ==========================================================
  // 7. Certifications
  // ==========================================================
  if (!isSectionEmpty.certifications(data) && data.certifications) {
    children.push(createSectionHeading("Certifications", primaryColorHex));
    for (const cert of data.certifications) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: cert.name, bold: true, size: 19 }),
            new TextRun({
              text: cert.organization ? ` — ${cert.organization}` : "",
              size: 19,
              color: "475569",
            }),
            new TextRun({
              text: cert.issueDate ? ` (${cert.issueDate})` : "",
              italics: true,
              size: 18,
              color: "64748B",
            }),
          ],
          spacing: { after: 60 },
        })
      );
    }
  }

  // Create Document object
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720,
              bottom: 720,
              left: 720,
              right: 720,
            },
          },
        },
        children,
      },
    ],
  });

  return await Packer.toBuffer(doc);
}
