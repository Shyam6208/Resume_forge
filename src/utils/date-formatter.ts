import { format, parseISO, isValid } from "date-fns";

/**
 * Formats a date string (ISO, YYYY-MM, or freeform) into "MMM yyyy" format.
 * Examples: "2023-01-15" -> "Jan 2023", "2022-05" -> "May 2022"
 */
export function formatDate(dateString?: string): string {
  if (!dateString || !dateString.trim()) return "";
  const trimmed = dateString.trim();

  // Try parsing ISO date
  const parsedISO = parseISO(trimmed);
  if (isValid(parsedISO)) {
    return format(parsedISO, "MMM yyyy");
  }

  // Fallback for native Date parsing
  const parsedDate = new Date(trimmed);
  if (isValid(parsedDate)) {
    return format(parsedDate, "MMM yyyy");
  }

  // Return original text if not a standard date format (e.g. "2021")
  return trimmed;
}

/**
 * Formats a date range into "Jan 2023 — Present" or "Jan 2021 — Dec 2022"
 */
export function formatDateRange(
  startDate?: string,
  endDate?: string,
  isCurrent?: boolean
): string {
  const startFormatted = formatDate(startDate);
  if (!startFormatted && !endDate && !isCurrent) return "";

  const endFormatted = isCurrent
    ? "Present"
    : endDate
    ? formatDate(endDate)
    : "";

  if (startFormatted && endFormatted) {
    return `${startFormatted} — ${endFormatted}`;
  }

  return startFormatted || endFormatted;
}
