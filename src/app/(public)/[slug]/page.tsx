import type { Metadata } from "next";
import { notFound, redirect, permanentRedirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { getPublishedRestaurantBySlug } from "@/lib/services/restaurant.service";
import { getSiteSettings } from "@/lib/services/settings.service";

// Contenu piloté par le CMS : rendu dynamique à chaque requête (pas de
// génération statique figée au build).
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

const DAY_LABELS: Record<string, string> = {
  lundi: "Lundi",
  mardi: "Mardi",
  mercredi: "Mercredi",
  jeudi: "Jeudi",
  vendredi: "Vendredi",
  samedi: "Samedi",
  dimanche: "Dimanche",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const restaurant = await getPublishedRestaurantBySlug(slug);
  if (restaurant) {
    return {
      title: restaurant.seoTitle || restaurant.name,
      description: restaurant.seoDescription || restaurant.shortDescription || undefined,
      openGraph: restaurant.ogImage || restaurant.mainImage
        ? { images: [{ url: (restaurant.ogImage ?? restaurant.mainImage)!.url }] }
        : undefined,
    };
  }

  const page = await prisma.page.findUnique({ where: { slug } });
  if (page && page.status === "PUBLISHED") {
    return {
      title: page.seoTitle || page.title,
      description: page.seoDescription || page.excerpt || undefined,
    };
  }

  return {};
}

export default async function SlugPage({ params }: Props) {
  const { slug } = await params;

  const restaurant = await getPublishedRestaurantBySlug(slug);
  if (restaurant) {
    const settings = await getSiteSettings();
    const openingHours = (restaurant.openingHours as
      | { day: string; closed: boolean; slots: { start: string; end: string }[] }[]
      | null) ?? [];

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Restaurant",
      name: restaurant.name,
      description: restaurant.shortDescription ?? undefined,
      image: restaurant.mainImage?.url,
      telephone: restaurant.phone ?? undefined,
      email: restaurant.email ?? undefined,
      url: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/${restaurant.slug}`,
      address: restaurant.address
        ? {
            "@type": "PostalAddress",
            streetAddress: restaurant.address,
            postalCode: restaurant.postalCode ?? undefined,
            addressLocality: restaurant.city ?? undefined,
            addressCountry: "FR",
          }
        : undefined,
    };

    return (
      <article>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

        <div className="relative flex h-[45vh] min-h-[320px] items-end bg-brand-dark">
          {restaurant.mainImage ? (
            <Image src={restaurant.mainImage.url} alt={restaurant.mainImage.alt ?? restaurant.name} fill priority className="object-cover opacity-70" />
          ) : null}
          <div className="container relative z-10 pb-8 text-white">
            <h1 className="text-3xl font-semibold">{restaurant.name}</h1>
            {restaurant.shortDescription ? <p className="mt-2 max-w-xl text-white/90">{restaurant.shortDescription}</p> : null}
          </div>
        </div>

        <div className="container grid grid-cols-1 gap-10 py-12 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {restaurant.description ? (
              <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: restaurant.description }} />
            ) : null}

            {restaurant.images.length > 0 ? (
              <div className="mt-10">
                <h2 className="mb-4 text-lg font-semibold text-brand-dark">Galerie photos</h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {restaurant.images.map((image) => (
                    <div key={image.id} className="relative aspect-square overflow-hidden rounded-md">
                      <Image src={image.media.url} alt={image.media.alt ?? restaurant.name} fill className="object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <aside className="space-y-6">
            <div className="rounded-lg border border-gray-200 bg-white p-5">
              <h2 className="mb-3 text-sm font-semibold text-brand-dark">Informations</h2>
              <dl className="space-y-2 text-sm text-gray-700">
                {(restaurant.priceLunch || restaurant.priceDinner) && (
                  <div>
                    {restaurant.priceLunch ? <span>Midi {restaurant.priceLunch}</span> : null}
                    {restaurant.priceLunch && restaurant.priceDinner ? " · " : null}
                    {restaurant.priceDinner ? <span>Soir {restaurant.priceDinner}</span> : null}
                  </div>
                )}
                {restaurant.address ? (
                  <div>
                    {restaurant.address}
                    <br />
                    {restaurant.postalCode} {restaurant.city}
                  </div>
                ) : null}
                {restaurant.phone ? (
                  <div>
                    <a href={`tel:${restaurant.phone.replace(/\s/g, "")}`} className="hover:underline">
                      {restaurant.phone}
                    </a>
                  </div>
                ) : null}
                {restaurant.email ? (
                  <div>
                    <a href={`mailto:${restaurant.email}`} className="hover:underline">
                      {restaurant.email}
                    </a>
                  </div>
                ) : null}
                {restaurant.website ? (
                  <div>
                    <a href={restaurant.website} target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">
                      Site web
                    </a>
                  </div>
                ) : null}
                {restaurant.googleMapsUrl ? (
                  <div>
                    <a href={restaurant.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">
                      Voir sur Google Maps
                    </a>
                  </div>
                ) : null}
                <div className="flex gap-3 pt-1">
                  {restaurant.facebookUrl ? (
                    <a href={restaurant.facebookUrl} target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">
                      Facebook
                    </a>
                  ) : null}
                  {restaurant.instagramUrl ? (
                    <a href={restaurant.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">
                      Instagram
                    </a>
                  ) : null}
                </div>
              </dl>
            </div>

            {openingHours.length > 0 ? (
              <div className="rounded-lg border border-gray-200 bg-white p-5">
                <h2 className="mb-3 text-sm font-semibold text-brand-dark">Horaires</h2>
                <ul className="space-y-1 text-sm text-gray-700">
                  {openingHours.map((day) => (
                    <li key={day.day} className="flex justify-between gap-2">
                      <span>{DAY_LABELS[day.day] ?? day.day}</span>
                      <span className="text-right text-gray-500">
                        {day.closed || day.slots.length === 0
                          ? "Fermé"
                          : day.slots.map((s) => `${s.start}–${s.end}`).join(" · ")}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {restaurant.additionalInfo ? (
              <div className="rounded-lg border border-gray-200 bg-white p-5 text-sm text-gray-700">
                {restaurant.additionalInfo}
              </div>
            ) : null}

            {settings.contactEmail || settings.contactPhone ? (
              <div className="rounded-lg bg-brand-cream p-5 text-sm text-gray-700">
                Une question sur les bons cadeaux de l&apos;association ?{" "}
                <Link href="/bon-cadeaux" className="text-brand hover:underline">
                  Voir la page dédiée
                </Link>
              </div>
            ) : null}
          </aside>
        </div>
      </article>
    );
  }

  const page = await prisma.page.findUnique({
    where: { slug },
    include: { mainImage: true },
  });

  if (!page || page.status !== "PUBLISHED") {
    // Redirections gérées dynamiquement depuis /admin/redirections (voir
    // section 18 du cahier des charges) — celles connues à l'avance pour
    // l'ancien site B12 sont déjà couvertes par next.config.ts `redirects()`.
    const dynamicRedirect = await prisma.redirect.findUnique({ where: { fromPath: `/${slug}` } });
    if (dynamicRedirect?.isActive) {
      if (dynamicRedirect.statusCode === 301) {
        permanentRedirect(dynamicRedirect.toPath);
      }
      redirect(dynamicRedirect.toPath);
    }
    notFound();
  }

  return (
    <article className="container py-16">
      <h1 className="mb-6 text-center text-3xl font-semibold text-brand-dark">{page.title}</h1>
      {page.mainImage ? (
        <div className="relative mx-auto mb-8 aspect-video max-w-3xl overflow-hidden rounded-lg">
          <Image src={page.mainImage.url} alt={page.mainImage.alt ?? page.title} fill className="object-cover" />
        </div>
      ) : null}
      <div className="prose prose-sm mx-auto max-w-3xl" dangerouslySetInnerHTML={{ __html: page.content }} />
    </article>
  );
}
