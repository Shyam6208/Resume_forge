import { NextResponse } from "next/server";
import QRCode from "qrcode";

export const dynamic = "force-dynamic";

/**
 * GET /api/portfolio/qr
 * Generates an ISO-compliant, 100% scannable QR code for a live portfolio URL.
 *
 * Query Parameters:
 * - slug: string (e.g. "full-stack-developer-resume-6de2a8a6")
 * - url: optional full live URL (takes precedence over slug)
 * - baseUrl: optional base URL (e.g. "https://resume-forge12.vercel.app")
 * - format: "svg" | "png" (defaults to "svg")
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const explicitUrl = searchParams.get("url");
    const format = searchParams.get("format") || "svg";

    let targetUrl = "";

    if (explicitUrl) {
      targetUrl = explicitUrl;
    } else if (slug) {
      // Determine the live base URL dynamically
      let baseUrl = searchParams.get("baseUrl");

      if (!baseUrl) {
        // Automatically extract from request headers (works seamlessly on Vercel, localhost, and custom domains)
        const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
        const proto = request.headers.get("x-forwarded-proto") || (host?.includes("localhost") ? "http" : "https");

        if (host) {
          baseUrl = `${proto}://${host}`;
        } else if (process.env.NEXT_PUBLIC_APP_URL) {
          baseUrl = process.env.NEXT_PUBLIC_APP_URL;
        } else {
          baseUrl = "http://localhost:3000";
        }
      }

      // Ensure no trailing slash on baseUrl
      baseUrl = baseUrl.replace(/\/+$/, "");
      targetUrl = `${baseUrl}/r/${slug}`;
    } else {
      return NextResponse.json(
        { error: "Missing 'slug' or 'url' parameter" },
        { status: 400 }
      );
    }

    // Return PNG if requested
    if (format === "png") {
      const pngBuffer = await QRCode.toBuffer(targetUrl, {
        type: "png",
        errorCorrectionLevel: "M",
        margin: 2,
        color: {
          dark: "#0b0f17",
          light: "#ffffff",
        },
        width: 400,
      });

      return new NextResponse(pngBuffer as unknown as BodyInit, {
        status: 200,
        headers: {
          "Content-Type": "image/png",
          "Content-Disposition": `inline; filename="${slug || "portfolio"}-qr.png"`,
          "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=43200",
        },
      });
    }

    // Default: Return high-resolution, crisp SVG
    const svg = await QRCode.toString(targetUrl, {
      type: "svg",
      errorCorrectionLevel: "M",
      margin: 2,
      color: {
        dark: "#0b0f17",
        light: "#ffffff",
      },
      width: 320,
    });

    return new NextResponse(svg, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml",
        "Content-Disposition": `inline; filename="${slug || "portfolio"}-qr.svg"`,
        "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=43200",
      },
    });
  } catch (err: unknown) {
    console.error("GET /api/portfolio/qr error:", err);
    return NextResponse.json(
      { error: "Failed to generate QR code" },
      { status: 500 }
    );
  }
}
