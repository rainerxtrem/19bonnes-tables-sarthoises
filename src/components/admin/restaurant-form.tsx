"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { restaurantSchema, type RestaurantInput } from "@/lib/validation/restaurant";
import { Button } from "@/components/ui/button";
import { FormField, Input, Select, Textarea } from "@/components/ui/field";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { MediaPicker, type PickedMedia } from "@/components/admin/media-picker";
import {
  OpeningHoursEditor,
  defaultOpeningHours,
  type OpeningDay,
} from "@/components/admin/opening-hours-editor";
import type { RestaurantWithRelations } from "@/lib/services/restaurant.service";

function toFormDefaults(restaurant?: RestaurantWithRelations | null): RestaurantInput {
  return {
    name: restaurant?.name ?? "",
    slug: restaurant?.slug ?? "",
    shortDescription: restaurant?.shortDescription ?? "",
    description: restaurant?.description ?? "",
    address: restaurant?.address ?? "",
    postalCode: restaurant?.postalCode ?? "",
    city: restaurant?.city ?? "",
    latitude: restaurant?.latitude ?? null,
    longitude: restaurant?.longitude ?? null,
    phone: restaurant?.phone ?? "",
    email: restaurant?.email ?? "",
    website: restaurant?.website ?? "",
    googleMapsUrl: restaurant?.googleMapsUrl ?? "",
    facebookUrl: restaurant?.facebookUrl ?? "",
    instagramUrl: restaurant?.instagramUrl ?? "",
    openingHours: (restaurant?.openingHours as OpeningDay[] | null) ?? defaultOpeningHours(),
    priceLunch: restaurant?.priceLunch ?? "",
    priceDinner: restaurant?.priceDinner ?? "",
    additionalInfo: restaurant?.additionalInfo ?? "",
    mainImageId: restaurant?.mainImageId ?? null,
    ogImageId: restaurant?.ogImageId ?? null,
    order: restaurant?.order ?? 0,
    isFeatured: restaurant?.isFeatured ?? false,
    status: restaurant?.status ?? "DRAFT",
    seoTitle: restaurant?.seoTitle ?? "",
    seoDescription: restaurant?.seoDescription ?? "",
    galleryMediaIds: restaurant?.images.map((i) => i.mediaId) ?? [],
  };
}

