"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

export interface PickedMedia {
  id: string;
  url: string;
  alt: string | null;
  filename: string;
}

export function MediaPicker({
  open,
  multiple = false,
  onClose,
  onSelect,
}: {
  open: boolean;
  multiple?: boolean;
  onClose: () => void;
  onSelect: (media: PickedMedia[]) => void;
}) {
  const [items, setItems] = useState<PickedMedia[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch("/api/admin/media")
      .then((res) => res.json())
      .then((data) => setItems(data.media ?? []))
      .finally(() => setLoading(false));
  }, [open]);

  if (!open) return null;

  async function handleUpload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/admin/media", { method: "POST", body: formData });
        if (res.ok) {
          const data = await res.json();
          setItems((prev) => [data.media, ...prev]);
        }
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function toggle(id: string) {
    setSelected((prev) => {
      if (multiple) {
        return prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      }
      return [id];
    });
  }

  function confirmSelection() {
    onSelect(items.filter((item) => selected.includes(item.id)));
    setSelected([]);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[85vh] w-full max-w-4xl flex-col rounded-lg bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold">Médiathèque</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700" aria-label="Fermer">
            ✕
          </button>
        </div>

        <div
          className="mb-4 rounded-md border-2 border-dashed border-gray-300 p-4 text-center text-sm text-gray-500"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            void handleUpload(e.dataTransfer.files);
          }}
        >
          <p>Glissez-déposez des images ici, ou</p>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="mt-2"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? "Envoi en cours..." : "Choisir des fichiers"}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
            className="hidden"
            onChange={(e) => void handleUpload(e.target.files)}
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <p className="text-sm text-gray-500">Chargement...</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-gray-500">Aucun média pour le moment.</p>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
              {items.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => toggle(item.id)}
                  className={cn(
                    "relative aspect-square overflow-hidden rounded-md border-2",
                    selected.includes(item.id) ? "border-brand" : "border-transparent"
                  )}
                >
                  <Image
                    src={item.url}
                    alt={item.alt ?? item.filename}
                    fill
                    sizes="150px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-end gap-2 border-t border-gray-100 pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button type="button" onClick={confirmSelection} disabled={selected.length === 0}>
            Utiliser la sélection ({selected.length})
          </Button>
        </div>
      </div>
    </div>
  );
}
