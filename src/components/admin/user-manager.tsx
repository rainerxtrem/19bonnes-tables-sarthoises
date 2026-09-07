"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createUserSchema,
  adminEditUserSchema,
  type CreateUserInput,
  type AdminEditUserInput,
} from "@/lib/validation/auth";
import { Button } from "@/components/ui/button";
import { FormField, Input, Select } from "@/components/ui/field";
import { cn } from "@/lib/utils/cn";
import { Trash2, Pencil, X } from "lucide-react";

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN" | "RESTAURATEUR" | "TRESORIER" | "SECRETAIRE";
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
  SECRETAIRE: "Secrétaire",
};

const ROLE_OPTIONS = (
  <>
    <option value="ADMIN">Admin (gestion des contenus)</option>
    <option value="SUPER_ADMIN">Super admin (accès total)</option>
    <option value="RESTAURATEUR">Restaurateur (une seule fiche)</option>
    <option value="TRESORIER">Trésorier (versements bons cadeaux)</option>
    <option value="SECRETAIRE">Secrétaire (bons cadeaux + communication)</option>
  </>
);

function CreateUserForm({
  restaurants,
  onCreated,
}: {
  restaurants: RestaurantOption[];
  onCreated: (user: UserRow) => void;
}) {
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
    onCreated(user);
    reset();
  }

  return (
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
        <Select id="role" {...register("role")}>{ROLE_OPTIONS}</Select>
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
  );
}

function EditUserForm({
  user,
  restaurants,
  onSaved,
  onCancel,
}: {
  user: UserRow;
  restaurants: RestaurantOption[];
  onSaved: (user: UserRow) => void;
  onCancel: () => void;
}) {
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AdminEditUserInput>({
    resolver: zodResolver(adminEditUserSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      restaurantId: user.restaurantId,
    },
  });
  const selectedRole = watch("role");

  async function onSubmit(values: AdminEditUserInput) {
    setServerError(null);
    // "" = mot de passe laissé vide dans le formulaire = inchangé ; on ne
    // l'envoie alors pas du tout (updateUserSchema côté API l'ignore s'il est
    // absent, mais échouerait sur une chaîne vide trop courte).
    const { password, ...rest } = values;
    const payload = password ? values : rest;

    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setServerError(data.error ?? "Une erreur est survenue.");
      return;
    }
    const { user: updated } = await res.json();
    onSaved(updated);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-lg border border-ink-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg text-ink-900">Modifier {user.name}</h2>
        <button type="button" onClick={onCancel} className="text-ink-400 hover:text-ink-700" aria-label="Annuler">
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>
      <FormField label="Nom" htmlFor="edit-name" error={errors.name?.message}>
        <Input id="edit-name" {...register("name")} />
      </FormField>
      <FormField label="Email" htmlFor="edit-email" error={errors.email?.message}>
        <Input id="edit-email" type="email" {...register("email")} />
      </FormField>
      <FormField
        label="Nouveau mot de passe"
        htmlFor="edit-password"
        hint="Laisser vide pour ne pas changer le mot de passe actuel."
        error={errors.password?.message}
      >
        <Input id="edit-password" type="password" {...register("password")} />
      </FormField>
      <FormField label="Rôle" htmlFor="edit-role" error={errors.role?.message}>
        <Select id="edit-role" {...register("role")}>{ROLE_OPTIONS}</Select>
      </FormField>
      {selectedRole === "RESTAURATEUR" ? (
        <FormField
          label="Restaurant géré"
          htmlFor="edit-restaurantId"
          hint="Le compte ne pourra modifier que ce restaurant, depuis /mon-restaurant."
          error={errors.restaurantId?.message}
        >
          <Select id="edit-restaurantId" {...register("restaurantId")}>
            <option value="">Sélectionner...</option>
            {restaurants.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </Select>
        </FormField>
      ) : null}
      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? "Enregistrement..." : "Enregistrer"}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Annuler
        </Button>
      </div>
      {serverError ? <p className="text-sm text-red-600">{serverError}</p> : null}
    </form>
  );
}

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
  const [editingId, setEditingId] = useState<string | null>(null);

  // L'utilisateur en cours d'édition peut avoir été modifié entre-temps
  // (ex. toggleActive) — on retrouve toujours sa version la plus récente
  // plutôt que de garder une copie figée au moment du clic sur "Modifier".
  const editingUser = editingId ? users.find((u) => u.id === editingId) ?? null : null;

  // Si le compte en cours d'édition a été supprimé entre-temps (autre onglet,
  // autre admin), on referme proprement le formulaire au lieu de planter.
  useEffect(() => {
    if (editingId && !editingUser) setEditingId(null);
  }, [editingId, editingUser]);

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
    if (res.ok) {
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      if (editingId === user.id) setEditingId(null);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="overflow-x-auto rounded-lg border border-ink-100 bg-white shadow-sm lg:col-span-2">
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
              <tr key={user.id} className={cn("transition-colors hover:bg-cream-50/60", editingId === user.id && "bg-wine-50/40")}>
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
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingId(user.id)}
                      title="Modifier"
                      className="flex h-7 w-7 items-center justify-center rounded-sm text-ink-400 transition-colors hover:bg-cream-100 hover:text-ink-700"
                    >
                      <Pencil className="h-3.5 w-3.5" aria-hidden />
                    </button>
                    <button
                      onClick={() => remove(user)}
                      disabled={user.id === currentUserId}
                      title="Supprimer"
                      className="flex h-7 w-7 items-center justify-center rounded-sm text-ink-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingUser ? (
        <EditUserForm
          key={editingUser.id}
          user={editingUser}
          restaurants={restaurants}
          onCancel={() => setEditingId(null)}
          onSaved={(updated) => {
            setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
            setEditingId(null);
          }}
        />
      ) : (
        <CreateUserForm restaurants={restaurants} onCreated={(user) => setUsers((prev) => [...prev, user])} />
      )}
    </div>
  );
}
