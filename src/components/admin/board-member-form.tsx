"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { boardMemberSchema, type BoardMemberInput } from "@/lib/validation/board-member";
import { Button } from "@/components/ui/button";
import { FormField, Input, Select, Textarea } from "@/components/ui/field";
import { MediaPicker, type PickedMedia } from "@/components/admin/media-picker";
import type { BoardMember, Media } from "@prisma/client";

export function BoardMemberForm({
  member,
  restaurants,
}: {
  member?: (BoardMember & { photo: Media | null }) | null;
  restaurants: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [photo, setPhoto] = useState<PickedMedia | null>(
    member?.photo ? { id: member.photo.id, url: member.photo.url, alt: member.photo.alt, filename: member.photo.filename } : null
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BoardMemberInput>({
    resolver: zodResolver(boardMemberSchema),
    defaultValues: {
      firstName: member?.firstName ?? "",
      lastName: member?.lastName ?? "",
      role: member?.role ?? "",
      restaurantId: member?.restaurantId ?? null,
      photoId: member?.photoId ?? null,
      bio: member?.bio ?? "",
      order: member?.order ?? 0,
      isActive: member?.isActive ?? true,
    },
  });

  const isEdit = Boolean(member);

  async function onSubmit(values: BoardMemberInput) {
    setServerError(null);
    const url = isEdit ? `/api/admin/board-members/${member!.id}` : "/api/admin/board-members";
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
    router.push("/admin/bureau");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-5 lg:col-span-2">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Prénom" htmlFor="firstName" error={errors.firstName?.message}>
            <Input id="firstName" {...register("firstName")} />
          </FormField>
          <FormField label="Nom" htmlFor="lastName" error={errors.lastName?.message}>
            <Input id="lastName" {...register("lastName")} />
          </FormField>
        </div>
        <FormField label="Fonction" htmlFor="role" error={errors.role?.message}>
          <Input id="role" {...register("role")} placeholder="ex. Président de l'association" />
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
        <FormField
          label="Description / mot"
          htmlFor="bio"
          hint="Pour le président, ce texte est mis en avant sur la page Bureau sous le titre « Mot du président »."
          error={errors.bio?.message}
        >
          <Textarea id="bio" rows={4} {...register("bio")} />
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
          <p className="mb-2 text-sm font-medium text-gray-700">Photo</p>
          {photo ? (
            <div className="relative mb-2 aspect-square w-24 overflow-hidden rounded-full">
              <Image src={photo.url} alt={photo.alt ?? ""} fill className="object-cover" />
            </div>
          ) : null}
          <Button type="button" variant="secondary" size="sm" onClick={() => setPickerOpen(true)}>
            Choisir une photo
          </Button>
          <MediaPicker
            open={pickerOpen}
            onClose={() => setPickerOpen(false)}
            onSelect={([media]) => {
              if (!media) return;
              setValue("photoId", media.id);
              setPhoto(media);
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
