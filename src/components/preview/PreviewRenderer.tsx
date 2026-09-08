"use client";

import { Component, ReactNode, ErrorInfo, memo } from "react";
import type { ResumeData, ResumeTheme, SectionKey } from "@/types/resume.types";
import {
  ModernPro,
  MinimalWhite,
  FresherBasic,
  DevTemplate,
  CorporatePro,
} from "@/components/templates";
import { DynamicTemplate } from "@/components/templates/DynamicTemplate";
import { DynamicTemplateConfig } from "@/lib/templates/template-validator";

interface PreviewRendererProps {
  templateId: string;
  data: ResumeData;
  theme: ResumeTheme;
  templateConfig?: DynamicTemplateConfig | null;
  sectionOrder?: SectionKey[];
}

// Error Boundary for template rendering
class TemplateErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: string | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Template rendering error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-red-800 text-xs">
          <p className="font-bold">Template Render Error</p>
          <p className="mt-1">{this.state.error}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export const PreviewRenderer = memo(function PreviewRenderer({
  templateId,
  data,
  theme,
  templateConfig,
  sectionOrder,
}: PreviewRendererProps) {
  const renderTemplate = () => {
    if (templateConfig && typeof templateConfig === "object") {
      return (
        <DynamicTemplate
          data={data}
          theme={theme}
          config={templateConfig}
          sectionOrder={sectionOrder}
        />
      );
    }
    switch (templateId) {
      case "modern-pro":
        return <ModernPro data={data} theme={theme} sectionOrder={sectionOrder} />;
      case "minimal-white":
        return <MinimalWhite data={data} theme={theme} sectionOrder={sectionOrder} />;
      case "fresher-basic":
        return <FresherBasic data={data} theme={theme} sectionOrder={sectionOrder} />;
      case "dev-template":
        return <DevTemplate data={data} theme={theme} sectionOrder={sectionOrder} />;
      case "corporate-pro":
        return <CorporatePro data={data} theme={theme} sectionOrder={sectionOrder} />;
      default:
        // Dynamic / Custom Database Template
        return (
          <DynamicTemplate
            data={data}
            theme={theme}
            config={templateConfig}
            sectionOrder={sectionOrder}
          />
        );
    }
  };

  return (
    <TemplateErrorBoundary>
      <div className="preview-container print:bg-white">
        {renderTemplate()}
      </div>
    </TemplateErrorBoundary>
  );
});
