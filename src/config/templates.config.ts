export interface TemplateConfig {
  id: string;
  name: string;
  slug: string;
  category: "Modern" | "Minimal" | "Fresher" | "Developer" | "Corporate";
  atsRating: number;
  tags: string[];
  description: string;
  previewImage?: string;
}

export const TEMPLATES: TemplateConfig[] = [
  {
    id: "minimal-white",
    name: "Minimalist White",
    slug: "minimal-white",
    category: "Minimal",
    atsRating: 95,
    tags: ["ATS Preferred", "Clean", "Simple", "Universal"],
    description:
      "Ultra-clean single column layout with generous white space and thin divider rules. 95% ATS rating — highest compatibility.",
  },
  {
    id: "corporate-pro",
    name: "Corporate Executive",
    slug: "corporate-pro",
    category: "Corporate",
    atsRating: 92,
    tags: ["Executive", "Management", "Finance", "Traditional"],
    description:
      "Classic conservative layout designed for corporate managers, executives, finance, and MBA roles.",
  },
  {
    id: "fresher-basic",
    name: "Fresher & Student",
    slug: "fresher-basic",
    category: "Fresher",
    atsRating: 90,
    tags: ["Student", "Graduate", "Education Focus", "Entry Level"],
    description:
      "Puts education and personal projects front and center. Zero penalty for missing work experience.",
  },
  {
    id: "dev-template",
    name: "Tech & Developer",
    slug: "dev-template",
    category: "Developer",
    atsRating: 85,
    tags: ["Developer", "GitHub", "Tech Stack", "Dark Header"],
    description:
      "Modern dark header band featuring GitHub links, project technology pills, and prominent skills breakdown.",
  },
  {
    id: "modern-pro",
    name: "Modern Sidebar",
    slug: "modern-pro",
    category: "Modern",
    atsRating: 82,
    tags: ["Two Column", "Sidebar", "Creative", "Photo Supported"],
    description:
      "Sleek two-column split layout with customizable colored sidebar for contact info, skills, and languages.",
  },
];
