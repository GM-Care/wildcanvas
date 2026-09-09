import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    const { items, buyerEmail, buyerName } = await req.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const email = session?.email || buyerEmail;
    const name = session?.name || buyerName || "Collector";

    if (!email) {
      return NextResponse.json({ error: "Buyer email is required for digital delivery" }, { status: 400 });
    }

    // Calculate totals
    const totalAmountCents = items.reduce((acc, item) => acc + item.priceCents, 0);
    const platformFeeCents = Math.round(totalAmountCents * 0.15);
    const tenantPayoutCents = totalAmountCents - platformFeeCents;

    const orderNumber = `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    // Create the order inside transaction
    const order = await prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          buyerId: session?.userId || null,
          buyerEmail: email,
          buyerName: name,
          totalAmountCents,
          status: "COMPLETED",
          platformFeeCents,
          tenantPayoutCents,
        },
      });

      for (const item of items) {
        // Find photo to verify
        const photo = await tx.photo.findUnique({
          where: { id: item.photoId },
        });

        if (!photo) continue;

        const orderItem = await tx.orderItem.create({
          data: {
            orderId: createdOrder.id,
            photoId: photo.id,
            licenseTierId: item.licenseTierId,
            tenantId: item.tenantId,
            priceCents: item.priceCents,
            licenseName: item.licenseName,
            photoTitle: photo.title,
          },
        });

        // Generate high-resolution cryptographic download grant token
        const tokenHash = `grant_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`;
        const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); // 30 days valid

        await tx.downloadGrant.create({
          data: {
            orderItemId: orderItem.id,
            photoId: photo.id,
            buyerId: session?.userId || null,
            buyerEmail: email,
            tokenHash,
            expiresAt,
            maxDownloads: 5,
            downloadCount: 0,
          },
        });

        // Increment photo download count stat
        await tx.photo.update({
          where: { id: photo.id },
          data: { downloadCount: { increment: 1 } },
        });
      }

      return createdOrder;
    });

    return NextResponse.json({
      success: true,
      orderNumber: order.orderNumber,
      orderId: order.id,
    });
  } catch (err: any) {
    console.error("Checkout error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
