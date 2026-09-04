import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { GiftVoucherForm } from "@/components/admin/gift-voucher-form";

export const metadata = { title: "Nouveau bon cadeau | Administration" };

export default function NewGiftVoucherPage() {
  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/bon-cadeaux" className="mb-3 inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-700">
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          Retour aux bons cadeaux
        </Link>
        <h1 className="font-display text-2xl text-ink-900">Nouveau bon cadeau</h1>
        <p className="mt-1 text-sm text-ink-500">Créer un bon cadeau manuellement (remise en main propre, geste commercial…).</p>
      </div>
      <GiftVoucherForm />
    </div>
  );
}
