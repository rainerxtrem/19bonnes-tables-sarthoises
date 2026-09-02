// Envoi d'emails via l'API HTTP de Resend (https://resend.com), et non via
// SMTP direct : Railway (comme la plupart des hébergeurs PaaS) bloque le
// trafic sortant sur les ports SMTP standards (25/465/587) pour lutter
// contre le spam, ce qui rendait tout envoi impossible depuis l'app
// (timeouts de connexion systématiques, y compris vers des hôtes tiers
// n'ayant rien à voir avec IONOS). L'API Resend passe en HTTPS (port 443),
// jamais bloqué.
const RESEND_API_URL = "https://api.resend.com/emails";
const RESEND_BATCH_URL = "https://api.resend.com/emails/batch";

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

/**
 * Envoi en masse (newsletter) — chaque destinataire reçoit un contenu qui
 * lui est propre (lien de désinscription personnalisé), donc pas un simple
 * "to" à plusieurs adresses. L'API batch de Resend accepte jusqu'à 100
 * emails par requête, on découpe donc en tranches.
 */
export async function sendMailBatch(
  emails: { to: string; subject: string; text: string; html?: string }[]
): Promise<{ sent: number; failed: number }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn(`RESEND_API_KEY non configuré — ${emails.length} email(s) non envoyé(s).`);
    return { sent: 0, failed: emails.length };
  }
  if (emails.length === 0) return { sent: 0, failed: 0 };

  const from = process.env.MAIL_FROM || "no-reply@localhost";
  let sent = 0;
  let failed = 0;

  for (let i = 0; i < emails.length; i += 100) {
    const chunk = emails.slice(i, i + 100).map((e) => ({
      from,
      to: e.to,
      subject: e.subject,
      text: e.text,
      html: e.html,
    }));

    const response = await fetch(RESEND_BATCH_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(chunk),
    });

    if (response.ok) {
      sent += chunk.length;
    } else {
      failed += chunk.length;
      const body = await response.text().catch(() => "");
      console.error(`Échec envoi batch Resend (${response.status}):`, body);
    }
  }

  return { sent, failed };
}
