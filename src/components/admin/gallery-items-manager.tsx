"use client";

import { useState } from "react";
import Image from "next/image";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, useSortable, rectSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { MediaPicker, type PickedMedia } from "@/components/admin/media-picker";

interface GalleryItemRow {
  id: string;
  media: { url: string; alt: string | null };
}

function SortableThumb({ item, onRemove }: { item: GalleryItemRow; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="relative aspect-square cursor-grab overflow-hidden rounded-md border border-gray-200"
      {...attributes}
      {...listeners}
    >
      <Image src={item.media.url} alt={item.media.alt ?? ""} fill className="object-cover" style={{ opacity: isDragging ? 0.5 : 1 }} />
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="absolute right-1 top-1 rounded-full bg-black/60 px-1.5 text-xs text-white"
      >
        ✕
      </button>
    </div>
  );
}

export function GalleryItemsManager({ albumId, initialItems }: { albumId: string; initialItems: GalleryItemRow[] }) {
  const [items, setItems] = useState(initialItems);
  const [pickerOpen, setPickerOpen] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  async function addMedia(media: PickedMedia[]) {
    const res = await fetch(`/api/admin/gallery/albums/${albumId}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mediaIds: media.map((m) => m.id) }),
    });
    if (res.ok) {
      const data = await res.json();
      setItems(data.album.items);
    }
  }

  async function removeItem(itemId: string) {
    await fetch(`/api/admin/gallery/items/${itemId}`, { method: "DELETE" });
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  }

  async function persistOrder(next: GalleryItemRow[]) {
    setItems(next);
    await fetch("/api/admin/gallery/items/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: next.map((i, index) => ({ id: i.id, order: index })) }),
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const next = [...items];
    const [moved] = next.splice(oldIndex, 1);
    if (!moved) return;
    next.splice(newIndex, 0, moved);
    void persistOrder(next);
  }

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900">Photos de l&apos;album ({items.length})</h2>
        <Button type="button" size="sm" onClick={() => setPickerOpen(true)}>
          Ajouter des photos
        </Button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((i) => i.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {items.map((item) => (
              <SortableThumb key={item.id} item={item} onRemove={() => removeItem(item.id)} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {items.length === 0 ? <p className="text-sm text-gray-500">Aucune photo dans cet album pour le moment.</p> : null}

      <MediaPicker open={pickerOpen} multiple onClose={() => setPickerOpen(false)} onSelect={addMedia} />
    </div>
  );
}
