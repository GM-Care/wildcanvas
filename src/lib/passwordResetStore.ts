/**
 * Password Reset Challenge Store
 * Edge-compatible ephemeral storage with 15-minute expiration & rate limiting
 */

export interface PasswordResetChallenge {
  email: string;
  otp: string; // 6-digit verification code
  token: string; // Secure URL token for 1-click links
  expiresAt: number;
  attempts: number;
}

// In-memory challenge cache
const resetChallenges = new Map<string, PasswordResetChallenge>();

/**
 * Creates or refreshes a password reset challenge for an email
 */
export function createResetChallenge(email: string): PasswordResetChallenge {
  const normalizedEmail = email.toLowerCase().trim();

  // Generate 6-digit numeric OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Generate URL-safe random token
  const token = Array.from({ length: 32 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join("");

  const challenge: PasswordResetChallenge = {
    email: normalizedEmail,
    otp,
    token,
    expiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes validity
    attempts: 0,
  };

  resetChallenges.set(normalizedEmail, challenge);
  return challenge;
}

/**
 * Validates an OTP code or URL token for an email
 */
export function verifyResetChallenge(
  email: string,
  otpOrToken: string
): { valid: boolean; error?: string } {
  const normalizedEmail = email.toLowerCase().trim();
  const challenge = resetChallenges.get(normalizedEmail);

  if (!challenge) {
    return {
      valid: false,
      error: "No active password reset request found. Please request a new verification code.",
    };
  }

  if (Date.now() > challenge.expiresAt) {
    resetChallenges.delete(normalizedEmail);
    return {
      valid: false,
      error: "The verification code has expired. Please request a new one.",
    };
  }

  if (challenge.attempts >= 5) {
    resetChallenges.delete(normalizedEmail);
    return {
      valid: false,
      error: "Too many failed attempts. Please request a new verification code.",
    };
  }

  const cleanInput = otpOrToken.trim();
  const isMatch = cleanInput === challenge.otp || cleanInput === challenge.token;

  if (!isMatch) {
    challenge.attempts += 1;
    return {
      valid: false,
      error: "Invalid verification code or token. Please check and try again.",
    };
  }

  return { valid: true };
}

/**
 * Consumes the challenge once the password is reset
 */
export function consumeResetChallenge(email: string): void {
  resetChallenges.delete(email.toLowerCase().trim());
}
