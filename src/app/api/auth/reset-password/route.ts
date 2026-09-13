import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { verifyResetChallenge, consumeResetChallenge } from "@/lib/passwordResetStore";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { email, otp, token, newPassword } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email address is required." },
        { status: 400 }
      );
    }

    if (!newPassword || typeof newPassword !== "string" || newPassword.trim().length < 4) {
      return NextResponse.json(
        { error: "Password / PIN must be at least 4 characters or digits." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const verificationKey = otp || token;

    if (!verificationKey) {
      return NextResponse.json(
        { error: "Verification code or reset token is required." },
        { status: 400 }
      );
    }

    // Verify OTP or token against challenge store
    const verification = verifyResetChallenge(normalizedEmail, verificationKey);
    if (!verification.valid) {
      return NextResponse.json(
        { error: verification.error || "Invalid or expired verification code." },
        { status: 400 }
      );
    }

    // Hash the new password for security
    const passwordHash = await hashPassword(newPassword.trim());

    // Update user record in database
    await (prisma.user as any).update({
      where: { email: normalizedEmail },
      data: {
        passwordHash,
        pin: newPassword.trim(),
      },
    });

    // Invalidate the reset challenge so it cannot be reused
    consumeResetChallenge(normalizedEmail);

    return NextResponse.json({
      success: true,
      message: "Password / PIN has been reset successfully. You can now sign in with your new credentials.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to reset password." },
      { status: 500 }
    );
  }
}
