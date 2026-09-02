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
    { label: "IONOS 465 implicit TLS", host: "smtp.ionos.fr", port: 465, secure: true, requireTLS: false, auth: true },
    { label: "IONOS 587 STARTTLS", host: "smtp.ionos.fr", port: 587, secure: false, requireTLS: true, auth: true },
    { label: "IONOS 25 STARTTLS", host: "smtp.ionos.fr", port: 25, secure: false, requireTLS: true, auth: true },
    // Hôte tiers connu pour être joignable, sans authentification (on
    // s'attend à un échec d'auth mais PAS à un timeout) — permet de
    // distinguer un blocage réseau général de Railway d'un problème
    // spécifique à IONOS (ex. filtrage anti-spam par plage d'IP cloud).
    { label: "Gmail 587 (sans auth valide)", host: "smtp.gmail.com", port: 587, secure: false, requireTLS: true, auth: false },
  ];

  const results = [];
  for (const config of configs) {
    const start = Date.now();
    try {
      const transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        requireTLS: config.requireTLS,
        auth: config.auth ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } : undefined,
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
