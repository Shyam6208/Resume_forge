import type { LanguageEntry, ResumeTheme } from "@/types/resume.types";

interface LanguagesSectionProps {
  languages?: LanguageEntry[];
  theme?: ResumeTheme;
}

const PROFICIENCY_MAP: Record<LanguageEntry["proficiency"], { label: string; dots: number }> = {
  beginner: { label: "Beginner", dots: 2 },
  intermediate: { label: "Intermediate", dots: 3 },
  advanced: { label: "Advanced / Fluent", dots: 4 },
  native: { label: "Native / Bilingual", dots: 5 },
};

export function LanguagesSection({ languages, theme }: LanguagesSectionProps) {
  if (!languages || languages.length === 0) return null;

  return (
    <div className="mb-4">
      <h2
        className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2.5"
        style={{
          color: theme?.primaryColor,
          borderColor: theme?.secondaryColor ? `${theme.secondaryColor}40` : undefined,
        }}
      >
        Languages
      </h2>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        {languages.map((lang) => {
          const { label, dots } = PROFICIENCY_MAP[lang.proficiency] || PROFICIENCY_MAP.intermediate;

          return (
            <div key={lang.id} className="text-xs flex items-center justify-between gap-2">
              <div>
                <span className="font-semibold text-slate-900" style={{ color: theme?.primaryColor }}>
                  {lang.name}
                </span>
                <span className="text-[10px] text-slate-500 block">{label}</span>
              </div>

              {/* Visual 5-dot proficiency indicator */}
              <div className="flex items-center gap-1 shrink-0">
                {[1, 2, 3, 4, 5].map((idx) => (
                  <div
                    key={idx}
                    className={`w-2 h-2 rounded-full ${
                      idx <= dots ? "bg-slate-800" : "bg-slate-200"
                    }`}
                    style={{
                      backgroundColor:
                        idx <= dots
                          ? theme?.primaryColor || "#1e293b"
                          : undefined,
                    }}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
