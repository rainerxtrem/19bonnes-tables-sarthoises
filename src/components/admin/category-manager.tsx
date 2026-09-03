"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { categorySchema, type CategoryInput } from "@/lib/validation/article";
import { Button } from "@/components/ui/button";
import { FormField, Input } from "@/components/ui/field";
import { Pencil, Trash2 } from "lucide-react";
import type { Category } from "@prisma/client";

type CategoryRow = Category & { _count: { articles: number } };

export function CategoryManager({ initialCategories }: { initialCategories: CategoryRow[] }) {
  const [categories, setCategories] = useState(initialCategories);
  const [serverError, setServerError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "", slug: "" },
  });

  async function onSubmit(values: CategoryInput) {
    setServerError(null);
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setServerError(data.error ?? "Une erreur est survenue.");
      return;
    }
    const { category } = await res.json();
    setCategories((prev) => [...prev, { ...category, _count: { articles: 0 } }].sort((a, b) => a.name.localeCompare(b.name)));
    reset();
  }

  function startEdit(category: CategoryRow) {
    setEditingId(category.id);
    setEditingName(category.name);
  }

  async function saveEdit(category: CategoryRow) {
    if (!editingName.trim() || editingName.trim() === category.name) {
      setEditingId(null);
      return;
    }
    const res = await fetch(`/api/admin/categories/${category.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editingName.trim() }),
    });
    if (res.ok) {
      const { category: updated } = await res.json();
      setCategories((prev) =>
        prev.map((c) => (c.id === category.id ? { ...updated, _count: c._count } : c)).sort((a, b) => a.name.localeCompare(b.name))
      );
    }
    setEditingId(null);
  }

  async function remove(category: CategoryRow) {
    const message =
      category._count.articles > 0
        ? `Supprimer "${category.name}" ? ${category._count.articles} article(s) resteront mais sans catégorie.`
        : `Supprimer "${category.name}" ?`;
    if (!window.confirm(message)) return;
    await fetch(`/api/admin/categories/${category.id}`, { method: "DELETE" });
    setCategories((prev) => prev.filter((c) => c.id !== category.id));
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="overflow-hidden rounded-lg border border-ink-100 bg-white shadow-sm lg:col-span-2">
        <table className="w-full text-sm">
          <thead className="border-b border-ink-100 bg-cream-50 text-left text-xs font-medium uppercase tracking-wide text-ink-400">
            <tr>
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Articles</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {categories.map((c) => (
              <tr key={c.id} className="transition-colors hover:bg-cream-50/60">
                <td className="px-4 py-3">
                  {editingId === c.id ? (
                    <input
                      autoFocus
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onBlur={() => saveEdit(c)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEdit(c);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      className="w-full rounded border border-ink-200 px-2 py-1 text-sm"
                    />
                  ) : (
                    <button
                      onClick={() => startEdit(c)}
                      className="inline-flex items-center gap-1.5 text-left font-medium text-ink-900 hover:text-wine-700"
                    >
                      {c.name}
                      <Pencil className="h-3 w-3 text-ink-300" aria-hidden />
                    </button>
                  )}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-ink-500">{c.slug}</td>
                <td className="px-4 py-3 text-ink-500">{c._count.articles}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => remove(c)}
                    title="Supprimer"
                    className="flex h-7 w-7 items-center justify-center rounded-sm text-ink-400 transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {categories.length === 0 ? (
          <p className="p-8 text-center text-sm text-ink-500">Aucune catégorie pour le moment.</p>
        ) : null}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-lg border border-ink-100 bg-white p-5 shadow-sm">
        <h2 className="font-display text-base text-ink-900">Nouvelle catégorie</h2>
        <FormField label="Nom" htmlFor="name" error={errors.name?.message}>
          <Input id="name" {...register("name")} placeholder="Ex. Recettes" />
        </FormField>
        <FormField label="Slug" htmlFor="slug" hint="Laisser vide pour générer automatiquement." error={errors.slug?.message}>
          <Input id="slug" {...register("slug")} />
        </FormField>
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Ajout..." : "Ajouter"}
        </Button>
        {serverError ? <p className="text-sm text-red-600">{serverError}</p> : null}
      </form>
    </div>
  );
}
