"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { redirectSchema, type RedirectInput } from "@/lib/validation/redirect";
import { Button } from "@/components/ui/button";
import { FormField, Input, Select } from "@/components/ui/field";
import type { Redirect } from "@prisma/client";

export function RedirectManager({ initialRedirects }: { initialRedirects: Redirect[] }) {
  const router = useRouter();
  const [redirects, setRedirects] = useState(initialRedirects);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RedirectInput>({
    resolver: zodResolver(redirectSchema),
    defaultValues: { fromPath: "", toPath: "", statusCode: 301, isActive: true },
  });

  async function onSubmit(values: RedirectInput) {
    setServerError(null);
    const res = await fetch("/api/admin/redirects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setServerError(data.error ?? "Une erreur est survenue.");
      return;
    }
    const { redirect } = await res.json();
    setRedirects((prev) => [redirect, ...prev]);
    reset();
  }

  async function toggleActive(redirect: Redirect) {
    await fetch(`/api/admin/redirects/${redirect.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fromPath: redirect.fromPath,
        toPath: redirect.toPath,
        statusCode: redirect.statusCode,
        isActive: !redirect.isActive,
      }),
    });
    setRedirects((prev) => prev.map((r) => (r.id === redirect.id ? { ...r, isActive: !r.isActive } : r)));
    router.refresh();
  }

  async function remove(redirect: Redirect) {
    if (!window.confirm(`Supprimer la redirection ${redirect.fromPath} ?`)) return;
    await fetch(`/api/admin/redirects/${redirect.id}`, { method: "DELETE" });
    setRedirects((prev) => prev.filter((r) => r.id !== redirect.id));
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white lg:col-span-2">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="px-3 py-2">Depuis</th>
              <th className="px-3 py-2">Vers</th>
              <th className="px-3 py-2">Code</th>
              <th className="px-3 py-2">Actif</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {redirects.map((r) => (
              <tr key={r.id}>
                <td className="px-3 py-2 font-mono text-xs">{r.fromPath}</td>
                <td className="px-3 py-2 font-mono text-xs">{r.toPath}</td>
                <td className="px-3 py-2">{r.statusCode}</td>
                <td className="px-3 py-2">
                  <button onClick={() => toggleActive(r)} className="text-xs text-brand hover:underline">
                    {r.isActive ? "Oui" : "Non"}
                  </button>
                </td>
                <td className="px-3 py-2">
                  <button onClick={() => remove(r)} className="text-xs text-red-600 hover:underline">
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {redirects.length === 0 ? <p className="p-8 text-center text-sm text-gray-500">Aucune redirection.</p> : null}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-gray-900">Nouvelle redirection</h2>
        <FormField label="Depuis (ancienne URL)" htmlFor="fromPath" hint="Doit commencer par /" error={errors.fromPath?.message}>
          <Input id="fromPath" {...register("fromPath")} placeholder="/ancienne-page" />
        </FormField>
        <FormField label="Vers (nouvelle URL)" htmlFor="toPath" error={errors.toPath?.message}>
          <Input id="toPath" {...register("toPath")} placeholder="/nouvelle-page" />
        </FormField>
        <FormField label="Code HTTP" htmlFor="statusCode" error={errors.statusCode?.message}>
          <Select id="statusCode" {...register("statusCode", { valueAsNumber: true })}>
            <option value={301}>301 — Permanent</option>
            <option value={302}>302 — Temporaire</option>
          </Select>
        </FormField>
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Ajout..." : "Ajouter"}
        </Button>
        {serverError ? <p className="text-sm text-red-600">{serverError}</p> : null}
      </form>
    </div>
  );
}
