import {
  ModernPro,
  MinimalWhite,
  FresherBasic,
  DevTemplate,
  CorporatePro,
} from "@/components/templates";
import { DynamicTemplate } from "@/components/templates/DynamicTemplate";
import { DynamicTemplateConfig } from "@/lib/templates/template-validator";
import type { ResumeData, ResumeTheme, SectionKey } from "@/types/resume.types";
import React from "react";

function renderTemplateElement(
  templateId: string,
  data: ResumeData,
  theme: ResumeTheme,
  templateConfig?: DynamicTemplateConfig | null,
  sectionOrder?: SectionKey[]
) {
  switch (templateId) {
    case "modern-pro":
      return React.createElement(ModernPro, { data, theme, sectionOrder });
    case "minimal-white":
      return React.createElement(MinimalWhite, { data, theme, sectionOrder });
    case "fresher-basic":
      return React.createElement(FresherBasic, { data, theme, sectionOrder });
    case "dev-template":
      return React.createElement(DevTemplate, { data, theme, sectionOrder });
    case "corporate-pro":
      return React.createElement(CorporatePro, { data, theme, sectionOrder });
    default:
      return React.createElement(DynamicTemplate, {
        data,
        theme,
        config: templateConfig,
        sectionOrder,
      });
  }
}

export async function renderResumeToHtml(
  templateId: string,
  data: ResumeData,
  theme: ResumeTheme,
  title: string,
  templateConfig?: DynamicTemplateConfig | null,
  sectionOrder?: SectionKey[]
): Promise<string> {
  // Dynamic import react-dom/server to bypass static bundler checks
  const ReactDOMServer = await import("react-dom/server");
  const renderFunc = ReactDOMServer.renderToStaticMarkup || ReactDOMServer.default?.renderToStaticMarkup;

  const element = renderTemplateElement(templateId, data, theme, templateConfig, sectionOrder);
  const markup = renderFunc ? renderFunc(element) : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title || "Resume"}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Roboto:wght@400;500;700&family=Merriweather:wght@400;700&family=Outfit:wght@400;600;700;800&family=Fira+Code:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4;
      margin: 0;
    }
    html, body {
      margin: 0;
      padding: 0;
      width: 210mm;
      min-height: 297mm;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      background-color: #ffffff;
    }
    * {
      box-sizing: border-box;
    }
  </style>
</head>
<body class="bg-white">
  ${markup}
</body>
</html>`;
}
