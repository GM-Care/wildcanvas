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

    const currentTenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!currentTenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const body = await req.json();
    const {
      name,
      bio,
      brandColor,
      watermarkText,
      payoutEmail,
      bannerUrl,
      logoUrl,
      avatarUrl,
      // KYC Fields
      legalName,
      entityType,
      panNumber,
      gstin,
      bankName,
      accountNumber,
      ifscCode,
      accountHolderName,
      kycDocUrl,
    } = body;

    // Detect if brand or KYC changes are being submitted
    const isBrandChanged =
      (name !== undefined && name !== currentTenant.name) ||
      (logoUrl !== undefined && logoUrl !== currentTenant.logoUrl) ||
      (avatarUrl !== undefined && avatarUrl !== (currentTenant as any).avatarUrl);

    const isKycSubmitted =
      legalName !== undefined ||
      panNumber !== undefined ||
      accountNumber !== undefined ||
      ifscCode !== undefined ||
      kycDocUrl !== undefined;

    const requiresApproval = isBrandChanged || isKycSubmitted;

    const updateData: any = {
      bio: bio !== undefined ? bio : currentTenant.bio,
      brandColor: brandColor || currentTenant.brandColor,
      watermarkText: watermarkText !== undefined ? watermarkText : currentTenant.watermarkText,
      payoutEmail: payoutEmail !== undefined ? payoutEmail : currentTenant.payoutEmail,
      bannerUrl: bannerUrl !== undefined ? bannerUrl : currentTenant.bannerUrl,
    };

    if (requiresApproval) {
      // Store proposed brand values in pending fields so live storefront remains stable until approved
      if (name !== undefined) updateData.pendingName = name;
      if (logoUrl !== undefined) updateData.pendingLogoUrl = logoUrl;
      if (avatarUrl !== undefined) updateData.pendingAvatarUrl = avatarUrl;

      // KYC details
      if (legalName !== undefined) updateData.legalName = legalName;
      if (entityType !== undefined) updateData.entityType = entityType;
      if (panNumber !== undefined) updateData.panNumber = (panNumber || "").toUpperCase().trim();
      if (gstin !== undefined) updateData.gstin = (gstin || "").toUpperCase().trim();
      if (bankName !== undefined) updateData.bankName = bankName;
      if (accountNumber !== undefined) updateData.accountNumber = accountNumber;
      if (ifscCode !== undefined) updateData.ifscCode = (ifscCode || "").toUpperCase().trim();
      if (accountHolderName !== undefined) updateData.accountHolderName = accountHolderName;
      if (kycDocUrl !== undefined) updateData.kycDocUrl = kycDocUrl;

      updateData.kycStatus = "PENDING_APPROVAL";
      updateData.status = "PENDING_REVIEW";
      updateData.kycSubmittedAt = new Date().toISOString();
      updateData.kycRejectReason = null;
    } else {
      if (name) updateData.name = name;
      if (logoUrl) updateData.logoUrl = logoUrl;
      if (avatarUrl) updateData.avatarUrl = avatarUrl;
    }

    const updated = await prisma.tenant.update({
      where: { id: tenantId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      pendingApproval: requiresApproval,
      tenant: updated,
      message: requiresApproval
        ? "Your changes have been submitted for Master Admin review and approval."
        : "Studio settings updated successfully.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
