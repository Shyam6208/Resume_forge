import { ReactNode } from "react";

interface SectionWrapperProps {
  isEmpty: boolean;
  isVisible?: boolean;
  children: ReactNode;
  className?: string;
}

/**
 * SectionWrapper enforces:
 * 1. EMPTY SECTIONS NEVER RENDER (isEmpty = true -> null).
 * 2. DELETED/HIDDEN SECTIONS NEVER RENDER (isVisible = false -> null).
 * All resume templates wrap sections in this component.
 */
export function SectionWrapper({
  isEmpty,
  isVisible = true,
  children,
  className,
}: SectionWrapperProps) {
  if (isEmpty || !isVisible) {
    return null;
  }

  return <div className={className}>{children}</div>;
}
