import { NextResponse } from "next/server";
import { getPaymentSettings, updatePaymentSettings } from "@/lib/paymentSettings";

export const runtime = "edge";

export async function GET() {
  try {
    const config = await getPaymentSettings();
    return NextResponse.json({
      success: true,
      config: {
        ...config,
        // Mask secret for secure display
        keySecretMasked: config.keySecret
          ? `${config.keySecret.slice(0, 4)}••••••••${config.keySecret.slice(-4)}`
          : "",
        hasSecret: Boolean(config.keySecret),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load payment settings" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { keyId, keySecret, webhookSecret, mode, enabled, autoCapture } = body;

    const updates: Record<string, any> = {};

    if (typeof keyId === "string") updates.keyId = keyId.trim();
    if (typeof mode === "string" && (mode === "test" || mode === "live")) updates.mode = mode;
    if (typeof enabled === "boolean") updates.enabled = enabled;
    if (typeof autoCapture === "boolean") updates.autoCapture = autoCapture;
    if (typeof webhookSecret === "string") updates.webhookSecret = webhookSecret.trim();

    // Only update keySecret if a real value was provided (not masked placeholder)
    if (typeof keySecret === "string" && keySecret.trim() && !keySecret.includes("••••")) {
      updates.keySecret = keySecret.trim();
    }

    const updated = await updatePaymentSettings(updates);

    return NextResponse.json({
      success: true,
      message: "Razorpay payment gateway settings saved successfully",
      config: {
        ...updated,
        keySecretMasked: updated.keySecret
          ? `${updated.keySecret.slice(0, 4)}••••••••${updated.keySecret.slice(-4)}`
          : "",
        hasSecret: Boolean(updated.keySecret),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to save payment settings" },
      { status: 500 }
    );
  }
}
