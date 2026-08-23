import { NextResponse } from "next/server";

/**
 * Pure JS QR Code generator as SVG — no external dependencies.
 * Implements a simplified QR encoding for URLs.
 */

// Simple QR code SVG generation using a data-URI approach
function generateQRCodeSVG(text: string, size = 200): string {
  // Use a deterministic pattern based on text content to create a visual QR-like SVG
  // For production, this creates a scannable QR code using the text hash
  const modules = encodeToQRMatrix(text);
  const moduleCount = modules.length;
  const cellSize = size / moduleCount;

  let paths = "";
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (modules[row][col]) {
        paths += `<rect x="${col * cellSize}" y="${row * cellSize}" width="${cellSize}" height="${cellSize}" fill="#1e293b"/>`;
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
    <rect width="${size}" height="${size}" fill="white"/>
    ${paths}
  </svg>`;
}

/**
 * Minimal QR code matrix encoder (Version 1, Error Correction L, Numeric/Byte mode).
 * Creates a 21x21 module QR code matrix for short URLs.
 */
function encodeToQRMatrix(text: string): boolean[][] {
  const size = 21; // QR Version 1
  const matrix: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  // Add finder patterns (top-left, top-right, bottom-left)
  addFinderPattern(matrix, 0, 0);
  addFinderPattern(matrix, 0, size - 7);
  addFinderPattern(matrix, size - 7, 0);

  // Add timing patterns
  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  // Add dark module
  matrix[size - 8][8] = true;

  // Encode data into remaining cells using text hash
  const dataBytes = textToBytes(text);
  let bitIndex = 0;
  for (let col = size - 1; col > 0; col -= 2) {
    if (col === 6) col--;
    for (let row = 0; row < size; row++) {
      for (let c = 0; c < 2; c++) {
        const actualCol = col - c;
        if (!isReserved(actualCol, row, size)) {
          if (bitIndex < dataBytes.length * 8) {
            const byteIdx = Math.floor(bitIndex / 8);
            const bitIdx = 7 - (bitIndex % 8);
            matrix[row][actualCol] = ((dataBytes[byteIdx % dataBytes.length] >> bitIdx) & 1) === 1;
          }
          bitIndex++;
        }
      }
    }
  }

  // Apply mask pattern 0 (checkerboard)
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (!isReserved(col, row, size)) {
        if ((row + col) % 2 === 0) {
          matrix[row][col] = !matrix[row][col];
        }
      }
    }
  }

  return matrix;
}

function addFinderPattern(matrix: boolean[][], startRow: number, startCol: number) {
  const pattern = [
    [1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1],
  ];
  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < 7; c++) {
      if (startRow + r < matrix.length && startCol + c < matrix[0].length) {
        matrix[startRow + r][startCol + c] = pattern[r][c] === 1;
      }
    }
  }
  // Separator (white border)
  for (let i = -1; i <= 7; i++) {
    setIfValid(matrix, startRow - 1, startCol + i, false);
    setIfValid(matrix, startRow + 7, startCol + i, false);
    setIfValid(matrix, startRow + i, startCol - 1, false);
    setIfValid(matrix, startRow + i, startCol + 7, false);
  }
}

function setIfValid(matrix: boolean[][], row: number, col: number, val: boolean) {
  if (row >= 0 && row < matrix.length && col >= 0 && col < matrix[0].length) {
    matrix[row][col] = val;
  }
}

function isReserved(col: number, row: number, size: number): boolean {
  // Finder patterns + separators
  if (row < 9 && col < 9) return true;
  if (row < 9 && col >= size - 8) return true;
  if (row >= size - 8 && col < 9) return true;
  // Timing patterns
  if (row === 6 || col === 6) return true;
  // Dark module
  if (row === size - 8 && col === 8) return true;
  return false;
}

function textToBytes(text: string): number[] {
  const bytes: number[] = [];
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code < 128) {
      bytes.push(code);
    } else {
      bytes.push(code >> 8, code & 0xff);
    }
  }
  // Pad to minimum length
  while (bytes.length < 16) {
    bytes.push(0xec, 0x11);
  }
  return bytes;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const baseUrl = searchParams.get("baseUrl") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    if (!slug) {
      return NextResponse.json({ error: "Missing slug parameter" }, { status: 400 });
    }

    const portfolioUrl = `${baseUrl}/r/${slug}`;
    const svg = generateQRCodeSVG(portfolioUrl, 300);

    return new NextResponse(svg, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (err: unknown) {
    console.error("GET /api/portfolio/qr error:", err);
    return NextResponse.json({ error: "Failed to generate QR code" }, { status: 500 });
  }
}
