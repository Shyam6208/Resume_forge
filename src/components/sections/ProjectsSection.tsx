import type { ProjectEntry, ResumeTheme } from "@/types/resume.types";
import { formatDateRange } from "@/utils/date-formatter";
import { ExternalLink } from "lucide-react";

interface ProjectsSectionProps {
  projects?: ProjectEntry[];
  theme?: ResumeTheme;
}

export function ProjectsSection({ projects, theme }: ProjectsSectionProps) {
  if (!projects || projects.length === 0) return null;

  return (
    <div className="mb-4">
      <h2
        className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-3"
        style={{
          color: theme?.primaryColor,
          borderColor: theme?.secondaryColor ? `${theme.secondaryColor}40` : undefined,
        }}
      >
        Projects
      </h2>

      <div className="space-y-3">
        {projects.map((project) => {
          const dateStr = formatDateRange(project.startDate, project.endDate);

          return (
            <div key={project.id} className="text-xs">
              <div className="flex items-baseline justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900" style={{ color: theme?.primaryColor }}>
                    {project.name}
                  </span>

                  {project.githubLink && (
                    <a
                      href={project.githubLink.startsWith("http") ? project.githubLink : `https://${project.githubLink}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-500 hover:text-slate-800 transition-colors"
                      title="GitHub Repository"
                    >
                      <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                        <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2Z" />
                      </svg>
                    </a>
                  )}

                  {project.liveDemo && (
                    <a
                      href={project.liveDemo.startsWith("http") ? project.liveDemo : `https://${project.liveDemo}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-800 transition-colors"
                      title="Live Demo"
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

              {project.technologies && project.technologies.length > 0 && (
                <div className="flex flex-wrap items-center gap-1 my-1">
                  <span className="text-[10px] text-slate-500 font-medium mr-1">Technologies:</span>
                  {project.technologies.map((tech, i) => (
                    <span
                      key={i}
                      className="inline-block px-1.5 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-700 rounded"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}

              {project.description && (
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  {project.description}
                </p>
              )}

              {project.highlights && project.highlights.length > 0 && (
                <ul className="space-y-0.5 mt-1 text-slate-700">
                  {project.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-1.5 leading-relaxed text-[11px]">
                      <span className="text-slate-400 select-none">•</span>
                      <span>{h}</span>
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
