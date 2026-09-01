"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { pageSchema, type PageInput } from "@/lib/validation/page";
import { Button } from "@/components/ui/button";
import { FormField, Input, Select, Textarea } from "@/components/ui/field";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import type { Page } from "@prisma/client";

export function PageForm({ page }: { page?: Page | null }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PageInput>({
    resolver: zodResolver(pageSchema),
    defaultValues: {
      title: page?.title ?? "",
      slug: page?.slug ?? "",
      content: page?.content ?? "",
      excerpt: page?.excerpt ?? "",
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
        <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-5">
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
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Enregistrement..." : isEdit ? "Enregistrer" : "Créer"}
          </Button>
          {serverError ? <p className="text-sm text-red-600">{serverError}</p> : null}
        </section>
      </div>
    </form>
  );
}
