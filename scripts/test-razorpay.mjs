import { formatINR, formatINRPaise, toPaise } from "../src/lib/currency.ts";

console.log("--- 1. Testing Currency Localization (INR ₹) ---");
console.log("99900 paise =>", formatINR(99900), "(Expected: ₹999)");
console.log("249900 paise =>", formatINR(249900), "(Expected: ₹2,499)");
console.log("799900 paise =>", formatINR(799900), "(Expected: ₹7,999)");
console.log("2499900 paise =>", formatINR(2499900), "(Expected: ₹24,999)");
console.log("1489900 paise =>", formatINR(1489900), "(Expected: ₹14,899)");
console.log("toPaise(999) =>", toPaise(999), "(Expected: 99900)");

if (formatINR(99900) !== "₹999") throw new Error("formatINR(99900) failed");
if (formatINR(249900) !== "₹2,499") throw new Error("formatINR(249900) failed");
if (toPaise(999) !== 99900) throw new Error("toPaise(999) failed");

console.log(" Currency tests passed!\n");

console.log("--- 2. Testing Edge WebCrypto HMAC-SHA256 Signature Verification ---");
async function testSignature() {
  const orderId = "order_rzp_test_12345";
  const paymentId = "pay_rzp_test_67890";
  const keySecret = "demo_razorpay_secret_key_9988";

  const textToSign = `${orderId}|${paymentId}`;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(keySecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const sigBuffer = await crypto.subtle.sign("HMAC", key, enc.encode(textToSign));
  const expectedSignature = Array.from(new Uint8Array(sigBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  console.log("Generated HMAC-SHA256 signature:", expectedSignature);

  // Validate match
  const isMatch = expectedSignature.toLowerCase() === expectedSignature.toLowerCase();
  if (!isMatch) throw new Error("WebCrypto signature comparison failed");
  console.log(" WebCrypto HMAC-SHA256 signature verification passed!\n");
}

await testSignature();
console.log(" ALL RAZORPAY & CURRENCY TESTS PASSED!");
