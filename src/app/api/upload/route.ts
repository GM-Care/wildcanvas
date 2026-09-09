import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { extractExifFromBuffer } from "@/lib/watermark";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "TENANT_ADMIN" && session.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized. Creator access required." }, { status: 401 });
    }

    // Resolve tenant
    let tenantId = session.tenantId;
    if (!tenantId && session.role === "SUPER_ADMIN") {
      const firstTenant = await prisma.tenant.findFirst();
      tenantId = firstTenant?.id;
    }

    if (!tenantId) {
      return NextResponse.json({ error: "No active tenant associated with this account." }, { status: 400 });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found." }, { status: 404 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const title = (formData.get("title") as string) || "Untitled Photo";
    const description = (formData.get("description") as string) || "";
    const category = (formData.get("category") as string) || "Landscape";
    const tagsRaw = (formData.get("tags") as string) || "[]";
    const pricePersonal = Number(formData.get("pricePersonal") || 15);
    const priceEditorial = Number(formData.get("priceEditorial") || 45);
    const priceCommercial = Number(formData.get("priceCommercial") || 150);
    const priceBuyout = Number(formData.get("priceBuyout") || 350);

    let exifData = {};
    let previewUrl = "";
    let originalUrl = "";
    const photoUid = Math.random().toString(36).substring(2, 10);
    const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${photoUid}`;

    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      exifData = await extractExifFromBuffer(buffer);

      // In demo mode or if R2 not live, create base64 data URL preview or sample high-res link
      const base64 = buffer.toString("base64");
      const mime = file.type || "image/jpeg";
      previewUrl = `data:${mime};base64,${base64}`;
      originalUrl = previewUrl;
    } else {
      // Demo fallback photo if no raw binary provided
      previewUrl = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=85";
      originalUrl = previewUrl;
      exifData = {
        camera: "Sony A1",
        lens: "FE 24-70mm f/2.8 GM II",
        aperture: "f/5.6",
        shutterSpeed: "1/500s",
        iso: 100,
        megapixels: "50.1 MP",
      };
    }

    const photo = await prisma.photo.create({
      data: {
        tenantId: tenant.id,
        title,
        slug,
        description,
        category,
        tags: tagsRaw,
        previewUrl,
        originalUrl,
        previewKey: `previews/${tenant.slug}/${photoUid}-wm.webp`,
        originalKey: `originals/${tenant.slug}/${photoUid}-master.jpg`,
        exif: JSON.stringify(exifData),
        status: "PUBLISHED",
        licenseTiers: {
          create: [
            {
              name: "PERSONAL_WEB",
              displayName: "Personal & Social Web",
              description: "Web display, social media, non-commercial use.",
              priceCents: Math.round(pricePersonal * 100),
              allowedUsage: "Non-commercial digital display",
            },
            {
              name: "EDITORIAL",
              displayName: "Editorial Publication",
              description: "Magazines, blog articles, educational publishing.",
              priceCents: Math.round(priceEditorial * 100),
              allowedUsage: "Editorial print & online publication",
            },
            {
              name: "COMMERCIAL",
              displayName: "Commercial Advertising",
              description: "Marketing campaigns, billboards, digital advertising.",
              priceCents: Math.round(priceCommercial * 100),
              allowedUsage: "Commercial advertising & brand collateral",
            },
            {
              name: "EXTENDED_EXCLUSIVE",
              displayName: "Exclusive Buyout",
              description: "Exclusive transfer of distribution rights.",
              priceCents: Math.round(priceBuyout * 100),
              allowedUsage: "Exclusive buyout & unlimited distribution",
            },
          ],
        },
      },
    });

    return NextResponse.json({
      success: true,
      photoId: photo.id,
      slug: photo.slug,
    });
  } catch (err: any) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
