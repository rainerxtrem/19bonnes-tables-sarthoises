"use client";

import { useEffect, useState } from "react";
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
import { cn } from "@/lib/utils/cn";
import { NavigationForm } from "@/components/admin/navigation-form";
import type { NavigationItem } from "@prisma/client";

interface NavRow extends NavigationItem {
  page: { title: string; slug: string } | null;
  parent: { label: string } | null;
}

function SortableRow({
  row,
  onEdit,
  onDelete,
  describeTarget,
}: {
  row: NavRow;
  onEdit: () => void;
  onDelete: () => void;
  describeTarget: (row: NavRow) => string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: row.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn("flex items-center justify-between gap-3 p-3", isDragging && "bg-wine-50")}
    >
      <div className="flex items-center gap-3">
        <span className="cursor-grab text-ink-400" {...attributes} {...listeners}>
          ⠿
        </span>
        <div>
          <p className="text-sm font-medium text-ink-900">
            {row.label} {!row.isActive ? <span className="text-xs text-ink-400">(inactif)</span> : null}
          </p>
          <p className="text-xs text-ink-500">{describeTarget(row)}</p>
        </div>
      </div>
      <div className="flex gap-3 text-sm">
        <button onClick={onEdit} className="text-brand hover:underline">
          Modifier
        </button>
        <button onClick={onDelete} className="text-red-600 hover:underline">
          Supprimer
        </button>
      </div>
    </div>
  );
}

export function NavigationManager({
  initialItems,
  pages,
}: {
  initialItems: NavRow[];
  pages: { id: string; title: string; slug: string }[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [editing, setEditing] = useState<NavRow | "new" | null>(null);

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const topLevel = items.filter((i) => !i.parentId);
  const children = items.filter((i) => i.parentId);

  function describeTarget(row: NavRow) {
    if (row.linkType === "EXTERNAL") return row.url ?? "—";
    if (row.page) return `/${row.page.slug}`;
    return row.url || "—";
  }

  async function persistOrder(nextTopLevel: NavRow[]) {
    setItems([...nextTopLevel, ...children]);
    await fetch("/api/admin/navigation/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: nextTopLevel.map((r, index) => ({ id: r.id, order: index, parentId: null })),
      }),
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = topLevel.findIndex((r) => r.id === active.id);
    const newIndex = topLevel.findIndex((r) => r.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = [...topLevel];
    const [moved] = reordered.splice(oldIndex, 1);
    if (!moved) return;
    reordered.splice(newIndex, 0, moved);
    void persistOrder(reordered);
  }

  async function remove(row: NavRow) {
    if (!window.confirm(`Supprimer "${row.label}" du menu ?`)) return;
    await fetch(`/api/admin/navigation/${row.id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((i) => i.id !== row.id));
    router.refresh();
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="rounded-lg border border-ink-100 bg-white lg:col-span-2">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={topLevel.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <div className="divide-y divide-ink-100">
              {topLevel.map((row) => (
                <div key={row.id}>
                  <SortableRow
                    row={row}
                    describeTarget={describeTarget}
                    onEdit={() => setEditing(row)}
                    onDelete={() => remove(row)}
                  />
                  {children
                    .filter((child) => child.parentId === row.id)
                    .map((child) => (
                      <div key={child.id} className="flex items-center justify-between gap-3 border-t border-ink-100 py-3 pl-10 pr-3">
                        <div>
                          <p className="text-sm text-ink-700">↳ {child.label}</p>
                          <p className="text-xs text-ink-500">{describeTarget(child)}</p>
                        </div>
                        <div className="flex gap-3 text-sm">
                          <button onClick={() => setEditing(child)} className="text-brand hover:underline">
                            Modifier
                          </button>
                          <button onClick={() => remove(child)} className="text-red-600 hover:underline">
                            Supprimer
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {items.length === 0 ? <p className="p-8 text-center text-sm text-ink-500">Aucun élément de menu.</p> : null}

        <div className="border-t border-ink-100 p-3">
          <button onClick={() => setEditing("new")} className="text-sm text-brand hover:underline">
            + Ajouter un élément de menu
          </button>
        </div>
      </div>

      <div>
        {editing ? (
          <NavigationForm
            item={editing === "new" ? null : editing}
            pages={pages}
            parents={topLevel}
            onSaved={() => {
              setEditing(null);
              router.refresh();
            }}
          />
        ) : (
          <p className="rounded-lg border border-dashed border-ink-200 p-5 text-sm text-ink-500">
            Sélectionnez « Modifier » ou « Ajouter un élément de menu » pour afficher le formulaire.
          </p>
        )}
      </div>
    </div>
  );
}
