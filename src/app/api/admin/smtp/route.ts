import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import {
  getSmtpSettings,
  updateSmtpSettings,
  sendEmailViaGmailSmtp,
} from "@/lib/smtpSettings";

export const runtime = "edge";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Super Admin access required." },
        { status: 401 }
      );
    }

    const config = await getSmtpSettings();
    const hasPass = Boolean(config.pass && config.pass.trim().length > 0);

    return NextResponse.json({
      success: true,
      config: {
        host: config.host,
        port: config.port,
        secure: config.secure,
        user: config.user,
        passMasked: hasPass
          ? `${config.pass.slice(0, 3)}••••••••${config.pass.slice(-3)}`
          : "",
        isConfigured: hasPass,
        fromName: config.fromName,
        updatedAt: config.updatedAt,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to retrieve SMTP settings." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Super Admin access required." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { action, user, pass, fromName, host, port, testRecipient } = body;

    // Action: Test Email Connectivity
    if (action === "test") {
      const config = await getSmtpSettings();
      const targetEmail = (testRecipient || user || config.user || "Support@gm-care.in").trim();

      const testResult = await sendEmailViaGmailSmtp({
        to: targetEmail,
        subject: "WildCanvas • Gmail SMTP Connectivity Test",
        html: `
          <div style="font-family: sans-serif; background: #09090b; color: #fff; padding: 24px; border-radius: 12px; border: 1px solid #27272a;">
            <h2 style="color: #f59e0b; margin-top: 0;">WildCanvas SMTP Verified!</h2>
            <p style="color: #a1a1aa; font-size: 14px;">This is an automated test message confirming that your Gmail SMTP connection and App Password are functioning properly on Cloudflare Pages.</p>
            <div style="background: #18181b; padding: 12px; border-radius: 8px; font-family: monospace; font-size: 12px; color: #10b981;">
              Status: Connected (smtp.gmail.com:465 SMTPS)
            </div>
          </div>
        `,
      });

      if (!testResult.success) {
        return NextResponse.json(
          {
            success: false,
            error: testResult.error || "Failed to connect to Gmail SMTP. Verify your App Password.",
          },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: testResult.simulated
          ? "Simulation Mode: Test email logged (Configure App Password to send real emails)."
          : `Test email successfully dispatched to ${targetEmail}!`,
        simulated: testResult.simulated,
      });
    }

    // Action: Update Settings
    const updates: Record<string, any> = {};
    if (typeof user === "string" && user.trim()) updates.user = user.trim();
    if (typeof fromName === "string" && fromName.trim()) updates.fromName = fromName.trim();
    if (typeof host === "string" && host.trim()) updates.host = host.trim();
    if (typeof port === "number") updates.port = port;

    // Only update password if user entered a real value (not masked placeholder)
    if (typeof pass === "string" && pass.trim() && !pass.includes("••••")) {
      updates.pass = pass.trim();
    }

    const updated = await updateSmtpSettings(updates);
    const hasPass = Boolean(updated.pass && updated.pass.trim().length > 0);

    return NextResponse.json({
      success: true,
      message: "Gmail SMTP settings saved successfully.",
      config: {
        host: updated.host,
        port: updated.port,
        secure: updated.secure,
        user: updated.user,
        passMasked: hasPass
          ? `${updated.pass.slice(0, 3)}••••••••${updated.pass.slice(-3)}`
          : "",
        isConfigured: hasPass,
        fromName: updated.fromName,
        updatedAt: updated.updatedAt,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to update SMTP settings." },
      { status: 500 }
    );
  }
}
