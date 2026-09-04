"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createUserSchema, type CreateUserInput } from "@/lib/validation/auth";
import { Button } from "@/components/ui/button";
import { FormField, Input, Select } from "@/components/ui/field";
import { cn } from "@/lib/utils/cn";
import { Trash2 } from "lucide-react";

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN" | "RESTAURATEUR" | "TRESORIER";
  isActive: boolean;
  restaurantId: string | null;
  restaurant: { name: string } | null;
}

interface RestaurantOption {
  id: string;
  name: string;
}

const ROLE_LABELS: Record<UserRow["role"], string> = {
  SUPER_ADMIN: "Super admin",
  ADMIN: "Admin",
  RESTAURATEUR: "Restaurateur",
  TRESORIER: "Trésorier",
};

export function UserManager({
  initialUsers,
  restaurants,
  currentUserId,
}: {
  initialUsers: UserRow[];
  restaurants: RestaurantOption[];
  currentUserId: string;
}) {
  const [users, setUsers] = useState(initialUsers);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { name: "", email: "", password: "", role: "ADMIN", restaurantId: null },
  });

  const selectedRole = watch("role");

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
      <div className="overflow-hidden rounded-lg border border-ink-100 bg-white shadow-sm lg:col-span-2">
        <table className="w-full text-sm">
          <thead className="border-b border-ink-100 bg-cream-50 text-left text-xs font-medium uppercase tracking-wide text-ink-400">
            <tr>
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Rôle</th>
              <th className="px-4 py-3">Restaurant</th>
              <th className="px-4 py-3">Actif</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {users.map((user) => (
              <tr key={user.id} className="transition-colors hover:bg-cream-50/60">
                <td className="px-4 py-3 font-medium text-ink-900">{user.name}</td>
                <td className="px-4 py-3 text-ink-700">{user.email}</td>
                <td className="px-4 py-3 text-ink-700">{ROLE_LABELS[user.role]}</td>
                <td className="px-4 py-3 text-ink-500">{user.restaurant?.name ?? "—"}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleActive(user)}
                    disabled={user.id === currentUserId}
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors disabled:opacity-40",
                      user.isActive ? "bg-green-100 text-green-800 hover:bg-green-200" : "bg-ink-100 text-ink-500 hover:bg-ink-200"
                    )}
                  >
                    {user.isActive ? "Oui" : "Non"}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => remove(user)}
                    disabled={user.id === currentUserId}
                    title="Supprimer"
                    className="flex h-7 w-7 items-center justify-center rounded-sm text-ink-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-lg border border-ink-100 bg-white p-5 shadow-sm">
        <h2 className="font-display text-lg text-ink-900">Nouveau compte</h2>
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
            <option value="RESTAURATEUR">Restaurateur (une seule fiche)</option>
            <option value="TRESORIER">Trésorier (versements bons cadeaux)</option>
          </Select>
        </FormField>
        {selectedRole === "RESTAURATEUR" ? (
          <FormField
            label="Restaurant géré"
            htmlFor="restaurantId"
            hint="Le compte ne pourra modifier que ce restaurant, depuis /mon-restaurant."
            error={errors.restaurantId?.message}
          >
            <Select id="restaurantId" {...register("restaurantId")}>
              <option value="">Sélectionner...</option>
              {restaurants.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </Select>
          </FormField>
        ) : null}
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Création..." : "Créer"}
        </Button>
        {serverError ? <p className="text-sm text-red-600">{serverError}</p> : null}
      </form>
    </div>
  );
}
