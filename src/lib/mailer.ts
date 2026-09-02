import nodemailer from "nodemailer";

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  if (transporter) return transporter;
  if (!process.env.SMTP_HOST) return null;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
      : undefined,
    // Sans ces bornes, une connexion SMTP qui traîne peut rester ouverte
    // indéfiniment et bloquer l'action serveur appelante (le formulaire
    // reste alors grisé sur "Envoi..." sans jamais se débloquer).
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 10_000,
  });
  return transporter;
}

export async function sendMail(params: { to: string; subject: string; text: string; html?: string }) {
  const client = getTransporter();
  if (!client) {
    console.warn("SMTP non configuré — email non envoyé:", params.subject);
    return;
  }

  await client.sendMail({
    from: process.env.SMTP_FROM || "no-reply@localhost",
    to: params.to,
    subject: params.subject,
    text: params.text,
    html: params.html,
  });
}
