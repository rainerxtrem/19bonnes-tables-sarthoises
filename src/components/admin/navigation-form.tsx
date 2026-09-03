"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { navigationItemSchema, type NavigationItemInput } from "@/lib/validation/navigation";
import { Button } from "@/components/ui/button";
import { FormField, Input, Select } from "@/components/ui/field";
import type { NavigationItem } from "@prisma/client";

export function NavigationForm({
  item,
  pages,
  parents,
  onSaved,
}: {
  item?: NavigationItem | null;
  pages: { id: string; title: string; slug: string }[];
  parents: { id: string; label: string }[];
  onSaved: () => void;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<NavigationItemInput>({
    resolver: zodResolver(navigationItemSchema),
    defaultValues: {
      label: item?.label ?? "",
      linkType: item?.linkType ?? "INTERNAL",
      url: item?.url ?? "",
      pageId: item?.pageId ?? null,
      parentId: item?.parentId ?? null,
      order: item?.order ?? 0,
      isActive: item?.isActive ?? true,
      openInNewTab: item?.openInNewTab ?? false,
    },
  });

  const linkType = watch("linkType");
  const isEdit = Boolean(item);

  async function onSubmit(values: NavigationItemInput) {
    setServerError(null);
    const url = isEdit ? `/api/admin/navigation/${item!.id}` : "/api/admin/navigation";
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
    router.refresh();
    onSaved();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-lg border border-ink-100 bg-white p-5 shadow-sm">
      <FormField label="Libellé" htmlFor="label" error={errors.label?.message}>
        <Input id="label" {...register("label")} />
      </FormField>

      <FormField label="Type de lien" htmlFor="linkType" error={errors.linkType?.message}>
        <Select id="linkType" {...register("linkType")}>
          <option value="INTERNAL">Page interne</option>
          <option value="EXTERNAL">Lien externe</option>
        </Select>
      </FormField>

      {linkType === "INTERNAL" ? (
        <>
          <FormField label="Page du CMS" htmlFor="pageId" error={errors.pageId?.message}>
            <Select id="pageId" {...register("pageId")}>
              <option value="">—</option>
              {pages.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} (/{p.slug})
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Ou chemin personnalisé" htmlFor="url" hint="ex. /galerie ou /#contactez-nous" error={errors.url?.message}>
            <Input id="url" {...register("url")} />
          </FormField>
        </>
      ) : (
        <FormField label="URL externe" htmlFor="url" error={errors.url?.message}>
          <Input id="url" {...register("url")} placeholder="https://..." />
        </FormField>
      )}

      <FormField label="Sous-menu de" htmlFor="parentId" error={errors.parentId?.message}>
        <Select id="parentId" {...register("parentId")}>
          <option value="">Aucun (menu principal)</option>
          {parents
            .filter((p) => p.id !== item?.id)
            .map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
        </Select>
      </FormField>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm text-ink-700">
          <input type="checkbox" {...register("isActive")} />
          Actif
        </label>
        <label className="flex items-center gap-2 text-sm text-ink-700">
          <input type="checkbox" {...register("openInNewTab")} />
          Ouvrir dans un nouvel onglet
        </label>
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Enregistrement..." : isEdit ? "Enregistrer" : "Ajouter"}
      </Button>
      {serverError ? <p className="text-sm text-red-600">{serverError}</p> : null}
    </form>
  );
}
