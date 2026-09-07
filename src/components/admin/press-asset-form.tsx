"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { pressAssetSchema, type PressAssetInput } from "@/lib/validation/press-asset";
import { Button } from "@/components/ui/button";
import { FormField, Input, Textarea } from "@/components/ui/field";
import { MediaPicker, type PickedMedia } from "@/components/admin/media-picker";
import type { PressAsset, Media } from "@prisma/client";

export function PressAssetForm({ asset }: { asset?: (PressAsset & { media: Media }) | null }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [media, setMedia] = useState<PickedMedia | null>(
    asset?.media ? { id: asset.media.id, url: asset.media.url, alt: asset.media.alt, filename: asset.media.filename } : null
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PressAssetInput>({
    resolver: zodResolver(pressAssetSchema),
    defaultValues: {
      label: asset?.label ?? "",
      description: asset?.description ?? "",
      mediaId: asset?.mediaId ?? "",
      order: asset?.order ?? 0,
      isActive: asset?.isActive ?? true,
    },
  });

  const isEdit = Boolean(asset);

  async function onSubmit(values: PressAssetInput) {
    setServerError(null);
    const url = isEdit ? `/api/admin/press-assets/${asset!.id}` : "/api/admin/press-assets";
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
    router.push("/admin/presse");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <section className="space-y-4 rounded-lg border border-ink-100 bg-white p-5 lg:col-span-2">
        <FormField label="Libellé" htmlFor="label" hint="Ex. « Logo couleur (PNG) », « Photo — bureau 2026 »" error={errors.label?.message}>
          <Input id="label" {...register("label")} />
        </FormField>
        <FormField label="Description" htmlFor="description" error={errors.description?.message}>
          <Textarea id="description" rows={3} {...register("description")} />
        </FormField>

        <div>
          <p className="mb-2 text-sm font-medium text-ink-700">Fichier</p>
          {media ? (
            <div className="relative mb-2 aspect-video w-full max-w-xs overflow-hidden rounded-md bg-ink-100">
              <Image src={media.url} alt={media.alt ?? ""} fill className="object-contain" />
            </div>
          ) : null}
          <Button type="button" variant="secondary" size="sm" onClick={() => setPickerOpen(true)}>
            {media ? "Changer le fichier" : "Choisir un fichier"}
          </Button>
          {errors.mediaId ? <p className="mt-1.5 text-sm text-red-600">{errors.mediaId.message}</p> : null}
          <MediaPicker
            open={pickerOpen}
            onClose={() => setPickerOpen(false)}
            onSelect={([picked]) => {
              if (!picked) return;
              setValue("mediaId", picked.id, { shouldValidate: true });
              setMedia(picked);
            }}
          />
        </div>
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
          {isSubmitting ? "Enregistrement..." : isEdit ? "Enregistrer" : "Ajouter"}
        </Button>
        {serverError ? <p className="text-sm text-red-600">{serverError}</p> : null}
      </section>
    </form>
  );
}
