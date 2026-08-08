import type { Metadata } from "next";
import { LandingPageClient } from "./components/LandingPageClient";

export const metadata: Metadata = {
  title: "ResumeForge — Build Free ATS-Friendly Resumes",
  description:
    "Create watermark-free professional resumes with live ATS checker, PDF & DOCX export, and 40+ templates.",
};

export default function LandingPage() {
  return <LandingPageClient />;
}
