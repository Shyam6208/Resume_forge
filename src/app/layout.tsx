import type { Metadata, Viewport } from "next";
import { Toaster } from "react-hot-toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#020617",
};

export const metadata: Metadata = {
  title: "ResumeForge — Free AI Resume Builder & Career Suite",
  description:
    "Build ATS-optimized resumes with 1-Click AI Auto-Tailor, Live Voice Mock Interviews, Real-Time Web Portfolios, and clean PDF/DOCX export with zero watermarks.",
  keywords: [
    "AI resume builder",
    "free resume builder",
    "ATS resume optimizer",
    "AI mock interview",
    "real-time portfolio",
    "job description match",
    "PDF export resume",
    "no watermark resume",
  ],
  authors: [{ name: "ResumeForge Team" }],
  openGraph: {
    title: "ResumeForge — Free AI Resume Builder & Career Suite",
    description:
      "Build ATS-optimized resumes with 1-Click AI Auto-Tailor, Live Voice Mock Interviews, Real-Time Web Portfolios, and clean PDF/DOCX export with zero watermarks.",
    url: "https://resumeforge.app",
    siteName: "ResumeForge",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ResumeForge — Free AI Resume Builder & Career Suite",
    description:
      "Build ATS-optimized resumes with 1-Click AI Auto-Tailor, Live Voice Mock Interviews, Real-Time Web Portfolios, and clean PDF/DOCX export with zero watermarks.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("dark", inter.className)}>
      <body className="bg-slate-950 text-slate-100 antialiased min-h-screen flex flex-col w-full min-w-0">
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: "12px",
              background: "#0f172a",
              color: "#f8fafc",
              border: "1px solid #1e293b",
            },
          }}
        />
      </body>
    </html>
  );
}
