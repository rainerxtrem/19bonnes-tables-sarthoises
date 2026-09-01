import Link from "next/link";
import Image from "next/image";
import { MapPin, ArrowUpRight } from "lucide-react";

export function RestaurantCard({
  slug,
  name,
  shortDescription,
  city,
  imageUrl,
  imageAlt,
  featured = false,
}: {
  slug: string;
  name: string;
  shortDescription: string | null;
  city?: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
  featured?: boolean;
}) {
  return (
    <Link
      href={`/${slug}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-md bg-cream-50 shadow-card transition-all duration-500 ease-editorial hover:-translate-y-1 hover:shadow-elevated"
    >
      <div className={`relative overflow-hidden bg-ink-100 ${featured ? "aspect-[4/5]" : "aspect-[4/3]"}`}>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={imageAlt ?? name}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 ease-editorial group-hover:scale-[1.06]"
          />
        ) : (
          <div className="flex h-full items-center justify-center font-display text-4xl text-ink-300">
            {name.charAt(0)}
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/70 via-ink-950/0 to-ink-950/0" />
        <span className="eyebrow absolute left-4 top-4 rounded-sm bg-cream-50/90 px-2.5 py-1 text-[10px] text-gold-700 backdrop-blur before:hidden">
          Restaurant membre
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-xl text-ink-900">{name}</h3>
        {city ? (
          <p className="mt-1.5 flex items-center gap-1.5 text-xs uppercase tracking-wide text-ink-400">
            <MapPin className="h-3.5 w-3.5 text-gold-600" aria-hidden />
            {city}
          </p>
        ) : null}
        {shortDescription ? (
          <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-ink-600">{shortDescription}</p>
        ) : (
          <div className="flex-1" />
        )}
        <span className="link-sweep mt-5 inline-flex w-fit items-center gap-1.5 text-sm font-medium text-wine-700">
          Découvrir la fiche
          <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
        </span>
      </div>
    </Link>
  );
}
