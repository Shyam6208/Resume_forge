import type { PublicationEntry, ResumeTheme } from "@/types/resume.types";
import { formatDate } from "@/utils/date-formatter";
import { ExternalLink } from "lucide-react";

interface PublicationsSectionProps {
  publications?: PublicationEntry[];
  theme?: ResumeTheme;
}

export function PublicationsSection({ publications, theme }: PublicationsSectionProps) {
  if (!publications || publications.length === 0) return null;

  return (
    <div className="mb-4">
      <h2
        className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2.5"
        style={{
          color: theme?.primaryColor,
          borderColor: theme?.secondaryColor ? `${theme.secondaryColor}40` : undefined,
        }}
      >
        Publications
      </h2>

      <div className="space-y-2.5">
        {publications.map((pub) => {
          const dateStr = formatDate(pub.date);

          return (
            <div key={pub.id} className="text-xs">
              <div className="flex items-baseline justify-between gap-2">
                <div className="flex items-center gap-1.5 font-semibold text-slate-900" style={{ color: theme?.primaryColor }}>
                  <span>{pub.title}</span>
                  {pub.url && (
                    <a
                      href={pub.url.startsWith("http") ? pub.url : `https://${pub.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:underline inline-flex items-center"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                {dateStr && (
                  <div className="text-[11px] font-medium text-slate-500 shrink-0">
                    {dateStr}
                  </div>
                )}
              </div>

              {pub.publisher && (
                <div className="text-[11px] font-medium text-slate-600" style={{ color: theme?.secondaryColor }}>
                  {pub.publisher}
                </div>
              )}

              {pub.description && (
                <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">
                  {pub.description}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