export function RestaurantForm({
  restaurant,
  mode = "admin",
  redirectTo = "/admin/restaurants",
}: {
  restaurant?: RestaurantWithRelations | null;
  /** "owner" masque les champs de curation réservés à l'association (ordre
   * d'affichage, mise en avant) — utilisé par /mon-restaurant. */
  mode?: "admin" | "owner";
  redirectTo?: string;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [mainImagePickerOpen, setMainImagePickerOpen] = useState(false);
  const [galleryPickerOpen, setGalleryPickerOpen] = useState(false);
  const [mainImagePreview, setMainImagePreview] = useState<PickedMedia | null>(
    restaurant?.mainImage
      ? { id: restaurant.mainImage.id, url: restaurant.mainImage.url, alt: restaurant.mainImage.alt, filename: restaurant.mainImage.filename }
      : null
  );
  const [galleryPreview, setGalleryPreview] = useState<PickedMedia[]>(
    restaurant?.images.map((i) => ({
      id: i.media.id,
      url: i.media.url,
      alt: i.media.alt,
      filename: i.media.filename,
    })) ?? []
  );

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RestaurantInput>({
    resolver: zodResolver(restaurantSchema),
    defaultValues: toFormDefaults(restaurant),
  });

  const isEdit = Boolean(restaurant);

  async function onSubmit(values: RestaurantInput) {
    setServerError(null);
    const url = isEdit ? `/api/admin/restaurants/${restaurant!.id}` : "/api/admin/restaurants";
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

    router.push(redirectTo);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <section className="space-y-4 rounded-lg border border-ink-100 bg-white p-5 shadow-sm">
          <h2 className="font-display text-base text-ink-900">Informations générales</h2>
          <FormField label="Nom du restaurant" htmlFor="name" error={errors.name?.message}>
            <Input id="name" {...register("name")} />
          </FormField>
          <FormField
            label="Slug (URL)"
            htmlFor="slug"
            hint="Laisser vide pour générer automatiquement depuis le nom."
            error={errors.slug?.message}
          >
            <Input id="slug" {...register("slug")} placeholder="ex. le-cheval-blanc" />
          </FormField>
          <FormField label="Description courte" htmlFor="shortDescription" error={errors.shortDescription?.message}>
            <Textarea id="shortDescription" rows={2} {...register("shortDescription")} />
          </FormField>
          <FormField label="Description complète" htmlFor="description" error={errors.description?.message}>
            <Controller
              control={control}
              name="description"
              render={({ field }) => (
                <RichTextEditor value={field.value ?? ""} onChange={field.onChange} />
              )}
            />
          </FormField>
        </section>

        <section className="space-y-4 rounded-lg border border-ink-100 bg-white p-5 shadow-sm">
          <h2 className="font-display text-base text-ink-900">Coordonnées</h2>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Adresse" htmlFor="address" error={errors.address?.message}>
              <Input id="address" {...register("address")} />
            </FormField>
            <FormField label="Code postal" htmlFor="postalCode" error={errors.postalCode?.message}>
              <Input id="postalCode" {...register("postalCode")} />
            </FormField>
            <FormField label="Ville" htmlFor="city" error={errors.city?.message}>
              <Input id="city" {...register("city")} />
            </FormField>
            <FormField
              label="Latitude"
              htmlFor="latitude"
              hint="Position sur la carte interactive — pré-remplie automatiquement, à corriger seulement si la punaise est mal placée."
              error={errors.latitude?.message}
            >
              <Input id="latitude" type="number" step="any" {...register("latitude")} placeholder="ex. 47.9958" />
            </FormField>
            <FormField label="Longitude" htmlFor="longitude" error={errors.longitude?.message}>
              <Input id="longitude" type="number" step="any" {...register("longitude")} placeholder="ex. 0.1988" />
            </FormField>
            <FormField label="Téléphone" htmlFor="phone" error={errors.phone?.message}>
              <Input id="phone" {...register("phone")} />
            </FormField>
            <FormField label="Email" htmlFor="email" error={errors.email?.message}>
              <Input id="email" type="email" {...register("email")} />
            </FormField>
            <FormField label="Site web" htmlFor="website" error={errors.website?.message}>
              <Input id="website" {...register("website")} />
            </FormField>
            <FormField label="Google Maps" htmlFor="googleMapsUrl" error={errors.googleMapsUrl?.message}>
              <Input id="googleMapsUrl" {...register("googleMapsUrl")} />
            </FormField>
            <FormField label="Facebook" htmlFor="facebookUrl" error={errors.facebookUrl?.message}>
              <Input id="facebookUrl" {...register("facebookUrl")} />
            </FormField>
            <FormField label="Instagram" htmlFor="instagramUrl" error={errors.instagramUrl?.message}>
              <Input id="instagramUrl" {...register("instagramUrl")} />
            </FormField>
          </div>
        </section>

        <section className="space-y-4 rounded-lg border border-ink-100 bg-white p-5 shadow-sm">
          <h2 className="font-display text-base text-ink-900">Horaires</h2>
          <Controller
            control={control}
            name="openingHours"
            render={({ field }) => (
              <OpeningHoursEditor value={field.value ?? defaultOpeningHours()} onChange={field.onChange} />
            )}
          />
        </section>

        <section className="space-y-4 rounded-lg border border-ink-100 bg-white p-5 shadow-sm">
          <h2 className="font-display text-base text-ink-900">Tarifs & informations complémentaires</h2>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Tarif midi" htmlFor="priceLunch" error={errors.priceLunch?.message}>
              <Input id="priceLunch" {...register("priceLunch")} placeholder="ex. 19€" />
            </FormField>
            <FormField label="Tarif soir" htmlFor="priceDinner" error={errors.priceDinner?.message}>
              <Input id="priceDinner" {...register("priceDinner")} placeholder="ex. 45€" />
            </FormField>
          </div>
          <FormField label="Informations supplémentaires" htmlFor="additionalInfo" error={errors.additionalInfo?.message}>
            <Textarea id="additionalInfo" rows={3} {...register("additionalInfo")} />
          </FormField>
        </section>

        <section className="space-y-4 rounded-lg border border-ink-100 bg-white p-5 shadow-sm">
          <h2 className="font-display text-base text-ink-900">Référencement (SEO)</h2>
          <FormField label="Titre SEO" htmlFor="seoTitle" error={errors.seoTitle?.message}>
            <Input id="seoTitle" {...register("seoTitle")} />
          </FormField>
          <FormField label="Meta description" htmlFor="seoDescription" error={errors.seoDescription?.message}>
            <Textarea id="seoDescription" rows={2} {...register("seoDescription")} />
          </FormField>
        </section>
      </div>

      <div className="space-y-6">
        <section className="space-y-4 rounded-lg border border-ink-100 bg-white p-5 shadow-sm">
          <h2 className="font-display text-base text-ink-900">Publication</h2>
          <FormField label="Statut" htmlFor="status" error={errors.status?.message}>
            <Select id="status" {...register("status")}>
              <option value="DRAFT">Brouillon</option>
              <option value="PUBLISHED">Publié</option>
              <option value="ARCHIVED">Archivé</option>
            </Select>
          </FormField>
          {mode === "admin" ? (
            <>
              <FormField label="Ordre d'affichage" htmlFor="order" error={errors.order?.message}>
                <Input id="order" type="number" {...register("order", { valueAsNumber: true })} />
              </FormField>
              <label className="flex items-center gap-2 text-sm text-ink-700">
                <input type="checkbox" {...register("isFeatured")} />
                Restaurant mis en avant
              </label>
            </>
          ) : null}
          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Enregistrement..." : isEdit ? "Enregistrer" : "Créer"}
            </Button>
          </div>
          {serverError ? <p className="text-sm text-red-600">{serverError}</p> : null}
        </section>

        <section className="space-y-3 rounded-lg border border-ink-100 bg-white p-5 shadow-sm">
          <h2 className="font-display text-base text-ink-900">Photo principale</h2>
          {mainImagePreview ? (
            <div className="relative aspect-video overflow-hidden rounded-md">
              <Image src={mainImagePreview.url} alt={mainImagePreview.alt ?? ""} fill className="object-cover" />
            </div>
          ) : (
            <div className="flex aspect-video items-center justify-center rounded-md bg-cream-100 text-xs text-ink-400">
              Aucune image
            </div>
          )}
          <Button type="button" variant="secondary" size="sm" onClick={() => setMainImagePickerOpen(true)}>
            Choisir une image
          </Button>
          <MediaPicker
            open={mainImagePickerOpen}
            onClose={() => setMainImagePickerOpen(false)}
            onSelect={([media]) => {
              if (!media) return;
              setValue("mainImageId", media.id);
              setMainImagePreview(media);
            }}
          />
        </section>

        <section className="space-y-3 rounded-lg border border-ink-100 bg-white p-5 shadow-sm">
          <h2 className="font-display text-base text-ink-900">Galerie du restaurant</h2>
          <div className="grid grid-cols-3 gap-2">
            {galleryPreview.map((item) => (
              <div key={item.id} className="relative aspect-square overflow-hidden rounded-md">
                <Image src={item.url} alt={item.alt ?? ""} fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    const next = galleryPreview.filter((g) => g.id !== item.id);
                    setGalleryPreview(next);
                    setValue(
                      "galleryMediaIds",
                      next.map((g) => g.id)
                    );
                  }}
                  className="absolute right-1 top-1 rounded-full bg-black/60 px-1.5 text-xs text-white"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <Button type="button" variant="secondary" size="sm" onClick={() => setGalleryPickerOpen(true)}>
            Ajouter des photos
          </Button>
          <MediaPicker
            open={galleryPickerOpen}
            multiple
            onClose={() => setGalleryPickerOpen(false)}
            onSelect={(media) => {
              const merged = [...galleryPreview, ...media.filter((m) => !galleryPreview.some((g) => g.id === m.id))];
              setGalleryPreview(merged);
              setValue(
                "galleryMediaIds",
                merged.map((g) => g.id)
              );
            }}
          />
        </section>
      </div>
    </form>
  );
}
