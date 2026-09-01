"use client";

import { useState } from "react";
import Image from "next/image";

interface GalleryPhoto {
  id: string;
  url: string;
  alt: string | null;
}

export function LightboxGallery({ photos }: { photos: GalleryPhoto[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (photos.length === 0) {
    return <p className="text-center text-sm text-ink-500">Aucune photo pour le moment.</p>;
  }

  const active = activeIndex !== null ? photos[activeIndex] : null;

  function show(delta: number) {
    setActiveIndex((current) => {
      if (current === null) return current;
      const next = (current + delta + photos.length) % photos.length;
      return next;
    });
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {photos.map((photo, index) => (
          <button
            key={photo.id}
            onClick={() => setActiveIndex(index)}
            className="group relative aspect-square overflow-hidden rounded-sm bg-ink-100"
          >
            <Image src={photo.url} alt={photo.alt ?? ""} fill className="object-cover transition-transform duration-500 ease-editorial group-hover:scale-110" />
          </button>
        ))}
      </div>

      {active ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setActiveIndex(null)}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              show(-1);
            }}
            className="absolute left-4 text-3xl text-white/80 hover:text-white"
            aria-label="Photo précédente"
          >
            ‹
          </button>
          <div className="relative h-[80vh] w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <Image src={active.url} alt={active.alt ?? ""} fill className="object-contain" />
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              show(1);
            }}
            className="absolute right-4 text-3xl text-white/80 hover:text-white"
            aria-label="Photo suivante"
          >
            ›
          </button>
          <button
            onClick={() => setActiveIndex(null)}
            className="absolute right-4 top-4 text-xl text-white/80 hover:text-white"
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>
      ) : null}
    </>
  );
}
