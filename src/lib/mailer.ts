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
