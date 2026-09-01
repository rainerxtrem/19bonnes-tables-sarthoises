"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { partnerSchema, type PartnerInput } from "@/lib/validation/partner";
import { Button } from "@/components/ui/button";
import { FormField, Input, Textarea } from "@/components/ui/field";
import { MediaPicker, type PickedMedia } from "@/components/admin/media-picker";
import type { Partner, Media } from "@prisma/client";

export function PartnerForm({ partner }: { partner?: (Partner & { logo: Media | null }) | null }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [logo, setLogo] = useState<PickedMedia | null>(
    partner?.logo ? { id: partner.logo.id, url: partner.logo.url, alt: partner.logo.alt, filename: partner.logo.filename } : null
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PartnerInput>({
    resolver: zodResolver(partnerSchema),
    defaultValues: {
      name: partner?.name ?? "",
      description: partner?.description ?? "",
      websiteUrl: partner?.websiteUrl ?? "",
      logoId: partner?.logoId ?? null,
      order: partner?.order ?? 0,
      isActive: partner?.isActive ?? true,
    },
  });

  const isEdit = Boolean(partner);

  async function onSubmit(values: PartnerInput) {
    setServerError(null);
    const url = isEdit ? `/api/admin/partners/${partner!.id}` : "/api/admin/partners";
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
    router.push("/admin/partenaires");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-5 lg:col-span-2">
        <FormField label="Nom" htmlFor="name" error={errors.name?.message}>
          <Input id="name" {...register("name")} />
        </FormField>
        <FormField label="Description" htmlFor="description" error={errors.description?.message}>
          <Textarea id="description" rows={4} {...register("description")} />
        </FormField>
        <FormField label="Site web" htmlFor="websiteUrl" error={errors.websiteUrl?.message}>
          <Input id="websiteUrl" {...register("websiteUrl")} />
        </FormField>
      </section>

      <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-5">
        <FormField label="Ordre d'affichage" htmlFor="order" error={errors.order?.message}>
          <Input id="order" type="number" {...register("order", { valueAsNumber: true })} />
        </FormField>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" {...register("isActive")} />
          Actif
        </label>

        <div>
          <p className="mb-2 text-sm font-medium text-gray-700">Logo</p>
          {logo ? (
            <div className="relative mb-2 h-16 w-full">
              <Image src={logo.url} alt={logo.alt ?? ""} fill className="object-contain" />
            </div>
          ) : null}
          <Button type="button" variant="secondary" size="sm" onClick={() => setPickerOpen(true)}>
            Choisir un logo
          </Button>
          <MediaPicker
            open={pickerOpen}
            onClose={() => setPickerOpen(false)}
            onSelect={([media]) => {
              if (!media) return;
              setValue("logoId", media.id);
              setLogo(media);
            }}
          />
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Enregistrement..." : isEdit ? "Enregistrer" : "Créer"}
        </Button>
        {serverError ? <p className="text-sm text-red-600">{serverError}</p> : null}
      </section>
    </form>
  );
}
