import type { Metadata } from "next";
import { ATSCheckerClient } from "./ATSCheckerClient";

export const metadata: Metadata = {
  title: "Free ATS Resume Checker & Score Scanner — ResumeForge",
  description:
    "Check your resume's ATS compatibility score for free. Get instant keyword matching, missing skills detection, and actionable suggestions to pass applicant tracking systems.",
  keywords: [
    "free ATS checker",
    "resume score",
    "ATS resume scanner",
    "keyword match",
    "job description match",
    "ATS friendly resume",
  ],
};

export default function ATSCheckerPage() {
  return <ATSCheckerClient />;
}
