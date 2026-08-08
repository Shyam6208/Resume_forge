import { ReactNode } from "react";

interface SectionWrapperProps {
  isEmpty: boolean;
  children: ReactNode;
  className?: string;
}

/**
 * SectionWrapper enforces Rule #1: EMPTY SECTIONS NEVER RENDER.
 * If isEmpty is true, it returns null (zero DOM output, zero blank space).
 * All resume templates MUST wrap every section in this component.
 */
export function SectionWrapper({
  isEmpty,
  children,
  className,
}: SectionWrapperProps) {
  if (isEmpty) {
    return null;
  }

  return <div className={className}>{children}</div>;
}
