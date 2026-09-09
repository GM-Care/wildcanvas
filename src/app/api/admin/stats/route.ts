import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { isR2Configured } from "@/lib/r2";

export const runtime = "edge";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [
      totalTenants,
      totalPhotos,
      orders,
      totalUsers,
    ] = await Promise.all([
      prisma.tenant.count(),
      prisma.photo.count(),
      prisma.order.findMany({
        where: { status: "COMPLETED" },
        select: {
          totalAmountCents: true,
          platformFeeCents: true,
          tenantPayoutCents: true,
        },
      }),
      prisma.user.count(),
    ]);

    const totalGmvCents = orders.reduce((acc, o) => acc + o.totalAmountCents, 0);
    const totalPlatformFeeCents = orders.reduce((acc, o) => acc + o.platformFeeCents, 0);
    const totalCreatorPayoutsCents = orders.reduce((acc, o) => acc + o.tenantPayoutCents, 0);

    return NextResponse.json({
      stats: {
        totalGmvCents,
        totalPlatformFeeCents,
        totalCreatorPayoutsCents,
        totalTenants,
        totalPhotos,
        totalUsers,
        totalOrders: orders.length,
        r2Connected: isR2Configured,
        r2BucketName: process.env.CLOUDFLARE_R2_BUCKET_NAME || "wildcanvas-storage",
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
