import type { ResumeTheme } from "@/types/resume.types";

interface SummarySectionProps {
  summary?: string;
  theme?: ResumeTheme;
}

export function SummarySection({ summary, theme }: SummarySectionProps) {
  if (!summary || summary.trim().length < 10) return null;

  return (
    <div className="mb-4">
      <h2
        className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2"
        style={{
          color: theme?.primaryColor,
          borderColor: theme?.secondaryColor ? `${theme.secondaryColor}40` : undefined,
        }}
      >
        Professional Summary
      </h2>
      <p
        className="text-xs text-slate-700 leading-relaxed text-justify"
        style={{
          fontSize: theme?.fontSize ? `${theme.fontSize}px` : undefined,
          lineHeight: theme?.lineHeight ?? 1.5,
        }}
      >
        {summary}
      </p>
    </div>
  );
}
