import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { getPlanById } from "@/lib/storagePlans";
import { StoragePlanId } from "@/types";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "TENANT_ADMIN" && session.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized. Creator access required." }, { status: 401 });
    }

    let tenantId = session.tenantId;
    if (!tenantId && session.role === "SUPER_ADMIN") {
      const firstTenant = await prisma.tenant.findFirst();
      tenantId = firstTenant?.id;
    }

    if (!tenantId) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const { planId, billingCycle = "monthly" } = await req.json();

    const plan = getPlanById(planId as StoragePlanId);
    if (!plan) {
      return NextResponse.json({ error: "Invalid storage plan selected." }, { status: 400 });
    }

    // Apply storage plan and reduced platform commission rate
    const updated = await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        storagePlan: plan.id,
        storageLimitBytes: plan.limitBytes,
        commissionRate: plan.commissionRate,
      } as any,
    });

    return NextResponse.json({
      success: true,
      plan: plan.name,
      storageGB: plan.storageGB,
      commissionRate: plan.commissionRate,
      tenant: updated,
      message: `Successfully upgraded to ${plan.name} (${plan.storageGB} GB Cloudflare R2 Storage)!`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
