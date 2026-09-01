"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { galleryAlbumSchema, type GalleryAlbumInput } from "@/lib/validation/gallery";
import { Button } from "@/components/ui/button";
import { FormField, Input, Select, Textarea } from "@/components/ui/field";
import type { GalleryAlbum } from "@prisma/client";

export function GalleryAlbumForm({
  album,
  restaurants,
}: {
  album?: GalleryAlbum | null;
  restaurants: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<GalleryAlbumInput>({
    resolver: zodResolver(galleryAlbumSchema),
    defaultValues: {
      title: album?.title ?? "",
      slug: album?.slug ?? "",
      description: album?.description ?? "",
      restaurantId: album?.restaurantId ?? null,
      order: album?.order ?? 0,
    },
  });

  const isEdit = Boolean(album);

  async function onSubmit(values: GalleryAlbumInput) {
    setServerError(null);
    const url = isEdit ? `/api/admin/gallery/albums/${album!.id}` : "/api/admin/gallery/albums";
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
    if (isEdit) {
      router.refresh();
    } else {
      const { album: created } = await res.json();
      router.push(`/admin/galerie/${created.id}`);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-lg border border-gray-200 bg-white p-5">
      <FormField label="Titre" htmlFor="title" error={errors.title?.message}>
        <Input id="title" {...register("title")} />
      </FormField>
      <FormField label="Slug" htmlFor="slug" hint="Laisser vide pour générer automatiquement." error={errors.slug?.message}>
        <Input id="slug" {...register("slug")} />
      </FormField>
      <FormField label="Description" htmlFor="description" error={errors.description?.message}>
        <Textarea id="description" rows={2} {...register("description")} />
      </FormField>
      <FormField label="Restaurant associé" htmlFor="restaurantId" error={errors.restaurantId?.message}>
        <Select id="restaurantId" {...register("restaurantId")}>
          <option value="">—</option>
          {restaurants.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </Select>
      </FormField>
      <FormField label="Ordre d'affichage" htmlFor="order" error={errors.order?.message}>
        <Input id="order" type="number" {...register("order", { valueAsNumber: true })} />
      </FormField>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Enregistrement..." : isEdit ? "Enregistrer" : "Créer l'album"}
      </Button>
      {serverError ? <p className="text-sm text-red-600">{serverError}</p> : null}
    </form>
  );
}
