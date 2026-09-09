import exifr from "exifr";
import { ExifData } from "@/types";

/**
 * Extract EXIF metadata from an ArrayBuffer or Buffer of an image
 */
export async function extractExifFromBuffer(
  buffer: ArrayBuffer | Buffer
): Promise<ExifData> {
  try {
    const raw = await exifr.parse(buffer, {
      pick: [
        "Make",
        "Model",
        "LensModel",
        "FocalLength",
        "FNumber",
        "ExposureTime",
        "ISO",
        "CreateDate",
        "DateTimeOriginal",
        "ImageWidth",
        "ImageHeight",
      ],
    });

    if (!raw) return {};

    const camera = [raw.Make, raw.Model].filter(Boolean).join(" ").trim();
    const lens = raw.LensModel ? String(raw.LensModel).trim() : undefined;
    const focalLength = raw.FocalLength ? `${Math.round(raw.FocalLength)}mm` : undefined;
    const aperture = raw.FNumber ? `f/${raw.FNumber}` : undefined;
    
    // Shutter speed formatting e.g. 1/250s or 2s
    let shutterSpeed: string | undefined;
    if (raw.ExposureTime) {
      if (raw.ExposureTime < 1) {
        shutterSpeed = `1/${Math.round(1 / raw.ExposureTime)}s`;
      } else {
        shutterSpeed = `${raw.ExposureTime}s`;
      }
    }

    const iso = raw.ISO ? Number(raw.ISO) : undefined;
    const takenAt = raw.DateTimeOriginal || raw.CreateDate
      ? new Date(raw.DateTimeOriginal || raw.CreateDate).toISOString()
      : undefined;

    let megapixels: string | undefined;
    if (raw.ImageWidth && raw.ImageHeight) {
      megapixels = `${((raw.ImageWidth * raw.ImageHeight) / 1000000).toFixed(1)} MP`;
    }

    return {
      camera: camera || undefined,
      lens,
      focalLength,
      aperture,
      shutterSpeed,
      iso,
      megapixels,
      takenAt,
    };
  } catch (err) {
    console.warn("Could not parse EXIF metadata:", err);
    return {};
  }
}

/**
 * Generates an SVG Data URI watermark overlay
 * Used for dynamic responsive watermarking over preview images
 */
export function generateWatermarkSvg(text: string = "WILDCANVAS PREVIEW"): string {
  const cleanText = text.toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
    <defs>
      <pattern id="wm" width="300" height="200" patternUnits="userSpaceOnUse" patternTransform="rotate(-28 150 100)">
        <text x="150" y="80" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="15" fill="rgba(255,255,255,0.22)" letter-spacing="3">${cleanText}</text>
        <text x="150" y="105" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-weight="500" font-size="10" fill="rgba(255,255,255,0.14)" letter-spacing="4">PROTECTED DIGITAL ASSET</text>
        <line x1="50" y1="120" x2="250" y2="120" stroke="rgba(255,255,255,0.1)" stroke-dasharray="4 4" stroke-width="1"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#wm)" />
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
