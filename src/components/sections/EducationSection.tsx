import type { EducationEntry, ResumeTheme } from "@/types/resume.types";
import { formatDateRange } from "@/utils/date-formatter";

interface EducationSectionProps {
  education?: EducationEntry[];
  theme?: ResumeTheme;
}

export function EducationSection({ education, theme }: EducationSectionProps) {
  if (!education || education.length === 0) return null;

  return (
    <div className="mb-4">
      <h2
        className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-3"
        style={{
          color: theme?.primaryColor,
          borderColor: theme?.secondaryColor ? `${theme.secondaryColor}40` : undefined,
        }}
      >
        Education
      </h2>

      <div className="space-y-3">
        {education.map((entry) => {
          const dateStr = formatDateRange(
            entry.startDate,
            entry.endDate,
            entry.isCurrentlyStudying
          );

          const degreeBranch = [entry.degree, entry.branch]
            .filter(Boolean)
            .join(" in ");

          return (
            <div key={entry.id} className="text-xs">
              <div className="flex items-baseline justify-between gap-2">
                <div className="font-semibold text-slate-900" style={{ color: theme?.primaryColor }}>
                  {degreeBranch || entry.institution}
                </div>
                {dateStr && (
                  <div className="text-[11px] font-medium text-slate-500 shrink-0">
                    {dateStr}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-600">
                <span className="font-medium" style={{ color: theme?.secondaryColor }}>
                  {entry.institution}
                </span>
                {entry.grade && (
                  <span className="text-slate-500 font-medium">GPA/Grade: {entry.grade}</span>
                )}
              </div>

              {entry.description && (
                <p className="text-slate-600 text-[11px] mt-1 leading-relaxed">
                  {entry.description}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
