"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { categorySchema, type CategoryInput } from "@/lib/validation/article";
import { Button } from "@/components/ui/button";
import { FormField, Input } from "@/components/ui/field";
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
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white lg:col-span-2">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="px-3 py-2">Nom</th>
              <th className="px-3 py-2">Slug</th>
              <th className="px-3 py-2">Articles</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categories.map((c) => (
              <tr key={c.id}>
                <td className="px-3 py-2">
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
                      className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                    />
                  ) : (
                    <button onClick={() => startEdit(c)} className="text-left hover:text-brand hover:underline">
                      {c.name}
                    </button>
                  )}
                </td>
                <td className="px-3 py-2 font-mono text-xs text-gray-500">{c.slug}</td>
                <td className="px-3 py-2 text-gray-500">{c._count.articles}</td>
                <td className="px-3 py-2">
                  <button onClick={() => remove(c)} className="text-xs text-red-600 hover:underline">
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {categories.length === 0 ? (
          <p className="p-8 text-center text-sm text-gray-500">Aucune catégorie pour le moment.</p>
        ) : null}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-gray-900">Nouvelle catégorie</h2>
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
