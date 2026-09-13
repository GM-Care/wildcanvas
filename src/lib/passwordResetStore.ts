import { SignJWT, jwtVerify } from "jose";

const RESET_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "wildcanvas-super-secret-key-change-in-production-2026"
);

export interface ResetTicketData {
  email: string;
  otp: string;
  token: string;
}

/**
 * Creates a stateless, cryptographically signed password reset ticket
 * Expires automatically in 15 minutes and functions across all Cloudflare Edge isolates
 */
export async function createResetTicket(email: string): Promise<ResetTicketData> {
  const normalizedEmail = email.toLowerCase().trim();

  // 6-digit numeric verification PIN
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Sign stateless JWT with 15-minute expiration
  const token = await new SignJWT({
    sub: normalizedEmail,
    email: normalizedEmail,
    otp,
    type: "password_reset",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(RESET_SECRET);

  return { email: normalizedEmail, otp, token };
}

/**
 * Validates the verification PIN or direct token against the cryptographic ticket
 */
export async function verifyResetTicket(
  email: string,
  otpOrToken: string,
  ticketToken?: string
): Promise<{ valid: boolean; error?: string }> {
  const normalizedEmail = email.toLowerCase().trim();
  const tokenToVerify = ticketToken || (otpOrToken.split(".").length === 3 ? otpOrToken : null);

  if (!tokenToVerify) {
    return {
      valid: false,
      error: "No active verification token provided. Please request a new verification code.",
    };
  }

  try {
    const { payload } = await jwtVerify(tokenToVerify, RESET_SECRET, {
      algorithms: ["HS256"],
    });

    const tokenEmail = ((payload.email as string) || (payload.sub as string) || "").toLowerCase().trim();
    if (tokenEmail !== normalizedEmail) {
      return {
        valid: false,
        error: "Verification token does not match this account email address.",
      };
    }

    // If an OTP was submitted alongside the token, ensure the OTP matches the payload
    if (otpOrToken && otpOrToken !== tokenToVerify) {
      const submittedOtp = otpOrToken.trim();
      const expectedOtp = payload.otp as string;
      if (submittedOtp !== expectedOtp) {
        return {
          valid: false,
          error: "Invalid 6-digit verification PIN. Please verify and try again.",
        };
      }
    }

    return { valid: true };
  } catch (err: any) {
    if (err?.code === "ERR_JWT_EXPIRED") {
      return {
        valid: false,
        error: "The verification code or link has expired. Please request a new code.",
      };
    }
    return {
      valid: false,
      error: "Invalid or tampered verification token.",
    };
  }
}
