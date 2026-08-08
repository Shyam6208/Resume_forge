import type { ReferenceEntry, ResumeTheme } from "@/types/resume.types";
import { Mail, Phone } from "lucide-react";

interface ReferencesSectionProps {
  references?: ReferenceEntry[];
  theme?: ResumeTheme;
}

export function ReferencesSection({ references, theme }: ReferencesSectionProps) {
  if (!references || references.length === 0) return null;

  return (
    <div className="mb-4">
      <h2
        className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2.5"
        style={{
          color: theme?.primaryColor,
          borderColor: theme?.secondaryColor ? `${theme.secondaryColor}40` : undefined,
        }}
      >
        References
      </h2>

      <div className="grid grid-cols-2 gap-3">
        {references.map((ref) => {
          const positionCompany = [ref.position, ref.company]
            .filter(Boolean)
            .join(" at ");

          return (
            <div key={ref.id} className="text-xs p-2 rounded bg-slate-50 border border-slate-200/60">
              <div className="font-semibold text-slate-900" style={{ color: theme?.primaryColor }}>
                {ref.name}
              </div>

              {positionCompany && (
                <div className="text-[11px] text-slate-600 font-medium" style={{ color: theme?.secondaryColor }}>
                  {positionCompany}
                </div>
              )}

              <div className="space-y-0.5 mt-1 text-[11px] text-slate-500">
                {ref.email && (
                  <a href={`mailto:${ref.email}`} className="flex items-center gap-1 hover:underline">
                    <Mail className="w-3 h-3 text-slate-400" />
                    <span>{ref.email}</span>
                  </a>
                )}
                {ref.phone && (
                  <a href={`tel:${ref.phone}`} className="flex items-center gap-1 hover:underline">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{ref.phone}</span>
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
