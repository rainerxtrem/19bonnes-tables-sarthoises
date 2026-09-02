import { NextResponse, type NextRequest } from "next/server";
import nodemailer from "nodemailer";

// Route de diagnostic temporaire — à supprimer une fois le problème de
// connectivité SMTP sortante depuis Railway résolu. Protégée par un jeton
// partagé (DEBUG_TOKEN) plutôt que par une session admin, pour pouvoir être
// interrogée directement sans passer par un login.
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!process.env.DEBUG_TOKEN || token !== process.env.DEBUG_TOKEN) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const configs = [
    { label: "465 implicit TLS", port: 465, secure: true, requireTLS: false },
    { label: "587 STARTTLS", port: 587, secure: false, requireTLS: true },
    { label: "25 STARTTLS", port: 25, secure: false, requireTLS: true },
  ];

  const results = [];
  for (const config of configs) {
    const start = Date.now();
    try {
      const transporter = nodemailer.createTransport({
        host: "smtp.ionos.fr",
        port: config.port,
        secure: config.secure,
        requireTLS: config.requireTLS,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
        connectionTimeout: 8_000,
        greetingTimeout: 8_000,
        socketTimeout: 8_000,
      });
      await transporter.verify();
      results.push({ config: config.label, success: true, ms: Date.now() - start });
    } catch (error) {
      results.push({
        config: config.label,
        success: false,
        ms: Date.now() - start,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return NextResponse.json({ results });
}
