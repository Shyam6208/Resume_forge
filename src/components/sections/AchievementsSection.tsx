import type { AchievementEntry, ResumeTheme } from "@/types/resume.types";
import { formatDate } from "@/utils/date-formatter";

interface AchievementsSectionProps {
  achievements?: AchievementEntry[];
  theme?: ResumeTheme;
}

export function AchievementsSection({ achievements, theme }: AchievementsSectionProps) {
  if (!achievements || achievements.length === 0) return null;

  return (
    <div className="mb-4">
      <h2
        className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2.5"
        style={{
          color: theme?.primaryColor,
          borderColor: theme?.secondaryColor ? `${theme.secondaryColor}40` : undefined,
        }}
      >
        Key Achievements
      </h2>

      <div className="space-y-2">
        {achievements.map((item) => {
          const dateStr = formatDate(item.date);

          return (
            <div key={item.id} className="text-xs">
              <div className="flex items-baseline justify-between gap-2">
                <div className="font-semibold text-slate-900" style={{ color: theme?.primaryColor }}>
                  {item.title}
                </div>
                {dateStr && (
                  <div className="text-[11px] font-medium text-slate-500 shrink-0">
                    {dateStr}
                  </div>
                )}
              </div>

              {item.organization && (
                <div className="text-[11px] text-slate-600 font-medium" style={{ color: theme?.secondaryColor }}>
                  {item.organization}
                </div>
              )}

              {item.description && (
                <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">
                  {item.description}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
