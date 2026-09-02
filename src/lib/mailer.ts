// Envoi d'emails via l'API HTTP de Resend (https://resend.com), et non via
// SMTP direct : Railway (comme la plupart des hébergeurs PaaS) bloque le
// trafic sortant sur les ports SMTP standards (25/465/587) pour lutter
// contre le spam, ce qui rendait tout envoi impossible depuis l'app
// (timeouts de connexion systématiques, y compris vers des hôtes tiers
// n'ayant rien à voir avec IONOS). L'API Resend passe en HTTPS (port 443),
// jamais bloqué.
const RESEND_API_URL = "https://api.resend.com/emails";

export async function sendMail(params: { to: string; subject: string; text: string; html?: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY non configuré — email non envoyé:", params.subject);
    return;
  }

  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.MAIL_FROM || "no-reply@localhost",
      to: params.to,
      subject: params.subject,
      text: params.text,
      html: params.html,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Échec envoi email via Resend (${response.status}): ${body}`);
  }
}
