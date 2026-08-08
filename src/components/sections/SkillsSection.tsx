import type { Skills, ResumeTheme } from "@/types/resume.types";

interface SkillsSectionProps {
  skills?: Skills;
  theme?: ResumeTheme;
}

const CATEGORY_LABELS: Record<keyof Skills, string> = {
  frontend: "Frontend",
  backend: "Backend",
  database: "Databases",
  cloud: "Cloud & DevOps",
  programming: "Languages",
  softSkills: "Soft Skills",
  tools: "Tools & Utilities",
  languages: "Spoken Languages",
  other: "Other Skills",
};

export function SkillsSection({ skills, theme }: SkillsSectionProps) {
  if (!skills) return null;

  const activeCategories = (Object.keys(skills) as Array<keyof Skills>).filter(
    (key) => skills[key] && skills[key]!.length > 0
  );

  if (activeCategories.length === 0) return null;

  return (
    <div className="mb-4">
      <h2
        className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2.5"
        style={{
          color: theme?.primaryColor,
          borderColor: theme?.secondaryColor ? `${theme.secondaryColor}40` : undefined,
        }}
      >
        Skills & Technical Proficiency
      </h2>

      <div className="space-y-2">
        {activeCategories.map((categoryKey) => {
          const list = skills[categoryKey]!;
          const label = CATEGORY_LABELS[categoryKey] || categoryKey;

          return (
            <div key={categoryKey} className="text-xs flex items-baseline gap-2">
              <span
                className="font-semibold text-slate-800 shrink-0 w-28 text-[11px]"
                style={{ color: theme?.secondaryColor }}
              >
                {label}:
              </span>
              <div className="flex flex-wrap items-center gap-1 flex-1">
                {list.map((skill, i) => (
                  <span
                    key={i}
                    className="inline-block px-2 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-800 rounded border border-slate-200/60"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
