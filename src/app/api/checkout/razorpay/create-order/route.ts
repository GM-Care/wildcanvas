import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createRazorpayOrder } from "@/lib/razorpay";
import { getPublicPaymentSettings } from "@/lib/paymentSettings";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    const { items, buyerEmail, buyerName } = await req.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const email = session?.email || buyerEmail;
    const name = session?.name || buyerName || "Art Collector";

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid buyer email is required for licensing delivery." },
        { status: 400 }
      );
    }

    // Calculate total amount in paise (INR)
    const totalAmountPaise = items.reduce((acc, item) => acc + item.priceCents, 0);

    if (totalAmountPaise <= 0) {
      return NextResponse.json({ error: "Invalid cart total amount" }, { status: 400 });
    }

    const orderNumber = `ORD-IN-${Math.floor(1000 + Math.random() * 9000)}`;

    // Create Razorpay order (live API or sandbox simulator)
    const razorpayOrder = await createRazorpayOrder({
      amountPaise: totalAmountPaise,
      receipt: orderNumber,
      notes: {
        buyerEmail: email,
        buyerName: name,
        itemCount: String(items.length),
      },
    });

    const publicSettings = await getPublicPaymentSettings();

    return NextResponse.json({
      success: true,
      orderNumber,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount, // in paise
      currency: "INR",
      isSimulation: razorpayOrder.isSimulation,
      keyId: razorpayOrder.keyId || publicSettings.keyId,
      notes: {
        buyerEmail: email,
        buyerName: name,
      },
    });
  } catch (err: any) {
    console.error("Razorpay create-order error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to initiate Razorpay order" },
      { status: 500 }
    );
  }
}
