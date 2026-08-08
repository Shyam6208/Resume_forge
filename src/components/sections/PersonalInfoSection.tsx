import type { PersonalInfo, ResumeTheme } from "@/types/resume.types";
import { Mail, Phone, MapPin, Globe, ExternalLink } from "lucide-react";

interface PersonalInfoSectionProps {
  data: PersonalInfo;
  theme?: ResumeTheme;
}

export function PersonalInfoSection({ data, theme }: PersonalInfoSectionProps) {
  const showPhoto = theme?.showPhoto ?? false;
  const showIcons = theme?.showIcons ?? true;

  const locationStr = [data.city, data.country || data.address]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="flex items-start justify-between gap-4 mb-4">
      <div className="flex-1">
        <h1
          className="text-2xl font-bold tracking-tight text-slate-900"
          style={{
            color: theme?.primaryColor,
            fontSize: theme?.headingSize ? `${theme.headingSize * 1.3}px` : undefined,
          }}
        >
          {data.fullName}
        </h1>

        {data.professionalTitle && (
          <p
            className="text-sm font-medium text-slate-600 mt-0.5"
            style={{ color: theme?.secondaryColor }}
          >
            {data.professionalTitle}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-slate-600">
          {data.email && (
            <a
              href={`mailto:${data.email}`}
              className="inline-flex items-center gap-1 hover:underline"
            >
              {showIcons && <Mail className="w-3.5 h-3.5" style={{ color: theme?.accentColor }} />}
              <span>{data.email}</span>
            </a>
          )}

          {data.phone && (
            <a
              href={`tel:${data.phone}`}
              className="inline-flex items-center gap-1 hover:underline"
            >
              {showIcons && <Phone className="w-3.5 h-3.5" style={{ color: theme?.accentColor }} />}
              <span>{data.phone}</span>
            </a>
          )}

          {locationStr && (
            <span className="inline-flex items-center gap-1">
              {showIcons && <MapPin className="w-3.5 h-3.5" style={{ color: theme?.accentColor }} />}
              <span>{locationStr}</span>
            </span>
          )}

          {data.website && (
            <a
              href={data.website.startsWith("http") ? data.website : `https://${data.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:underline text-indigo-600"
            >
              {showIcons && <Globe className="w-3.5 h-3.5" style={{ color: theme?.accentColor }} />}
              <span>{data.website.replace(/^https?:\/\//, "")}</span>
            </a>
          )}

          {data.linkedin && (
            <a
              href={data.linkedin.startsWith("http") ? data.linkedin : `https://${data.linkedin}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:underline text-indigo-600"
            >
              {showIcons && (
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" style={{ color: theme?.accentColor }}>
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.77a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2Z" />
                </svg>
              )}
              <span>LinkedIn</span>
            </a>
          )}

          {data.github && (
            <a
              href={data.github.startsWith("http") ? data.github : `https://${data.github}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:underline text-indigo-600"
            >
              {showIcons && (
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" style={{ color: theme?.accentColor }}>
                  <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2Z" />
                </svg>
              )}
              <span>GitHub</span>
            </a>
          )}

          {data.portfolio && (
            <a
              href={data.portfolio.startsWith("http") ? data.portfolio : `https://${data.portfolio}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:underline text-indigo-600"
            >
              {showIcons && <ExternalLink className="w-3.5 h-3.5" style={{ color: theme?.accentColor }} />}
              <span>Portfolio</span>
            </a>
          )}
        </div>
      </div>

      {showPhoto && data.profilePhoto && (
        <div className="shrink-0 w-20 h-20 rounded-full overflow-hidden border-2 border-slate-200 shadow-sm">
          <img
            src={data.profilePhoto}
            alt={data.fullName}
            className="w-full h-full object-cover"
          />
        </div>
      )}
    </div>
  );
}
