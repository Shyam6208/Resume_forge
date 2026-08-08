import type { ResumeTheme } from "@/types/resume.types";

interface InterestsSectionProps {
  interests?: string[];
  theme?: ResumeTheme;
}

export function InterestsSection({ interests, theme }: InterestsSectionProps) {
  if (!interests || interests.length === 0) return null;

  return (
    <div className="mb-4">
      <h2
        className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2"
        style={{
          color: theme?.primaryColor,
          borderColor: theme?.secondaryColor ? `${theme.secondaryColor}40` : undefined,
        }}
      >
        Interests & Hobbies
      </h2>

      <div className="flex flex-wrap items-center gap-1.5 mt-2">
        {interests.map((interest, i) => (
          <span
            key={i}
            className="inline-block px-2.5 py-1 text-[10px] font-medium bg-slate-100 text-slate-800 rounded-full border border-slate-200/80"
          >
            {interest}
          </span>
        ))}
      </div>
    </div>
  );
}
