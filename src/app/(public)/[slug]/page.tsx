import type { Metadata } from "next";
import { notFound, redirect, permanentRedirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { getPublishedRestaurantBySlug } from "@/lib/services/restaurant.service";
import { getSiteSettings } from "@/lib/services/settings.service";
import { ArrowLeft, Clock, Facebook, Instagram, Mail, MapPin, Navigation as NavigationIcon, Phone } from "lucide-react";

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

    const priceLine = [
      restaurant.priceLunch ? `Midi ${restaurant.priceLunch}` : null,
      restaurant.priceDinner ? `Soir ${restaurant.priceDinner}` : null,
    ]
      .filter(Boolean)
      .join(" · ");

    return (
      <article>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

        {/* Bandeau d'en-tête compact : l'essentiel (nom, ville) sans empiéter
            sur les informations pratiques qui suivent juste en dessous. */}
        <div className="relative flex min-h-[220px] items-end overflow-hidden bg-ink-950 py-10 sm:min-h-[260px]">
          {restaurant.mainImage ? (
            <Image
              src={restaurant.mainImage.url}
              alt={restaurant.mainImage.alt ?? restaurant.name}
              fill
              priority
              className="object-cover opacity-50"
            />
          ) : null}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/50 to-ink-950/20" />

          <div className="container relative z-10">
            <Link
              href="/#restaurants"
              className="link-sweep inline-flex items-center gap-1.5 text-xs uppercase tracking-wide text-cream-100/80"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
              Tous les restaurants
            </Link>
            <p className="eyebrow mt-4 text-gold-300 before:bg-gold-300">Restaurant membre</p>
            <h1 className="mt-2 max-w-2xl font-display text-3xl text-cream-50 sm:text-4xl">{restaurant.name}</h1>
            {restaurant.city ? (
              <p className="mt-2 flex items-center gap-1.5 text-sm text-cream-100/80">
                <MapPin className="h-4 w-4 text-gold-300" aria-hidden />
                {restaurant.city}
              </p>
            ) : null}
          </div>
        </div>

        <div className="container grid grid-cols-1 gap-12 py-16 lg:grid-cols-[1.6fr_1fr]">
          <div>
            {restaurant.mainImage ? (
              <div className="relative mb-8 aspect-[16/10] overflow-hidden rounded-md bg-ink-100 shadow-card">
                <Image
                  src={restaurant.mainImage.url}
                  alt={restaurant.mainImage.alt ?? restaurant.name}
                  fill
                  className="object-cover"
                />
              </div>
            ) : null}

            {restaurant.shortDescription ? (
              <p className="font-display text-xl italic text-ink-700">{restaurant.shortDescription}</p>
            ) : null}

            {restaurant.description ? (
              <div
                className="prose prose-sm mt-6 max-w-none"
                dangerouslySetInnerHTML={{ __html: restaurant.description }}
              />
            ) : null}

            {restaurant.images.length > 0 ? (
              <div className="mt-14">
                <p className="eyebrow">Galerie</p>
                <h2 className="mt-3 font-display text-2xl text-ink-900">En images</h2>
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {restaurant.images.map((image) => (
                    <div key={image.id} className="relative aspect-square overflow-hidden rounded-sm bg-ink-100">
                      <Image
                        src={image.media.url}
                        alt={image.media.alt ?? restaurant.name}
                        fill
                        className="object-cover transition-transform duration-500 hover:scale-105"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {/* Colonne informations pratiques */}
          <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-md border border-ink-900/10 bg-cream-50 p-6 shadow-card">
              <p className="eyebrow">Informations</p>
              {priceLine ? <p className="mt-4 font-display text-lg text-ink-900">{priceLine}</p> : null}

              <dl className="mt-4 space-y-3 text-sm text-ink-700">
                {restaurant.address ? (
                  <div className="flex gap-2.5">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" aria-hidden />
                    <span>
                      {restaurant.address}
                      <br />
                      {restaurant.postalCode} {restaurant.city}
                    </span>
                  </div>
                ) : null}
                {restaurant.phone ? (
                  <div className="flex items-center gap-2.5">
                    <Phone className="h-4 w-4 shrink-0 text-gold-600" aria-hidden />
                    <a href={`tel:${restaurant.phone.replace(/\s/g, "")}`} className="hover:text-wine-700">
                      {restaurant.phone}
                    </a>
                  </div>
                ) : null}
                {restaurant.email ? (
                  <div className="flex items-center gap-2.5">
                    <Mail className="h-4 w-4 shrink-0 text-gold-600" aria-hidden />
                    <a href={`mailto:${restaurant.email}`} className="hover:text-wine-700">
                      {restaurant.email}
                    </a>
                  </div>
                ) : null}
              </dl>

              <div className="mt-5 flex flex-wrap gap-2 border-t border-ink-900/10 pt-5">
                {restaurant.website ? (
                  <a
                    href={restaurant.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-sm border border-ink-900/15 px-3 py-2 text-xs font-medium text-ink-800 hover:border-wine-700 hover:text-wine-700"
                  >
                    Site internet
                  </a>
                ) : null}
                {restaurant.googleMapsUrl ? (
                  <a
                    href={restaurant.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-sm border border-ink-900/15 px-3 py-2 text-xs font-medium text-ink-800 hover:border-wine-700 hover:text-wine-700"
                  >
                    <NavigationIcon className="h-3.5 w-3.5" aria-hidden />
                    Itinéraire
                  </a>
                ) : null}
                {restaurant.facebookUrl ? (
                  <a
                    href={restaurant.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="inline-flex items-center justify-center rounded-sm border border-ink-900/15 p-2 text-ink-800 hover:border-wine-700 hover:text-wine-700"
                  >
                    <Facebook className="h-3.5 w-3.5" aria-hidden />
                  </a>
                ) : null}
                {restaurant.instagramUrl ? (
                  <a
                    href={restaurant.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="inline-flex items-center justify-center rounded-sm border border-ink-900/15 p-2 text-ink-800 hover:border-wine-700 hover:text-wine-700"
                  >
                    <Instagram className="h-3.5 w-3.5" aria-hidden />
                  </a>
                ) : null}
              </div>
            </div>

            {openingHours.length > 0 ? (
              <div className="rounded-md border border-ink-900/10 bg-cream-50 p-6 shadow-card">
                <p className="eyebrow flex items-center gap-2 before:hidden">
                  <Clock className="h-3.5 w-3.5 text-gold-600" aria-hidden />
                  Horaires
                </p>
                <ul className="mt-4 space-y-2 text-sm text-ink-700">
                  {openingHours.map((day) => (
                    <li key={day.day} className="flex justify-between gap-2 border-b border-ink-900/5 pb-2 last:border-0 last:pb-0">
                      <span className="font-medium text-ink-900">{DAY_LABELS[day.day] ?? day.day}</span>
                      <span className="text-right text-ink-500">
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
              <div className="rounded-md border border-ink-900/10 bg-cream-50 p-6 text-sm text-ink-700 shadow-card">
                {restaurant.additionalInfo}
              </div>
            ) : null}

            {settings.contactEmail || settings.contactPhone ? (
              <div className="rounded-md bg-gold-100 p-6 text-sm text-ink-800">
                Une question sur les bons cadeaux de l&apos;association ?{" "}
                <Link href="/bon-cadeaux" className="link-sweep font-medium text-wine-700">
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
    <article className="py-20">
      <div className="container">
        <h1 className="mb-8 text-center font-display text-4xl text-ink-900">{page.title}</h1>
        {page.mainImage ? (
          <div className="relative mx-auto mb-10 aspect-video max-w-3xl overflow-hidden rounded-md shadow-card">
            <Image src={page.mainImage.url} alt={page.mainImage.alt ?? page.title} fill className="object-cover" />
          </div>
        ) : null}
        <div className="prose prose-sm mx-auto max-w-3xl" dangerouslySetInnerHTML={{ __html: page.content }} />
      </div>
    </article>
  );
}
