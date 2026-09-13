import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export const runtime = "edge";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Super Admin access required." }, { status: 401 });
    }

    const tenants = await prisma.tenant.findMany({
      include: {
        owner: {
          select: { name: true, email: true },
        },
        _count: {
          select: { photos: true, orderItems: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ tenants });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Super Admin access required." }, { status: 401 });
    }

    const body = await req.json();
    const { tenantId, action, reason, status, commissionRate } = body;

    if (!tenantId) {
      return NextResponse.json({ error: "tenantId is required" }, { status: 400 });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found." }, { status: 404 });
    }

    let updateData: any = {};

    if (action === "APPROVE_KYC") {
      // Commit pending brand changes to live storefront
      updateData = {
        name: (tenant as any).pendingName || tenant.name,
        logoUrl: (tenant as any).pendingLogoUrl || tenant.logoUrl,
        avatarUrl: (tenant as any).pendingAvatarUrl || (tenant as any).avatarUrl,
        pendingName: null,
        pendingLogoUrl: null,
        pendingAvatarUrl: null,
        kycStatus: "VERIFIED",
        status: "ACTIVE",
        kycReviewedAt: new Date().toISOString(),
        kycRejectReason: null,
      };
    } else if (action === "REJECT_KYC") {
      updateData = {
        kycStatus: "REJECTED",
        kycReviewedAt: new Date().toISOString(),
        kycRejectReason: reason || "KYC / Brand verification failed. Please verify your PAN, Bank details, and official documents.",
      };
    } else {
      if (status !== undefined) updateData.status = status;
      if (commissionRate !== undefined) updateData.commissionRate = Number(commissionRate);
    }

    const updated = await prisma.tenant.update({
      where: { id: tenantId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      tenant: updated,
      message: action === "APPROVE_KYC"
        ? "Merchant Brand & KYC successfully approved and published live!"
        : action === "REJECT_KYC"
        ? "Merchant Brand & KYC rejected with feedback."
        : "Tenant updated successfully.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
