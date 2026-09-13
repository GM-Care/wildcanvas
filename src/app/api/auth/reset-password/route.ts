import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { verifyResetTicket } from "@/lib/passwordResetStore";

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

    // Check cookie or passed token for stateless verification across isolates
    const cookieHeader = req.headers.get("cookie") || "";
    const cookieMatch = cookieHeader.match(/wc_reset_ticket=([^;]+)/);
    const cookieToken = cookieMatch ? decodeURIComponent(cookieMatch[1]) : "";
    const effectiveToken = token || cookieToken;

    // Verify OTP or token against stateless ticket
    const verification = await verifyResetTicket(normalizedEmail, verificationKey, effectiveToken);
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

    const response = NextResponse.json({
      success: true,
      message: "Password / PIN has been reset successfully. You can now sign in with your new credentials.",
    });

    // Clear reset ticket cookie
    response.cookies.set("wc_reset_ticket", "", { maxAge: 0, path: "/" });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to reset password." },
      { status: 500 }
    );
  }
}
