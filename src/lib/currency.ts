/**
 * Currency Formatting Utility for WildCanvas India (₹ INR)
 */

export const CURRENCY_SYMBOL = "₹";
export const CURRENCY_CODE = "INR";

/**
 * Format paise into Indian Rupees string (e.g. 99900 -> "₹999", 249900 -> "₹2,499")
 */
export function formatINR(amountInPaise: number): string {
  const rupees = Math.round(amountInPaise) / 100;
  return `₹${rupees.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
    minimumFractionDigits: rupees % 1 === 0 ? 0 : 2,
  })}`;
}

/**
 * Strict two-decimal formatting for invoices and order receipts (e.g. 99900 -> "₹999.00")
 */
export function formatINRPaise(amountInPaise: number): string {
  const rupees = Math.round(amountInPaise) / 100;
  return `₹${rupees.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Convert whole rupees to paise integer for Razorpay
 */
export function toPaise(rupees: number): number {
  return Math.round(rupees * 100);
}
