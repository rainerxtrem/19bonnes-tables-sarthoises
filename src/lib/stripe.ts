import Stripe from "stripe";

let client: Stripe | null = null;

/**
 * Contrairement à mailer.ts (qui accepte de ne rien faire si SMTP/Resend
 * n'est pas configuré), un paiement ne peut pas échouer "silencieusement" :
 * on lève une erreur claire si la clé n'est pas définie, plutôt que de
 * laisser un client payer dans le vide.
 */
export function getStripeClient(): Stripe {
  if (client) return client;
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY non configurée — paiement indisponible.");
  }
  client = new Stripe(process.env.STRIPE_SECRET_KEY);
  return client;
}
