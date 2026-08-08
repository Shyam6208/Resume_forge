import type { CertificationEntry, ResumeTheme } from "@/types/resume.types";
import { formatDate } from "@/utils/date-formatter";
import { ExternalLink } from "lucide-react";

interface CertificationsSectionProps {
  certifications?: CertificationEntry[];
  theme?: ResumeTheme;
}

export function CertificationsSection({ certifications, theme }: CertificationsSectionProps) {
  if (!certifications || certifications.length === 0) return null;

  return (
    <div className="mb-4">
      <h2
        className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2.5"
        style={{
          color: theme?.primaryColor,
          borderColor: theme?.secondaryColor ? `${theme.secondaryColor}40` : undefined,
        }}
      >
        Certifications & Licenses
      </h2>

      <div className="space-y-2">
        {certifications.map((cert) => {
          const issueFormatted = formatDate(cert.issueDate);
          const expiryFormatted = cert.expiryDate ? formatDate(cert.expiryDate) : null;
          const dateStr = issueFormatted
            ? expiryFormatted
              ? `${issueFormatted} — ${expiryFormatted}`
              : `Issued ${issueFormatted}`
            : "";

          return (
            <div key={cert.id} className="text-xs flex items-baseline justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5 font-semibold text-slate-900" style={{ color: theme?.primaryColor }}>
                  <span>{cert.name}</span>
                  {cert.credentialUrl && (
                    <a
                      href={cert.credentialUrl.startsWith("http") ? cert.credentialUrl : `https://${cert.credentialUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:underline inline-flex items-center"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <div className="text-[11px] text-slate-600">
                  {cert.organization}
                  {cert.credentialId && (
                    <span className="text-slate-400 ml-2">ID: {cert.credentialId}</span>
                  )}
                </div>
              </div>

              {dateStr && (
                <div className="text-[11px] font-medium text-slate-500 shrink-0">
                  {dateStr}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
