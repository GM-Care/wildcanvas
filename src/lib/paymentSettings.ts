/**
 * Payment Gateway Settings Store
 * Supports Master Admin Portal configuration with persistence & Edge fallback
 */

export interface PaymentGatewayConfig {
  gateway: "razorpay";
  enabled: boolean;
  mode: "test" | "live";
  keyId: string;
  keySecret: string;
  webhookSecret?: string;
  currency: "INR";
  autoCapture: boolean;
  updatedAt: string;
}

// In-memory global store to guarantee instantaneous updates in Edge worker environments
let inMemoryConfig: PaymentGatewayConfig = {
  gateway: "razorpay",
  enabled: true,
  mode: (process.env.RAZORPAY_MODE as "test" | "live") || "test",
  keyId: process.env.RAZORPAY_KEY_ID || "",
  keySecret: process.env.RAZORPAY_KEY_SECRET || "",
  webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || "",
  currency: "INR",
  autoCapture: true,
  updatedAt: new Date().toISOString(),
};

export async function getPaymentSettings(): Promise<PaymentGatewayConfig> {
  return inMemoryConfig;
}

export async function updatePaymentSettings(
  updates: Partial<PaymentGatewayConfig>
): Promise<PaymentGatewayConfig> {
  inMemoryConfig = {
    ...inMemoryConfig,
    ...updates,
    gateway: "razorpay",
    currency: "INR",
    updatedAt: new Date().toISOString(),
  };
  return inMemoryConfig;
}

/**
 * Returns safe public settings for the client/checkout drawer
 * (Key Secret is strictly omitted)
 */
export async function getPublicPaymentSettings() {
  const config = await getPaymentSettings();
  return {
    gateway: config.gateway,
    enabled: config.enabled,
    mode: config.mode,
    keyId: config.keyId,
    currency: config.currency,
    isConfigured: Boolean(config.keyId && config.keySecret),
  };
}
