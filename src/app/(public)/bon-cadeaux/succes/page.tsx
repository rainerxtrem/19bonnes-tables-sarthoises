import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Clock, Mail } from "lucide-react";
import { getVoucherByCode } from "@/lib/services/gift-voucher.service";
import { Reveal } from "@/components/public/reveal";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata: Metadata = buildMetadata({
  title: "Merci pour votre achat",
  description: "Confirmation d'achat d'un bon cadeau.",
  path: "/bon-cadeaux/succes",
});

export default async function GiftVoucherSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;
  const voucher = code ? await getVoucherByCode(code) : null;

  return (
    <section className="border-b border-ink-900/10 bg-cream-100 py-20 sm:py-28">
      <div className="container text-center">
        <Reveal>
          <p className="eyebrow justify-center">Bon cadeau</p>
        </Reveal>
        <Reveal delay={80}>
          {voucher?.status === "ACTIVE" ? (
            <>
              <CheckCircle2 className="mx-auto mt-4 h-10 w-10 text-wine-700" aria-hidden />
              <h1 className="mx-auto mt-4 max-w-xl font-display text-3xl text-ink-900 sm:text-4xl">
                Merci pour votre achat !
              </h1>
              <p className="mx-auto mt-4 max-w-md text-ink-600">
                Votre bon cadeau de <strong>{(voucher.amountCents / 100).toFixed(2)} €</strong> a été envoyé par
                email {voucher.recipientEmail ? `à ${voucher.recipientEmail}` : `à ${voucher.buyerEmail}`}.
              </p>
              <p className="mx-auto mt-2 flex items-center justify-center gap-1.5 text-sm text-ink-500">
                <Mail className="h-4 w-4" aria-hidden />
                Pensez à vérifier vos spams si vous ne le voyez pas rapidement.
              </p>
            </>
          ) : (
            <>
              <Clock className="mx-auto mt-4 h-10 w-10 text-gold-600" aria-hidden />
              <h1 className="mx-auto mt-4 max-w-xl font-display text-3xl text-ink-900 sm:text-4xl">
                Paiement en cours de confirmation
              </h1>
              <p className="mx-auto mt-4 max-w-md text-ink-600">
                Votre paiement a bien été reçu. Le bon cadeau vous sera envoyé par email d&apos;ici quelques
                instants.
              </p>
            </>
          )}
        </Reveal>
        <Reveal delay={160}>
          <Link href="/" className="link-sweep mt-6 inline-flex items-center gap-2 text-sm text-wine-700">
            Retour à l&apos;accueil
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
