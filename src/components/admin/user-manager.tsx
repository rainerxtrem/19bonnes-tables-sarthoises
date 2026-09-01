"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createUserSchema, type CreateUserInput } from "@/lib/validation/auth";
import { Button } from "@/components/ui/button";
import { FormField, Input, Select } from "@/components/ui/field";

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN";
  isActive: boolean;
}

export function UserManager({ initialUsers, currentUserId }: { initialUsers: UserRow[]; currentUserId: string }) {
  const [users, setUsers] = useState(initialUsers);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { name: "", email: "", password: "", role: "ADMIN" },
  });

  async function onSubmit(values: CreateUserInput) {
    setServerError(null);
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setServerError(data.error ?? "Une erreur est survenue.");
      return;
    }
    const { user } = await res.json();
    setUsers((prev) => [...prev, user]);
    reset();
  }

  async function toggleActive(user: UserRow) {
    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !user.isActive }),
    });
    if (res.ok) {
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, isActive: !u.isActive } : u)));
    }
  }

  async function remove(user: UserRow) {
    if (!window.confirm(`Supprimer le compte de ${user.name} ?`)) return;
    const res = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
    if (res.ok) setUsers((prev) => prev.filter((u) => u.id !== user.id));
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white lg:col-span-2">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="px-3 py-2">Nom</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Rôle</th>
              <th className="px-3 py-2">Actif</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-3 py-2 font-medium text-gray-900">{user.name}</td>
                <td className="px-3 py-2">{user.email}</td>
                <td className="px-3 py-2">{user.role === "SUPER_ADMIN" ? "Super admin" : "Admin"}</td>
                <td className="px-3 py-2">
                  <button
                    onClick={() => toggleActive(user)}
                    disabled={user.id === currentUserId}
                    className="text-xs text-brand hover:underline disabled:opacity-40"
                  >
                    {user.isActive ? "Oui" : "Non"}
                  </button>
                </td>
                <td className="px-3 py-2">
                  <button
                    onClick={() => remove(user)}
                    disabled={user.id === currentUserId}
                    className="text-xs text-red-600 hover:underline disabled:opacity-40"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-gray-900">Nouvel administrateur</h2>
        <FormField label="Nom" htmlFor="name" error={errors.name?.message}>
          <Input id="name" {...register("name")} />
        </FormField>
        <FormField label="Email" htmlFor="email" error={errors.email?.message}>
          <Input id="email" type="email" {...register("email")} />
        </FormField>
        <FormField
          label="Mot de passe"
          htmlFor="password"
          hint="Min. 12 caractères, majuscule, minuscule et chiffre."
          error={errors.password?.message}
        >
          <Input id="password" type="password" {...register("password")} />
        </FormField>
        <FormField label="Rôle" htmlFor="role" error={errors.role?.message}>
          <Select id="role" {...register("role")}>
            <option value="ADMIN">Admin (gestion des contenus)</option>
            <option value="SUPER_ADMIN">Super admin (accès total)</option>
          </Select>
        </FormField>
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Création..." : "Créer"}
        </Button>
        {serverError ? <p className="text-sm text-red-600">{serverError}</p> : null}
      </form>
    </div>
  );
}
