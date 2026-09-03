import { NextResponse, type NextRequest } from "next/server";
import { getStripeClient } from "@/lib/stripe";
import { activateVoucherFromCheckout } from "@/lib/services/gift-voucher.service";

export async function POST(request: NextRequest) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    console.error("Webhook Stripe : signature ou secret manquant.");
    return NextResponse.json({ error: "Configuration manquante" }, { status: 400 });
  }

  // Le corps brut (non parsé) est indispensable à la vérification de
  // signature Stripe — .text() plutôt que .json() pour ne pas le modifier.
  const rawBody = await request.text();

  let event;
  try {
    const stripe = getStripeClient();
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    console.error("Webhook Stripe : signature invalide.", error);
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const paymentIntentId = typeof session.payment_intent === "string" ? session.payment_intent : null;
    await activateVoucherFromCheckout(session.id, paymentIntentId);
  }

  return NextResponse.json({ received: true });
}
