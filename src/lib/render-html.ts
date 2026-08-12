import {
  ModernPro,
  MinimalWhite,
  FresherBasic,
  DevTemplate,
  CorporatePro,
} from "@/components/templates";
import { DynamicTemplate } from "@/components/templates/DynamicTemplate";
import { DynamicTemplateConfig } from "@/lib/templates/template-validator";
import type { ResumeData, ResumeTheme } from "@/types/resume.types";
import React from "react";

function renderTemplateElement(
  templateId: string,
  data: ResumeData,
  theme: ResumeTheme,
  templateConfig?: DynamicTemplateConfig | null
) {
  switch (templateId) {
    case "modern-pro":
      return React.createElement(ModernPro, { data, theme });
    case "minimal-white":
      return React.createElement(MinimalWhite, { data, theme });
    case "fresher-basic":
      return React.createElement(FresherBasic, { data, theme });
    case "dev-template":
      return React.createElement(DevTemplate, { data, theme });
    case "corporate-pro":
      return React.createElement(CorporatePro, { data, theme });
    default:
      return React.createElement(DynamicTemplate, { data, theme, config: templateConfig });
  }
}

export async function renderResumeToHtml(
  templateId: string,
  data: ResumeData,
  theme: ResumeTheme,
  title: string,
  templateConfig?: DynamicTemplateConfig | null
): Promise<string> {
  // Dynamic import react-dom/server to bypass static bundler checks
  const ReactDOMServer = await import("react-dom/server");
  const renderFunc = ReactDOMServer.renderToStaticMarkup || ReactDOMServer.default?.renderToStaticMarkup;

  const element = renderTemplateElement(templateId, data, theme, templateConfig);
  const markup = renderFunc ? renderFunc(element) : "";

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      @page {
        size: A4;
        margin: 0;
      }
      * {
        box-sizing: border-box;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      html, body {
        margin: 0;
        padding: 0;
        background: #ffffff;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      .a4-render-wrapper {
        width: 210mm;
        min-height: 297mm;
        margin: 0 auto;
        background: #ffffff;
        position: relative;
        overflow: hidden;
      }
      .no-print, button, nav, header {
        display: none !important;
      }
    </style>
  </head>
  <body>
    <div class="a4-render-wrapper">
      ${markup}
    </div>
  </body>
</html>`;
}
