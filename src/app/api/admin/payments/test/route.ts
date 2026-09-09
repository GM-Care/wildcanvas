import { NextResponse } from "next/server";
import { testRazorpayConnection } from "@/lib/razorpay";
import { getPaymentSettings } from "@/lib/paymentSettings";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    let { keyId, keySecret } = body;

    // If keySecret is masked or not passed, use the stored secret
    if (!keySecret || keySecret.includes("••••")) {
      const stored = await getPaymentSettings();
      keySecret = stored.keySecret;
    }

    if (!keyId) {
      const stored = await getPaymentSettings();
      keyId = stored.keyId;
    }

    if (!keyId || !keySecret) {
      return NextResponse.json({
        success: false,
        message: "Both Razorpay Key ID and Key Secret are required to test the connection.",
      });
    }

    const testResult = await testRazorpayConnection(keyId, keySecret);
    return NextResponse.json(testResult);
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        message: `Unexpected error testing Razorpay: ${err.message}`,
      },
      { status: 500 }
    );
  }
}
