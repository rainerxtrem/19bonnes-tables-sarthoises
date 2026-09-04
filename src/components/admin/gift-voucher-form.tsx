"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { adminGiftVoucherCreateSchema, type AdminGiftVoucherCreateInput } from "@/lib/validation/gift-voucher";
import { Button } from "@/components/ui/button";
import { FormField, Input, Textarea } from "@/components/ui/field";

export function GiftVoucherForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdminGiftVoucherCreateInput>({
    resolver: zodResolver(adminGiftVoucherCreateSchema),
    defaultValues: {
      amount: 50,
      buyerName: "",
      buyerEmail: "",
      recipientName: "",
      recipientEmail: "",
      message: "",
      sendEmail: true,
    },
  });

  async function onSubmit(values: AdminGiftVoucherCreateInput) {
    setServerError(null);
    const res = await fetch("/api/admin/gift-vouchers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setServerError(data.error ?? "Une erreur est survenue.");
      return;
    }
    router.push("/admin/bon-cadeaux");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <section className="space-y-4 rounded-lg border border-ink-100 bg-white p-5 lg:col-span-2">
        <FormField label="Montant (€)" htmlFor="amount" error={errors.amount?.message}>
          <Input id="amount" type="number" step="1" min={10} max={500} {...register("amount", { valueAsNumber: true })} />
        </FormField>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Nom de l'acheteur" htmlFor="buyerName" error={errors.buyerName?.message}>
            <Input id="buyerName" {...register("buyerName")} />
          </FormField>
          <FormField label="Email de l'acheteur" htmlFor="buyerEmail" error={errors.buyerEmail?.message}>
            <Input id="buyerEmail" type="email" {...register("buyerEmail")} />
          </FormField>
        </div>

        <p className="pt-2 text-xs font-medium uppercase tracking-wide text-ink-400">
          Bénéficiaire (facultatif — si vide, le bon est associé à l&apos;acheteur)
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Nom du bénéficiaire" htmlFor="recipientName" error={errors.recipientName?.message}>
            <Input id="recipientName" {...register("recipientName")} />
          </FormField>
          <FormField label="Email du bénéficiaire" htmlFor="recipientEmail" error={errors.recipientEmail?.message}>
            <Input id="recipientEmail" type="email" {...register("recipientEmail")} />
          </FormField>
        </div>

        <FormField label="Message personnalisé" htmlFor="message" error={errors.message?.message}>
          <Textarea id="message" rows={3} {...register("message")} />
        </FormField>
      </section>

      <section className="space-y-4 rounded-lg border border-ink-100 bg-white p-5 shadow-sm">
        <p className="text-sm text-ink-600">
          Le code et le QR code sont générés automatiquement. Le bon est actif dès sa création, valable 12 mois.
        </p>

        <label className="flex items-center gap-2 text-sm text-ink-700">
          <input type="checkbox" {...register("sendEmail")} />
          Envoyer l&apos;email immédiatement
        </label>
        <p className="text-xs text-ink-400">
          Sinon, le bon est créé sans envoi — vous pourrez télécharger le PDF ou le renvoyer plus tard depuis la liste.
        </p>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Création..." : "Créer le bon cadeau"}
        </Button>
        {serverError ? <p className="text-sm text-red-600">{serverError}</p> : null}
      </section>
    </form>
  );
}
