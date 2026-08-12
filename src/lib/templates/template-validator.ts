// ============================================================
// ResumeForge — Dynamic Template JSON Schema & Validator
// Strict validation of uploaded template configuration JSON files.
// NO EXECUTABLE CODE, SCRIPT TAGS, OR DANGEROUS PATTERNS ALLOWED.
// ============================================================

export interface DynamicTemplateConfig {
  version: string;
  layoutStyle: "single-column" | "two-column-left" | "two-column-right" | "top-banner";
  themeOverrides?: {
    primaryColor?: string;
    secondaryColor?: string;
    textColor?: string;
    backgroundColor?: string;
    fontFamily?: "inter" | "roboto" | "outfit" | "serif" | "mono";
    fontSize?: "sm" | "md" | "lg";
  };
  headerConfig?: {
    style?: "minimal" | "centered" | "banner" | "sidebar";
    showPhoto?: boolean;
    photoShape?: "circle" | "rounded" | "square";
  };
  sectionStyles?: {
    headingStyle?: "underlined" | "left-border" | "uppercase-bold" | "badge";
    spacing?: "compact" | "normal" | "spacious";
    dividerStyle?: "solid" | "dashed" | "none";
  };
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
 */
export function validateTemplateConfig(
  rawInput: string | object
): ValidationResult {
  let jsonString = "";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let parsed: any = null;

  if (typeof rawInput === "string") {
    jsonString = rawInput;
    if (jsonString.length > 500000) {
      return { isValid: false, error: "Template JSON file exceeds maximum size limit (500KB)." };
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

  const validLayouts = ["single-column", "two-column-left", "two-column-right", "top-banner"];
  if (parsed.layoutStyle && !validLayouts.includes(parsed.layoutStyle)) {
    return {
      isValid: false,
      error: `Invalid layoutStyle "${parsed.layoutStyle}". Allowed values: ${validLayouts.join(", ")}`,
    };
  }

  // Return clean sanitized object
  const cleanConfig: DynamicTemplateConfig = {
    version: parsed.version || "1.0",
    layoutStyle: parsed.layoutStyle || "single-column",
    themeOverrides: parsed.themeOverrides || {},
    headerConfig: parsed.headerConfig || {},
    sectionStyles: parsed.sectionStyles || {},
  };

  return { isValid: true, config: cleanConfig };
}
