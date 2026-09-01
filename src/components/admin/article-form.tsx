"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { articleSchema, type ArticleInput } from "@/lib/validation/article";
import { Button } from "@/components/ui/button";
import { FormField, Input, Select, Textarea } from "@/components/ui/field";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { MediaPicker, type PickedMedia } from "@/components/admin/media-picker";
import type { Article, Category, Media } from "@prisma/client";

export function ArticleForm({
  article,
  categories,
}: {
  article?: (Article & { mainImage: Media | null }) | null;
  categories: Category[];
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [mainImage, setMainImage] = useState<PickedMedia | null>(
    article?.mainImage
      ? { id: article.mainImage.id, url: article.mainImage.url, alt: article.mainImage.alt, filename: article.mainImage.filename }
      : null
  );

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ArticleInput>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: article?.title ?? "",
      slug: article?.slug ?? "",
      excerpt: article?.excerpt ?? "",
      content: article?.content ?? "",
      categoryId: article?.categoryId ?? null,
      tags: article?.tags ?? [],
      status: article?.status ?? "DRAFT",
      seoTitle: article?.seoTitle ?? "",
      seoDescription: article?.seoDescription ?? "",
    },
  });

  const isEdit = Boolean(article);

  async function onSubmit(values: ArticleInput) {
    setServerError(null);
    const url = isEdit ? `/api/admin/articles/${article!.id}` : "/api/admin/articles";
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
    router.push("/admin/actualites");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-5">
          <FormField label="Titre" htmlFor="title" error={errors.title?.message}>
            <Input id="title" {...register("title")} />
          </FormField>
          <FormField label="Slug" htmlFor="slug" hint="Laisser vide pour générer automatiquement." error={errors.slug?.message}>
            <Input id="slug" {...register("slug")} />
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

        <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-gray-900">Référencement (SEO)</h2>
          <FormField label="Titre SEO" htmlFor="seoTitle" error={errors.seoTitle?.message}>
            <Input id="seoTitle" {...register("seoTitle")} />
          </FormField>
          <FormField label="Meta description" htmlFor="seoDescription" error={errors.seoDescription?.message}>
            <Textarea id="seoDescription" rows={2} {...register("seoDescription")} />
          </FormField>
        </section>
      </div>

      <div className="space-y-6">
        <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-5">
          <FormField label="Statut" htmlFor="status" error={errors.status?.message}>
            <Select id="status" {...register("status")}>
              <option value="DRAFT">Brouillon</option>
              <option value="PUBLISHED">Publié</option>
              <option value="ARCHIVED">Archivé</option>
            </Select>
          </FormField>
          <FormField label="Catégorie" htmlFor="categoryId" error={errors.categoryId?.message}>
            <Select id="categoryId" {...register("categoryId")}>
              <option value="">—</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Tags (séparés par une virgule)" htmlFor="tagsInput">
            <Controller
              control={control}
              name="tags"
              render={({ field }) => (
                <Input
                  id="tagsInput"
                  defaultValue={field.value.join(", ")}
                  onBlur={(e) =>
                    field.onChange(
                      e.target.value
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean)
                    )
                  }
                />
              )}
            />
          </FormField>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Enregistrement..." : isEdit ? "Enregistrer" : "Créer"}
          </Button>
          {serverError ? <p className="text-sm text-red-600">{serverError}</p> : null}
        </section>

        <section className="space-y-3 rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-gray-900">Image principale</h2>
          {mainImage ? (
            <div className="relative aspect-video overflow-hidden rounded-md">
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
        </section>
      </div>
    </form>
  );
}
