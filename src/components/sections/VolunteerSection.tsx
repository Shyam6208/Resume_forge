import type { VolunteerEntry, ResumeTheme } from "@/types/resume.types";
import { formatDateRange } from "@/utils/date-formatter";

interface VolunteerSectionProps {
  volunteer?: VolunteerEntry[];
  theme?: ResumeTheme;
}

export function VolunteerSection({ volunteer, theme }: VolunteerSectionProps) {
  if (!volunteer || volunteer.length === 0) return null;

  return (
    <div className="mb-4">
      <h2
        className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-3"
        style={{
          color: theme?.primaryColor,
          borderColor: theme?.secondaryColor ? `${theme.secondaryColor}40` : undefined,
        }}
      >
        Volunteer Experience
      </h2>

      <div className="space-y-3">
        {volunteer.map((entry) => {
          const dateStr = formatDateRange(entry.startDate, entry.endDate);

          return (
            <div key={entry.id} className="text-xs">
              <div className="flex items-baseline justify-between gap-2">
                <div className="font-semibold text-slate-900" style={{ color: theme?.primaryColor }}>
                  {entry.role}
                </div>
                {dateStr && (
                  <div className="text-[11px] font-medium text-slate-500 shrink-0">
                    {dateStr}
                  </div>
                )}
              </div>

              <div className="text-[11px] font-medium text-slate-600 mb-1" style={{ color: theme?.secondaryColor }}>
                {entry.organization}
              </div>

              {entry.description && (
                <p className="text-slate-600 text-[11px] leading-relaxed">
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
