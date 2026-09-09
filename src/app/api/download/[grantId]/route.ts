import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateR2DownloadPresignedUrl } from "@/lib/r2";

export const runtime = "edge";

export async function GET(
  req: Request,
  context: { params: { grantId: string } | Promise<{ grantId: string }> }
) {
  try {
    const resolvedParams = await Promise.resolve(context.params);
    const { grantId } = resolvedParams;

    const grant = await prisma.downloadGrant.findFirst({
      where: {
        OR: [{ id: grantId }, { tokenHash: grantId }],
      },
      include: {
        photo: {
          include: { tenant: true },
        },
        orderItem: true,
      },
    });

    if (!grant) {
      return NextResponse.json(
        { error: "Invalid or expired digital licensing token." },
        { status: 404 }
      );
    }

    // Check expiration
    if (new Date() > grant.expiresAt) {
      return NextResponse.json(
        { error: "Licensing download period has expired. Please contact support or the creator." },
        { status: 410 }
      );
    }

    // Check download limit
    if (grant.downloadCount >= grant.maxDownloads) {
      return NextResponse.json(
        { error: `Download limit of ${grant.maxDownloads} downloads exceeded.` },
        { status: 403 }
      );
    }

    // Increment download counter
    await prisma.downloadGrant.update({
      where: { id: grant.id },
      data: {
        downloadCount: { increment: 1 },
        lastDownloadedAt: new Date(),
      },
    });

    // Filename for buyer: e.g. "cheetah-full-stride-serengeti-original.jpg"
    const safeTitle = grant.photo.title.toLowerCase().replace(/[^a-z0-9]/g, "-");
    const filename = `${safeTitle}-original-${grant.orderItem.licenseName.toLowerCase().replace(/[^a-z0-9]/g, "-")}.jpg`;

    // Generate Cloudflare R2 presigned download URL
    const presignedDownloadUrl = await generateR2DownloadPresignedUrl(
      grant.photo.originalKey,
      filename,
      3600 // 1 hour token
    );

    // If R2 is not configured, fall back to streaming or redirecting to high-res source
    if (presignedDownloadUrl.startsWith("/api/download/file")) {
      // Local demo fallback: redirect directly to high-res master URL
      return NextResponse.redirect(grant.photo.originalUrl || grant.photo.previewUrl);
    }

    return NextResponse.redirect(presignedDownloadUrl);
  } catch (err: any) {
    console.error("Download token error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
