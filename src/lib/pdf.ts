import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { renderResumeToHtml } from "@/lib/render-html";
import type { ResumeData, ResumeTheme, SectionKey } from "@/types/resume.types";
import { DEFAULT_THEME } from "@/types/resume.types";
import fs from "fs";

interface PDFOverrideOptions {
  data?: ResumeData;
  theme?: ResumeTheme;
  templateId?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  templateConfig?: any | null;
  sectionOrder?: SectionKey[];
  title?: string;
}

function getSystemChromePath(): string {
  const possiblePaths = [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    `${process.env.LOCALAPPDATA || ""}\\Google\\Chrome\\Application\\chrome.exe`,
    `${process.env.PROGRAMFILES || ""}\\Google\\Chrome\\Application\\chrome.exe`,
    `${process.env["PROGRAMFILES(X86)"] || ""}\\Google\\Chrome\\Application\\chrome.exe`,
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium-browser",
    "/usr/bin/chromium",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  ];

  for (const path of possiblePaths) {
    if (path && fs.existsSync(/*turbopackIgnore: true*/ path)) {
      return path;
    }
  }

  return "";
}

export async function generatePDF(
  resumeId: string,
  userId: string,
  options?: PDFOverrideOptions
): Promise<Buffer> {
  let resumeData = options?.data;
  let resumeTheme = options?.theme || DEFAULT_THEME;
  let templateId = options?.templateId || "minimal-white";
  let templateConfig = options?.templateConfig || null;
  let sectionOrder = options?.sectionOrder;
  let title = options?.title || "Resume";

  // If data not directly passed in options, fetch from Supabase
  if (!resumeData && resumeId) {
    try {
      const supabase = await createServerSupabaseClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: resume } = await (supabase.from("resumes") as any)
        .select("*")
        .eq("id", resumeId)
        .single();

      if (resume) {
        if (userId) {
          const ownerId = resume.user_id || resume.userId;
          if (ownerId && ownerId !== userId) {
            throw new Error("Unauthorized: You do not own this resume");
          }
        }
        resumeData = (resume.data as unknown as ResumeData);
        resumeTheme = (resume.theme as unknown as ResumeTheme) || DEFAULT_THEME;
        templateId = resume.template_id || resume.templateId || "minimal-white";
        sectionOrder = (resume.section_order || resume.sectionOrder || undefined) as SectionKey[] | undefined;
        title = resume.title || "Resume";
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes("Unauthorized")) {
        throw err;
      }
      console.warn("PDF generator Supabase fetch skipped:", err);
    }
  }

  const validData: ResumeData = resumeData || {
    personalInfo: {
      fullName: title || "Resume",
      email: "user@example.com",
    },
  };

  // Render HTML directly in memory
  const htmlContent = await renderResumeToHtml(
    templateId,
    validData,
    resumeTheme,
    title,
    templateConfig,
    sectionOrder
  );

  // Determine executable path and args for Vercel Serverless vs Local Dev
  const isDev = process.env.NODE_ENV === "development" || process.env.VERCEL !== "1";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chromiumObj = chromium as any;

  let executablePath = "";
  if (isDev) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const puppeteerFull = (await import("puppeteer")) as any;
      executablePath = String(puppeteerFull.default?.executablePath ? puppeteerFull.default.executablePath() : "");
    } catch {
      executablePath = typeof chromiumObj.executablePath === "function"
        ? await chromiumObj.executablePath()
        : await chromiumObj.executablePath || "";
    }

    if (!executablePath || !fs.existsSync(/*turbopackIgnore: true*/ executablePath)) {
      executablePath = getSystemChromePath();
    }
  } else {
    executablePath = typeof chromiumObj.executablePath === "function"
      ? await chromiumObj.executablePath()
      : await chromiumObj.executablePath || "";
  }

  const args = isDev
    ? ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
    : await chromiumObj.args;

  const headless = isDev
    ? true
    : await (chromiumObj.headless ?? true);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const launchOptions: any = {
    args: args || ["--no-sandbox", "--disable-setuid-sandbox"],
    defaultViewport: { width: 794, height: 1123 },
    headless,
  };

  if (executablePath) {
    launchOptions.executablePath = executablePath;
  }

  const browser = await puppeteer.launch(launchOptions);

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 794, height: 1123 });

    // Set HTML content directly to avoid localhost HTTP calls or timeouts
    await page.setContent(htmlContent, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    // Print to PDF with exact A4 settings
    const pdfUint8Array = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "0",
        bottom: "0",
        left: "0",
        right: "0",
      },
    });

    return Buffer.from(pdfUint8Array);
  } finally {
    await browser.close();
  }
}
