"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { eventSchema, type EventInput } from "@/lib/validation/event";
import { Button } from "@/components/ui/button";
import { FormField, Input, Select, Textarea } from "@/components/ui/field";
import { MediaPicker, type PickedMedia } from "@/components/admin/media-picker";
import type { Event, Media } from "@prisma/client";

/** Un input datetime-local attend "YYYY-MM-DDTHH:mm" en heure locale — ni
 * `Date#toISOString()` (UTC) ni le format Prisma ne conviennent tels quels. */
function toDatetimeLocal(value: Date | null | undefined): string {
  if (!value) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}T${pad(value.getHours())}:${pad(value.getMinutes())}`;
}

export function EventForm({ event }: { event?: (Event & { mainImage: Media | null }) | null }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [mainImage, setMainImage] = useState<PickedMedia | null>(
    event?.mainImage
      ? { id: event.mainImage.id, url: event.mainImage.url, alt: event.mainImage.alt, filename: event.mainImage.filename }
      : null
  );

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EventInput>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: event?.title ?? "",
      description: event?.description ?? "",
      startAt: event?.startAt ?? new Date(),
      endAt: event?.endAt ?? null,
      location: event?.location ?? "",
      mainImageId: event?.mainImageId ?? null,
      // Le formulaire ne propose jamais SCHEDULED (4e valeur de l'enum
      // Prisma PublishStatus, sans usage ici — pas de champ "scheduledFor"
      // sur Event, contrairement à Article) ; un événement existant n'aura
      // donc jamais ce statut en pratique.
      status: (event?.status as "DRAFT" | "PUBLISHED" | "ARCHIVED" | undefined) ?? "DRAFT",
    },
  });

  const isEdit = Boolean(event);

  async function onSubmit(values: EventInput) {
    setServerError(null);
    const url = isEdit ? `/api/admin/events/${event!.id}` : "/api/admin/events";
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
    router.push("/admin/evenements");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <section className="space-y-4 rounded-lg border border-ink-100 bg-white p-5 lg:col-span-2">
        <FormField label="Titre" htmlFor="title" error={errors.title?.message}>
          <Input id="title" {...register("title")} />
        </FormField>
        <FormField label="Description" htmlFor="description" error={errors.description?.message}>
          <Textarea id="description" rows={6} {...register("description")} />
        </FormField>
        <FormField label="Lieu" htmlFor="location" error={errors.location?.message}>
          <Input id="location" placeholder="Ex : Restaurant Le Grand Cerf, Le Mans" {...register("location")} />
        </FormField>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Début" htmlFor="startAt" error={errors.startAt?.message}>
            <Controller
              control={control}
              name="startAt"
              render={({ field }) => (
                <Input
                  id="startAt"
                  type="datetime-local"
                  value={toDatetimeLocal(field.value)}
                  onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                />
              )}
            />
          </FormField>
          <FormField label="Fin (optionnel)" htmlFor="endAt" error={errors.endAt?.message}>
            <Controller
              control={control}
              name="endAt"
              render={({ field }) => (
                <Input
                  id="endAt"
                  type="datetime-local"
                  value={toDatetimeLocal(field.value)}
                  onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                />
              )}
            />
          </FormField>
        </div>
      </section>

      <section className="space-y-4 rounded-lg border border-ink-100 bg-white p-5 shadow-sm">
        <FormField label="Statut" htmlFor="status" error={errors.status?.message}>
          <Select id="status" {...register("status")}>
            <option value="DRAFT">Brouillon</option>
            <option value="PUBLISHED">Publié</option>
            <option value="ARCHIVED">Archivé</option>
          </Select>
        </FormField>

        <div>
          <p className="mb-2 text-sm font-medium text-ink-700">Image</p>
          {mainImage ? (
            <div className="relative mb-2 aspect-video w-full overflow-hidden rounded-md bg-ink-100">
              <Image src={mainImage.url} alt={mainImage.alt ?? ""} fill className="object-cover" />
            </div>
          ) : null}
          <Button type="button" variant="secondary" size="sm" onClick={() => setPickerOpen(true)}>
            Choisir une image
          </Button>
          <MediaPicker
            open={pickerOpen}
            onClose={() => setPickerOpen(false)}
            onSelect={([media]) => {
              if (!media) return;
              setValue("mainImageId", media.id);
              setMainImage(media);
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
