"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { faqItemSchema, type FaqItemInput } from "@/lib/validation/faq";
import { Button } from "@/components/ui/button";
import { FormField, Input, Textarea } from "@/components/ui/field";
import type { FaqItem } from "@prisma/client";

export function FaqForm({ item }: { item?: FaqItem | null }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FaqItemInput>({
    resolver: zodResolver(faqItemSchema),
    defaultValues: {
      question: item?.question ?? "",
      answer: item?.answer ?? "",
      order: item?.order ?? 0,
      isActive: item?.isActive ?? true,
    },
  });

  const isEdit = Boolean(item);

  async function onSubmit(values: FaqItemInput) {
    setServerError(null);
    const url = isEdit ? `/api/admin/faq/${item!.id}` : "/api/admin/faq";
    const res = await fetch(url, {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setServerError(data.error ?? "Une erreur est survenue.");
      return;
    }
    router.push("/admin/faq");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <section className="space-y-4 rounded-lg border border-ink-100 bg-white p-5 lg:col-span-2">
        <FormField label="Question" htmlFor="question" error={errors.question?.message}>
          <Input id="question" {...register("question")} />
        </FormField>
        <FormField label="Réponse" htmlFor="answer" error={errors.answer?.message}>
          <Textarea id="answer" rows={8} {...register("answer")} />
        </FormField>
      </section>

      <section className="space-y-4 rounded-lg border border-ink-100 bg-white p-5 shadow-sm">
        <FormField label="Ordre d'affichage" htmlFor="order" error={errors.order?.message}>
          <Input id="order" type="number" {...register("order", { valueAsNumber: true })} />
        </FormField>
        <label className="flex items-center gap-2 text-sm text-ink-700">
          <input type="checkbox" {...register("isActive")} />
          Visible sur le site
        </label>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Enregistrement..." : isEdit ? "Enregistrer" : "Créer"}
        </Button>
        {serverError ? <p className="text-sm text-red-600">{serverError}</p> : null}
      </section>
    </form>
  );
}
