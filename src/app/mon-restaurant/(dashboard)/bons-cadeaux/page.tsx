import type { Metadata } from "next";
import { GiftVoucherScanner } from "@/components/restaurateur/gift-voucher-scanner";

export const metadata: Metadata = { title: "Bons cadeaux" };

export default function RestaurateurGiftVouchersPage() {
  return (
    <div className="mx-auto max-w-lg">
      <h1 className="font-display text-2xl text-ink-900">Valider un bon cadeau</h1>
      <p className="mt-1 text-sm text-ink-500">
        Un bon cadeau des 19 Bonnes Tables Sarthoises est utilisable dans n&apos;importe lequel des restaurants
        membres. Scannez le QR code présenté par le client, ou saisissez le code manuellement.
      </p>
      <div className="mt-6">
        <GiftVoucherScanner />
      </div>
    </div>
  );
}
