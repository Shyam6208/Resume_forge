// ============================================================
// ResumeForge — Dynamic Template JSON Schema & Validator
// Strict validation of uploaded template configuration JSON files.
// NO EXECUTABLE CODE, SCRIPT TAGS, OR DANGEROUS PATTERNS ALLOWED.
// ============================================================

export interface LayoutStyleConfig {
  page?: {
    display?: string;
    gridTemplateColumns?: string;
    gap?: string;
    background?: string;
    backgroundColor?: string;
    padding?: string;
    margin?: string;
  };
  sidebar?: {
    background?: string;
    backgroundColor?: string;
    color?: string;
    textColor?: string;
    padding?: string;
    borderRadius?: string;
    order?: number;
    width?: string;
  };
  main?: {
    background?: string;
    backgroundColor?: string;
    color?: string;
    textColor?: string;
    padding?: string;
    order?: number;
  };
}

export interface DynamicTemplateConfig {
  version?: string | number;
  template?: string;
  layoutStyle?: string | LayoutStyleConfig;
  themeOverrides?: {
    primaryColor?: string;
    secondaryColor?: string;
    sidebarColor?: string;
    sidebarBg?: string;
    sidebarBackground?: string;
    textColor?: string;
    sidebarTextColor?: string;
    mutedColor?: string;
    mutedTextColor?: string;
    borderColor?: string;
    backgroundColor?: string;
    pageBackground?: string;
    accentColor?: string;
    fontFamily?: string;
    fontSize?: string | number;
    lineHeight?: string | number;
    headingFont?: string;
    bodyFont?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  };
  headerConfig?: {
    style?: "minimal" | "centered" | "banner" | "sidebar" | string;
    alignment?: "left" | "center" | "right" | string;
    showPhoto?: boolean;
    photoShape?: "circle" | "rounded" | "square" | string;
    taglineColor?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  };
  sectionStyles?: {
    headingStyle?: "underlined" | "left-border" | "uppercase-bold" | "badge" | string;
    spacing?: "compact" | "normal" | "spacious" | string;
    dividerStyle?: "solid" | "dashed" | "none" | string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

const DANGEROUS_PATTERNS = [
  /<script/i,
  /javascript:/i,
  /onload=/i,
  /onerror=/i,
  /onclick=/i,
  /dangerouslysetinnerhtml/i,
  /eval\(/i,
  /function\s*\(/i,
  /=>/i,
  /<iframe/i,
  /<object/i,
  /<embed/i,
  /__proto__/i,
  /constructor/i,
];

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  config?: DynamicTemplateConfig;
}

/**
 * Strictly validates raw JSON string or object for dynamic template configuration.
 * Preserves all layoutStyle, themeOverrides, headerConfig, and custom data.
 */
export function validateTemplateConfig(
  rawInput: string | object
): ValidationResult {
  let jsonString = "";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let parsed: any = null;

  if (typeof rawInput === "string") {
    jsonString = rawInput;
    if (jsonString.length > 1000000) {
      return { isValid: false, error: "Template JSON file exceeds maximum size limit (1MB)." };
    }
    try {
      parsed = JSON.parse(rawInput);
    } catch (err) {
      return { isValid: false, error: `Invalid JSON format: ${err instanceof Error ? err.message : "Syntax error"}` };
    }
  } else if (typeof rawInput === "object" && rawInput !== null) {
    parsed = rawInput;
    jsonString = JSON.stringify(rawInput);
  } else {
    return { isValid: false, error: "Invalid template configuration payload." };
  }

  // Security Check: Look for dangerous executable patterns in raw JSON string
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(jsonString)) {
      return {
        isValid: false,
        error: `Security Violation: Forbidden code structure or dangerous script tag detected.`,
      };
    }
  }

  // Schema Structural Validation
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return { isValid: false, error: "Template JSON must be a top-level JSON object." };
  }

  // Return clean configuration without stripping or destroying layoutStyle or custom fields
  const cleanConfig: DynamicTemplateConfig = {
    ...parsed,
    version: parsed.version ? String(parsed.version) : "1.0",
    layoutStyle: parsed.layoutStyle || "single-column",
    themeOverrides: parsed.themeOverrides || {},
    headerConfig: parsed.headerConfig || {},
    sectionStyles: parsed.sectionStyles || {},
  };

  return { isValid: true, config: cleanConfig };
}
