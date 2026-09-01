"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { StatusBadge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface RestaurantRow {
  id: string;
  name: string;
  slug: string;
  status: "DRAFT" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED";
  order: number;
  updatedAt: string;
  mainImage: { url: string; alt: string | null } | null;
}

function SortableRow({ row, children }: { row: RestaurantRow; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: row.id,
  });

  return (
    <tr
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={isDragging ? "bg-brand-cream" : undefined}
    >
      <td className="w-8 cursor-grab px-2 text-gray-400" {...attributes} {...listeners}>
        ⠿
      </td>
      {children}
    </tr>
  );
}

export function RestaurantTable({ initialRows }: { initialRows: RestaurantRow[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(initialRows);
  const [pending, setPending] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  async function persistOrder(next: RestaurantRow[]) {
    setRows(next);
    await fetch("/api/admin/restaurants/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: next.map((r, index) => ({ id: r.id, order: index })) }),
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = rows.findIndex((r) => r.id === active.id);
    const newIndex = rows.findIndex((r) => r.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const next = [...rows];
    const [moved] = next.splice(oldIndex, 1);
    if (!moved) return;
    next.splice(newIndex, 0, moved);
    void persistOrder(next);
  }

  async function toggleStatus(row: RestaurantRow) {
    setPending(row.id);
    const nextStatus = row.status === "PUBLISHED" ? "ARCHIVED" : "PUBLISHED";
    await fetch(`/api/admin/restaurants/${row.id}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    router.refresh();
    setPending(null);
  }

  async function duplicate(row: RestaurantRow) {
    setPending(row.id);
    await fetch(`/api/admin/restaurants/${row.id}/duplicate`, { method: "POST" });
    router.refresh();
    setPending(null);
  }

  async function remove(row: RestaurantRow) {
    if (!window.confirm(`Supprimer définitivement "${row.name}" ?`)) return;
    setPending(row.id);
    await fetch(`/api/admin/restaurants/${row.id}`, { method: "DELETE" });
    setRows((prev) => prev.filter((r) => r.id !== row.id));
    router.refresh();
    setPending(null);
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
          <tr>
            <th />
            <th className="px-3 py-2">Photo</th>
            <th className="px-3 py-2">Nom</th>
            <th className="px-3 py-2">Statut</th>
            <th className="px-3 py-2">Modifié</th>
            <th className="px-3 py-2">Actions</th>
          </tr>
        </thead>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={rows.map((r) => r.id)} strategy={verticalListSortingStrategy}>
            <tbody className="divide-y divide-gray-100">
              {rows.map((row) => (
                <SortableRow key={row.id} row={row}>
                  <td className="px-3 py-2">
                    <div className="relative h-10 w-14 overflow-hidden rounded bg-gray-100">
                      {row.mainImage ? (
                        <Image src={row.mainImage.url} alt={row.mainImage.alt ?? ""} fill className="object-cover" />
                      ) : null}
                    </div>
                  </td>
                  <td className="px-3 py-2 font-medium text-gray-900">{row.name}</td>
                  <td className="px-3 py-2">
                    <StatusBadge status={row.status} />
                  </td>
                  <td className="px-3 py-2 text-gray-500">
                    {formatDistanceToNow(new Date(row.updatedAt), { addSuffix: true, locale: fr })}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-2">
                      <Link href={`/admin/restaurants/${row.id}/edit`} className="text-brand hover:underline">
                        Modifier
                      </Link>
                      <button
                        disabled={pending === row.id}
                        onClick={() => toggleStatus(row)}
                        className="text-gray-600 hover:underline disabled:opacity-50"
                      >
                        {row.status === "PUBLISHED" ? "Désactiver" : "Publier"}
                      </button>
                      <button
                        disabled={pending === row.id}
                        onClick={() => duplicate(row)}
                        className="text-gray-600 hover:underline disabled:opacity-50"
                      >
                        Dupliquer
                      </button>
                      <button
                        disabled={pending === row.id}
                        onClick={() => remove(row)}
                        className="text-red-600 hover:underline disabled:opacity-50"
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </SortableRow>
              ))}
            </tbody>
          </SortableContext>
        </DndContext>
      </table>
      {rows.length === 0 ? (
        <div className="p-8 text-center text-sm text-gray-500">
          Aucun restaurant pour le moment.{" "}
          <Link href="/admin/restaurants/new" className="text-brand hover:underline">
            En créer un
          </Link>
          .
        </div>
      ) : null}
    </div>
  );
}

export function RestaurantListHeader() {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h1 className="text-xl font-semibold text-gray-900">Restaurants</h1>
      <Link
        href="/admin/restaurants/new"
        className="inline-flex items-center justify-center rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
      >
        Nouveau restaurant
      </Link>
    </div>
  );
}
