/**
 * Gmail SMTP Configuration & Native Edge Protocol Mailer
 * 
 * Supports:
 * - Cloudflare Workers Edge runtime via direct TLS sockets (cloudflare:sockets)
 * - Node.js local runtime via tls.connect
 * - Safe simulated mode when credentials are not yet configured
 */

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  fromName: string;
  updatedAt: string;
}

export interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  fromName?: string;
}

export interface SendMailResult {
  success: boolean;
  simulated?: boolean;
  messageId?: string;
  error?: string;
}

// Global in-memory configuration store
let inMemorySmtpConfig: SmtpConfig = {
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  user: (process.env.GMAIL_USER || "Support@gm-care.in").trim(),
  pass: (process.env.GMAIL_APP_PASSWORD || "").replace(/\s+/g, ""),
  fromName: "WildCanvas Security",
  updatedAt: new Date().toISOString(),
};

export async function getSmtpSettings(): Promise<SmtpConfig> {
  return inMemorySmtpConfig;
}

export async function updateSmtpSettings(
  updates: Partial<SmtpConfig>
): Promise<SmtpConfig> {
  inMemorySmtpConfig = {
    ...inMemorySmtpConfig,
    ...updates,
    host: updates.host ? updates.host.trim() : inMemorySmtpConfig.host,
    user: updates.user ? updates.user.trim() : inMemorySmtpConfig.user,
    pass: updates.pass ? updates.pass.replace(/\s+/g, "") : inMemorySmtpConfig.pass,
    fromName: updates.fromName ? updates.fromName.trim() : inMemorySmtpConfig.fromName,
    updatedAt: new Date().toISOString(),
  };
  return inMemorySmtpConfig;
}

/**
 * Sends an email via Gmail SMTP using SMTPS (port 465 SSL/TLS)
 */
export async function sendEmailViaGmailSmtp(options: SendMailOptions): Promise<SendMailResult> {
  const config = await getSmtpSettings();
  const { to, subject, html, text, fromName = config.fromName } = options;
  const user = config.user;
  const pass = config.pass;

  // If no Gmail App Password is configured, operate in safe simulation mode
  if (!pass || pass.trim().length === 0) {
    console.log(`[SMTP SIMULATOR] Email to <${to}>: "${subject}"`);
    console.log(`[SMTP SIMULATOR] Gmail App Password not yet configured in Admin Portal.`);
    return {
      success: true,
      simulated: true,
      messageId: `sim_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    };
  }

  const cleanPass = pass.replace(/\s+/g, "");
  const boundary = `----=_Part_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  const messageId = `<${Date.now()}.${Math.random().toString(36).substring(2, 10)}@${config.host}>`;

  // Build RFC 5322 compliant message
  const rawEmail = [
    `From: "${fromName}" <${user}>`,
    `To: <${to}>`,
    `Subject: ${subject}`,
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: ${messageId}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    ``,
    `--${boundary}`,
    `Content-Type: text/plain; charset=utf-8`,
    `Content-Transfer-Encoding: 7bit`,
    ``,
    text || html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
    ``,
    `--${boundary}`,
    `Content-Type: text/html; charset=utf-8`,
    `Content-Transfer-Encoding: 7bit`,
    ``,
    html,
    ``,
    `--${boundary}--`,
    ``,
  ].join("\r\n");

  try {
    // 1. Check for Cloudflare Workers direct TLS sockets
    let cfConnect: any = null;
    try {
      // Dynamic import to support edge bundling without node bundler errors
      // @ts-ignore
      const cfSockets: any = await import("cloudflare:sockets");
      cfConnect = cfSockets?.connect;
    } catch {
      // cloudflare:sockets not present in local node
    }

    if (cfConnect) {
      return await sendViaCloudflareSocket({
        connect: cfConnect,
        host: config.host,
        port: config.port,
        user,
        pass: cleanPass,
        from: user,
        to,
        rawEmail,
        messageId,
      });
    }

    // 2. Check for Node.js tls.connect
    let nodeTls: any = null;
    try {
      // @ts-ignore
      nodeTls = await import("tls");
    } catch {
      // tls not present in edge
    }

    if (nodeTls && nodeTls.connect) {
      return await sendViaNodeTls({
        tls: nodeTls,
        host: config.host,
        port: config.port,
        user,
        pass: cleanPass,
        from: user,
        to,
        rawEmail,
        messageId,
      });
    }

    // Fallback if neither socket mechanism is supported in the current container
    console.warn("[SMTP] Neither cloudflare:sockets nor node:tls available. Running simulated send.");
    return {
      success: true,
      simulated: true,
      messageId,
    };
  } catch (err: any) {
    console.error("[SMTP ERROR] Failed to deliver email via Gmail SMTP:", err);
    return {
      success: false,
      error: err.message || "Failed to communicate with Gmail SMTP server.",
    };
  }
}

/**
 * Implementation over Cloudflare Workers cloudflare:sockets
 */
async function sendViaCloudflareSocket(args: {
  connect: any;
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
  to: string;
  rawEmail: string;
  messageId: string;
}): Promise<SendMailResult> {
  const socket = args.connect(
    { hostname: args.host, port: args.port },
    { secureTransport: "on" }
  );

  const writer = socket.writable.getWriter();
  const reader = socket.readable.getReader();
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  let buffer = "";

  async function readLine(): Promise<string> {
    while (!buffer.includes("\r\n")) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
    }
    const idx = buffer.indexOf("\r\n");
    if (idx !== -1) {
      const line = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 2);
      return line;
    }
    const rem = buffer;
    buffer = "";
    return rem;
  }

  async function sendCommand(cmd: string) {
    await writer.write(encoder.encode(cmd + "\r\n"));
  }

  try {
    // 1. Initial greeting
    const greet = await readLine();
    if (!greet.startsWith("220")) throw new Error(`SMTP Greeting failed: ${greet}`);

    // 2. EHLO
    await sendCommand("EHLO wildcanvas.pages.dev");
    let ehloResp = await readLine();
    while (ehloResp.startsWith("250-")) {
      ehloResp = await readLine();
    }
    if (!ehloResp.startsWith("250")) throw new Error(`EHLO failed: ${ehloResp}`);

    // 3. AUTH LOGIN
    await sendCommand("AUTH LOGIN");
    const authPrompt1 = await readLine();
    if (!authPrompt1.startsWith("334")) throw new Error(`AUTH LOGIN rejected: ${authPrompt1}`);

    // Username in Base64
    await sendCommand(btoa(args.user));
    const authPrompt2 = await readLine();
    if (!authPrompt2.startsWith("334")) throw new Error(`Username rejected: ${authPrompt2}`);

    // Password in Base64
    await sendCommand(btoa(args.pass));
    const authSuccess = await readLine();
    if (!authSuccess.startsWith("235")) throw new Error(`Authentication failed: ${authSuccess}`);

    // 4. MAIL FROM
    await sendCommand(`MAIL FROM:<${args.from}>`);
    const mailResp = await readLine();
    if (!mailResp.startsWith("250")) throw new Error(`MAIL FROM rejected: ${mailResp}`);

    // 5. RCPT TO
    await sendCommand(`RCPT TO:<${args.to}>`);
    const rcptResp = await readLine();
    if (!rcptResp.startsWith("250")) throw new Error(`RCPT TO rejected: ${rcptResp}`);

    // 6. DATA
    await sendCommand("DATA");
    const dataPrompt = await readLine();
    if (!dataPrompt.startsWith("354")) throw new Error(`DATA rejected: ${dataPrompt}`);

    // Send payload followed by \r\n.\r\n
    await writer.write(encoder.encode(args.rawEmail + "\r\n.\r\n"));
    const dataResp = await readLine();
    if (!dataResp.startsWith("250")) throw new Error(`Message delivery rejected: ${dataResp}`);

    // 7. QUIT
    await sendCommand("QUIT");
    await readLine().catch(() => {});

    return {
      success: true,
      messageId: args.messageId,
    };
  } finally {
    try {
      writer.releaseLock();
      reader.releaseLock();
      await socket.close();
    } catch {}
  }
}

