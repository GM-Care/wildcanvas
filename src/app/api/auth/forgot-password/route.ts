import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createResetChallenge } from "@/lib/passwordResetStore";
import { sendEmailViaGmailSmtp, getSmtpSettings } from "@/lib/smtpSettings";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists in database or platform fallback
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: "No account found matching this email address." },
        { status: 404 }
      );
    }

    // Generate ephemeral 6-digit OTP challenge and token
    const challenge = createResetChallenge(normalizedEmail);

    // Resolve base application URL
    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "https://wildcanvas.pages.dev";
    const resetUrl = `${origin}/reset-password?email=${encodeURIComponent(normalizedEmail)}&token=${challenge.token}`;

    const smtpConfig = await getSmtpSettings();

    // Construct high-contrast responsive email
    const subject = `WildCanvas Security: ${challenge.otp} is your verification code`;
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #09090b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f4f4f5;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #09090b; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 540px; background-color: #18181b; border: 1px solid #27272a; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5);">
          <!-- Header Banner -->
          <tr>
            <td style="padding: 28px 32px; background: linear-gradient(135deg, #18181b 0%, #27272a 100%); border-bottom: 1px solid #27272a;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                      Wild<span style="color: #f59e0b;">Canvas</span>
                    </div>
                    <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #a1a1aa; margin-top: 2px;">
                      Multi-Tenant Security Service
                    </div>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; padding: 4px 10px; background-color: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 9999px; font-size: 10px; font-weight: 700; color: #f59e0b; text-transform: uppercase;">
                      Password Reset
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 36px 32px;">
              <h1 style="font-size: 20px; font-weight: 700; color: #ffffff; margin: 0 0 12px 0;">
                Password / PIN Reset Request
              </h1>
              <p style="font-size: 13px; line-height: 1.6; color: #a1a1aa; margin: 0 0 24px 0;">
                We received a request to reset the sign-in password or PIN for your account (<strong style="color: #ffffff;">${normalizedEmail}</strong>). Use the verification code below to authorize this change:
              </p>

              <!-- 6-digit OTP Box -->
              <div style="text-align: center; margin: 28px 0; padding: 20px; background-color: #09090b; border: 1px dashed #f59e0b; border-radius: 14px;">
                <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #a1a1aa; margin-bottom: 6px;">
                  Your 6-Digit Verification PIN
                </div>
                <div style="font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #f59e0b;">
                  ${challenge.otp}
                </div>
                <div style="font-size: 11px; color: #71717a; margin-top: 6px;">
                  Valid for the next 15 minutes
                </div>
              </div>

              <!-- 1-Click Action Button -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="display: inline-block; padding: 14px 28px; background-color: #f59e0b; color: #09090b; font-size: 13px; font-weight: 700; text-decoration: none; border-radius: 12px; box-shadow: 0 4px 14px rgba(245, 158, 11, 0.3);">
                  Reset Password Directly &rarr;
                </a>
              </div>

              <p style="font-size: 12px; line-height: 1.5; color: #71717a; margin: 24px 0 0 0; padding-top: 20px; border-top: 1px solid #27272a;">
                If you did not request a password reset, you can safely ignore this email. Your credentials will remain unchanged.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #09090b; border-top: 1px solid #27272a; text-align: center;">
              <p style="font-size: 11px; color: #71717a; margin: 0;">
                WildCanvas Platform • Automated Security Dispatch • Dispatched via ${smtpConfig.host}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    // Dispatch via Gmail SMTP
    const mailResult = await sendEmailViaGmailSmtp({
      to: normalizedEmail,
      subject,
      html,
    });

    return NextResponse.json({
      success: true,
      message: "A verification code has been dispatched to your email address.",
      email: normalizedEmail,
      simulated: mailResult.simulated || false,
      // Provide OTP in response when in simulation mode so users can test even before SMTP configuration
      previewOtp: mailResult.simulated ? challenge.otp : undefined,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to process forgot password request." },
      { status: 500 }
    );
  }
}
