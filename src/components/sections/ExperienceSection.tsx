import type { ExperienceEntry, ResumeTheme } from "@/types/resume.types";
import { formatDateRange } from "@/utils/date-formatter";

interface ExperienceSectionProps {
  experience?: ExperienceEntry[];
  theme?: ResumeTheme;
}

export function ExperienceSection({ experience, theme }: ExperienceSectionProps) {
  if (!experience || experience.length === 0) return null;

  return (
    <div className="mb-4">
      <h2
        className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-3"
        style={{
          color: theme?.primaryColor,
          borderColor: theme?.secondaryColor ? `${theme.secondaryColor}40` : undefined,
        }}
      >
        Work Experience
      </h2>

      <div className="space-y-3">
        {experience.map((entry) => {
          const dateStr = formatDateRange(
            entry.startDate,
            entry.endDate,
            entry.isCurrentlyWorking
          );

          return (
            <div key={entry.id} className="text-xs">
              <div className="flex items-baseline justify-between gap-2">
                <div className="font-semibold text-slate-900" style={{ color: theme?.primaryColor }}>
                  {entry.position}
                </div>
                {dateStr && (
                  <div className="text-[11px] font-medium text-slate-500 shrink-0">
                    {dateStr}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-600 mb-1">
                <span className="font-medium" style={{ color: theme?.secondaryColor }}>
                  {entry.company}
                </span>
                {entry.location && <span className="text-slate-400">{entry.location}</span>}
              </div>

              {entry.description && (
                <p className="text-slate-600 text-[11px] mb-1 leading-relaxed">
                  {entry.description}
                </p>
              )}

              {entry.responsibilities && entry.responsibilities.length > 0 && (
                <ul className="space-y-0.5 mt-1 text-slate-700">
                  {entry.responsibilities.map((resp, i) => (
                    <li key={i} className="flex items-start gap-1.5 leading-relaxed">
                      <span className="text-slate-400 select-none">•</span>
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
