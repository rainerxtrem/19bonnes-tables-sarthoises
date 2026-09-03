"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { pageSchema, type PageInput } from "@/lib/validation/page";
import { Button } from "@/components/ui/button";
import { FormField, Input, Select, Textarea } from "@/components/ui/field";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { MediaPicker, type PickedMedia } from "@/components/admin/media-picker";
import type { Page, Media } from "@prisma/client";

type PageWithRelations = Page & {
  mainImage?: Media | null;
  ogImage?: Media | null;
};

function toPreview(media?: Media | null): PickedMedia | null {
  if (!media) return null;
  return { id: media.id, url: media.url, alt: media.alt, filename: media.filename };
}

export function PageForm({ page }: { page?: PageWithRelations | null }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [mainImagePickerOpen, setMainImagePickerOpen] = useState(false);
  const [ogImagePickerOpen, setOgImagePickerOpen] = useState(false);
  const [mainImagePreview, setMainImagePreview] = useState<PickedMedia | null>(toPreview(page?.mainImage));
  const [ogImagePreview, setOgImagePreview] = useState<PickedMedia | null>(toPreview(page?.ogImage));

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PageInput>({
    resolver: zodResolver(pageSchema),
    defaultValues: {
      title: page?.title ?? "",
      slug: page?.slug ?? "",
      content: page?.content ?? "",
      excerpt: page?.excerpt ?? "",
      mainImageId: page?.mainImageId ?? null,
      ogImageId: page?.ogImageId ?? null,
      status: page?.status ?? "DRAFT",
      seoTitle: page?.seoTitle ?? "",
      seoDescription: page?.seoDescription ?? "",
    },
  });

  const isEdit = Boolean(page);

  async function onSubmit(values: PageInput) {
    setServerError(null);
    const url = isEdit ? `/api/admin/pages/${page!.id}` : "/api/admin/pages";
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
    router.push("/admin/pages");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <section className="space-y-4 rounded-lg border border-ink-100 bg-white p-5 shadow-sm">
          <FormField label="Titre" htmlFor="title" error={errors.title?.message}>
            <Input id="title" {...register("title")} />
          </FormField>
          <FormField
            label="Slug (URL)"
            htmlFor="slug"
            hint="Laisser vide pour générer automatiquement."
            error={errors.slug?.message}
          >
            <Input id="slug" {...register("slug")} disabled={page?.isSystem} />
          </FormField>
          <FormField label="Extrait" htmlFor="excerpt" error={errors.excerpt?.message}>
            <Textarea id="excerpt" rows={2} {...register("excerpt")} />
          </FormField>
          <FormField label="Contenu" htmlFor="content" error={errors.content?.message}>
            <Controller
              control={control}
              name="content"
              render={({ field }) => <RichTextEditor value={field.value} onChange={field.onChange} />}
            />
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
          <FormField label="Statut" htmlFor="status" error={errors.status?.message}>
            <Select id="status" {...register("status")}>
              <option value="DRAFT">Brouillon</option>
              <option value="PUBLISHED">Publié</option>
              <option value="ARCHIVED">Archivé</option>
            </Select>
          </FormField>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Enregistrement..." : isEdit ? "Enregistrer" : "Créer"}
          </Button>
          {serverError ? <p className="text-sm text-red-600">{serverError}</p> : null}
        </section>

        <section className="space-y-3 rounded-lg border border-ink-100 bg-white p-5 shadow-sm">
          <h2 className="font-display text-base text-ink-900">Photo principale</h2>
          <p className="text-xs text-ink-500">
            Pour la page d&apos;accueil, c&apos;est l&apos;image de fond du grand bandeau (hero).
          </p>
          {mainImagePreview ? (
            <div className="relative aspect-video overflow-hidden rounded-md">
              <Image src={mainImagePreview.url} alt={mainImagePreview.alt ?? ""} fill className="object-cover" />
            </div>
          ) : (
            <div className="flex aspect-video items-center justify-center rounded-md bg-cream-100 text-xs text-ink-400">
              Aucune image
            </div>
          )}
          <div className="flex gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => setMainImagePickerOpen(true)}>
              Choisir une image
            </Button>
            {mainImagePreview ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setMainImagePreview(null);
                  setValue("mainImageId", null);
                }}
              >
                Retirer
              </Button>
            ) : null}
          </div>
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
          <h2 className="font-display text-base text-ink-900">Image de partage (Open Graph)</h2>
          <p className="text-xs text-ink-500">
            Utilisée par défaut à la place de la photo principale lors du partage sur les réseaux sociaux.
          </p>
          {ogImagePreview ? (
            <div className="relative aspect-video overflow-hidden rounded-md">
              <Image src={ogImagePreview.url} alt={ogImagePreview.alt ?? ""} fill className="object-cover" />
            </div>
          ) : (
            <div className="flex aspect-video items-center justify-center rounded-md bg-cream-100 text-xs text-ink-400">
              Aucune image
            </div>
          )}
          <div className="flex gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => setOgImagePickerOpen(true)}>
              Choisir une image
            </Button>
            {ogImagePreview ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setOgImagePreview(null);
                  setValue("ogImageId", null);
                }}
              >
                Retirer
              </Button>
            ) : null}
          </div>
          <MediaPicker
            open={ogImagePickerOpen}
            onClose={() => setOgImagePickerOpen(false)}
            onSelect={([media]) => {
              if (!media) return;
              setValue("ogImageId", media.id);
              setOgImagePreview(media);
            }}
          />
        </section>
      </div>
    </form>
  );
}
