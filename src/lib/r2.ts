import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const R2_ACCOUNT_ID = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME || "wildcanvas-storage";
const R2_PUBLIC_DOMAIN = process.env.CLOUDFLARE_R2_PUBLIC_DOMAIN || "";

export const isR2Configured = Boolean(
  R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY
);

// Cloudflare R2 S3-compatible client
export const r2Client = isR2Configured
  ? new S3Client({
      region: "auto",
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID!,
        secretAccessKey: R2_SECRET_ACCESS_KEY!,
      },
    })
  : null;

/**
 * Generate a Presigned Upload URL for direct-to-R2 client uploads.
 * This ensures the client browser uploads multi-megabyte photo originals directly to Cloudflare R2,
 * completely bypassing Next.js server limits and egress costs.
 */
export async function generateR2UploadPresignedUrl(
  key: string,
  contentType: string,
  expiresInSeconds: number = 900 // 15 mins
): Promise<{ uploadUrl: string; key: string; isR2: boolean }> {
  if (!isR2Configured || !r2Client) {
    // Local / Dev Fallback: Direct endpoint
    return {
      uploadUrl: `/api/upload/local?key=${encodeURIComponent(key)}`,
      key,
      isR2: false,
    };
  }

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(r2Client, command, {
    expiresIn: expiresInSeconds,
  });

  return { uploadUrl, key, isR2: true };
}

/**
 * Generate a time-expiring signed download URL for purchased high-resolution originals.
 * Enforces security: only authorized buyers with valid download grants can download.
 */
export async function generateR2DownloadPresignedUrl(
  key: string,
  filename?: string,
  expiresInSeconds: number = 3600 // 1 hour
): Promise<string> {
  if (!isR2Configured || !r2Client) {
    // Local emulation fallback
    return `/api/download/file?key=${encodeURIComponent(key)}&fn=${encodeURIComponent(filename || "photo.jpg")}`;
  }

  const command = new GetObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    ResponseContentDisposition: filename
      ? `attachment; filename="${filename}"`
      : "attachment",
  });

  return await getSignedUrl(r2Client, command, {
    expiresIn: expiresInSeconds,
  });
}

/**
 * Get the public CDN URL for watermarked preview images.
 */
export function getPublicPreviewUrl(key: string, fallbackUrl?: string): string {
  if (fallbackUrl && (fallbackUrl.startsWith("http://") || fallbackUrl.startsWith("https://"))) {
    return fallbackUrl;
  }
  if (R2_PUBLIC_DOMAIN) {
    const cleanDomain = R2_PUBLIC_DOMAIN.replace(/\/$/, "");
    return `${cleanDomain}/${key}`;
  }
  return fallbackUrl || `/api/preview/${encodeURIComponent(key)}`;
}