/**
 * Implementation over Node.js tls.connect
 */
async function sendViaNodeTls(args: {
  tls: any;
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
  to: string;
  rawEmail: string;
  messageId: string;
}): Promise<SendMailResult> {
  return new Promise((resolve, reject) => {
    const socket = args.tls.connect(args.port, args.host, { rejectUnauthorized: true }, () => {
      let step = 0;
      let buffer = "";

      socket.on("data", (data: any) => {
        buffer += data.toString();
        const lines = buffer.split("\r\n");
        if (lines.length > 1) {
          buffer = lines.pop() || "";
          for (const line of lines) {
            if (!line.trim()) continue;
            handleLine(line);
          }
        }
      });

      function send(cmd: string) {
        socket.write(cmd + "\r\n");
      }

      function handleLine(line: string) {
        if (step === 0 && line.startsWith("220")) {
          step = 1;
          send("EHLO wildcanvas.pages.dev");
        } else if (step === 1 && line.startsWith("250 ")) {
          step = 2;
          send("AUTH LOGIN");
        } else if (step === 2 && line.startsWith("334")) {
          step = 3;
          send(Buffer.from(args.user).toString("base64"));
        } else if (step === 3 && line.startsWith("334")) {
          step = 4;
          send(Buffer.from(args.pass).toString("base64"));
        } else if (step === 4 && line.startsWith("235")) {
          step = 5;
          send(`MAIL FROM:<${args.from}>`);
        } else if (step === 5 && line.startsWith("250")) {
          step = 6;
          send(`RCPT TO:<${args.to}>`);
        } else if (step === 6 && line.startsWith("250")) {
          step = 7;
          send("DATA");
        } else if (step === 7 && line.startsWith("354")) {
          step = 8;
          socket.write(args.rawEmail + "\r\n.\r\n");
        } else if (step === 8 && line.startsWith("250")) {
          step = 9;
          send("QUIT");
          socket.end();
          resolve({ success: true, messageId: args.messageId });
        } else if (line.startsWith("4") || line.startsWith("5")) {
          socket.end();
          reject(new Error(`SMTP Error: ${line}`));
        }
      }
    });

    socket.on("error", reject);
    socket.setTimeout(15000, () => {
      socket.destroy();
      reject(new Error("SMTP connection timed out after 15s."));
    });
  });
}
