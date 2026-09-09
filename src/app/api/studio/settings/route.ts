import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export const runtime = "edge";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || (session.role !== "TENANT_ADMIN" && session.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let tenantId = session.tenantId;
    if (!tenantId && session.role === "SUPER_ADMIN") {
      const firstTenant = await prisma.tenant.findFirst();
      tenantId = firstTenant?.id;
    }

    if (!tenantId) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    return NextResponse.json({ tenant });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "TENANT_ADMIN" && session.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let tenantId = session.tenantId;
    if (!tenantId && session.role === "SUPER_ADMIN") {
      const firstTenant = await prisma.tenant.findFirst();
      tenantId = firstTenant?.id;
    }

    if (!tenantId) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const { name, bio, brandColor, watermarkText, payoutEmail, bannerUrl, logoUrl } = await req.json();

    const updated = await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        name: name || undefined,
        bio: bio !== undefined ? bio : undefined,
        brandColor: brandColor || undefined,
        watermarkText: watermarkText !== undefined ? watermarkText : undefined,
        payoutEmail: payoutEmail !== undefined ? payoutEmail : undefined,
        bannerUrl: bannerUrl !== undefined ? bannerUrl : undefined,
        logoUrl: logoUrl !== undefined ? logoUrl : undefined,
      },
    });

    return NextResponse.json({ success: true, tenant: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
