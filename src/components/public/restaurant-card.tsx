import Link from "next/link";
import Image from "next/image";

export function RestaurantCard({
  slug,
  name,
  shortDescription,
  imageUrl,
  imageAlt,
}: {
  slug: string;
  name: string;
  shortDescription: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
}) {
  return (
    <Link
      href={`/${slug}`}
      className="group overflow-hidden rounded-lg bg-white shadow-sm transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={imageAlt ?? name}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : null}
      </div>
      <div className="p-5">
        <h3 className="text-base font-semibold text-brand-dark">{name}</h3>
        {shortDescription ? <p className="mt-2 text-sm text-gray-600">{shortDescription}</p> : null}
      </div>
    </Link>
  );
}
