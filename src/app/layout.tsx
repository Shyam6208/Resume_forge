import type { Metadata, Viewport } from "next";
import { Toaster } from "react-hot-toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";
import { Geist, Inter } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });
const inter = Inter({ subsets: ["latin"], display: "swap" });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#020617",
};

export const metadata: Metadata = {
  title: "ResumeForge — Free Professional Resume Builder",
  description:
    "Build ATS-friendly resumes for free. 40+ templates, PDF export, no watermark, no AI.",
  keywords: [
    "resume builder",
    "free resume",
    "ATS resume",
    "ATS checker",
    "professional resume builder",
    "no watermark resume",
    "PDF export resume",
  ],
  authors: [{ name: "ResumeForge Team" }],
  openGraph: {
    title: "ResumeForge — Free Professional Resume Builder",
    description:
      "Build ATS-friendly resumes for free. 40+ templates, PDF export, no watermark, no AI.",
    url: "https://resumeforge.app",
    siteName: "ResumeForge",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ResumeForge — Free Professional Resume Builder",
    description:
      "Build ATS-friendly resumes for free. 40+ templates, PDF export, no watermark, no AI.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("dark font-sans", geist.variable, inter.className)}>
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
