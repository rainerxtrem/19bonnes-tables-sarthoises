import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { prisma } from "@/lib/db/prisma";
import { listPublishedRestaurants } from "@/lib/services/restaurant.service";
import { getSiteSettings } from "@/lib/services/settings.service";
import { RestaurantCard } from "@/components/public/restaurant-card";
import { RestaurantsMapLoader } from "@/components/public/restaurants-map-loader";
import { ContactForm } from "@/components/public/contact-form";
import { Reveal } from "@/components/public/reveal";
import { ArrowRight, ChefHat, MapPin, UtensilsCrossed } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: settings.seoDefaultTitle || settings.siteName,
    description: settings.seoDefaultDescription || settings.siteDescription || undefined,
  };
}

export default async function HomePage() {
  const [homePage, restaurants, settings, boardMemberCount] = await Promise.all([
    prisma.page.findUnique({ where: { slug: "accueil" }, include: { mainImage: true } }),
    listPublishedRestaurants(),
    getSiteSettings(),
    prisma.boardMember.count({ where: { isActive: true } }),
  ]);

  const towns = Array.from(new Set(restaurants.map((r) => r.city).filter((c): c is string => Boolean(c))));
  const mapRestaurants = restaurants
    .filter((r): r is typeof r & { latitude: number; longitude: number } => r.latitude != null && r.longitude != null)
    .map((r) => ({ id: r.id, slug: r.slug, name: r.name, city: r.city, latitude: r.latitude, longitude: r.longitude }));

  return (
    <div>
      {/* ---------------------------------------------------------------- */}
      {/* Hero */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative flex min-h-[88vh] items-center overflow-hidden bg-ink-950 text-cream-50">
        {homePage?.mainImage ? (
          <Image
            src={homePage.mainImage.url}
            alt=""
            fill
            priority
            className="object-cover opacity-45"
          />
        ) : null}
        <div className="pointer-events-none absolute inset-0 bg-grain" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/40 to-ink-950/70" />

        <div className="container relative z-10 py-32">
          <Reveal>
            <p className="eyebrow justify-center text-gold-300 before:bg-gold-300">
              Association d&apos;hommes et de femmes de métiers
            </p>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="mx-auto mt-6 max-w-4xl text-center font-display text-5xl font-light leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              {settings.siteName}
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="mx-auto mt-6 max-w-xl text-center font-display text-xl italic text-gold-200">
              Le savoir-faire pour mieux vous servir.
            </p>
          </Reveal>
          <Reveal delay={300}>
            <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="#restaurants" className="btn-cta">
                Découvrir nos restaurants
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/le-bureau"
                className="inline-flex items-center justify-center gap-2 rounded-sm border border-cream-100/40 px-6 py-3 text-sm font-medium tracking-wide text-cream-50 transition-all duration-300 ease-editorial hover:border-cream-50 hover:bg-cream-50/10"
              >
                Découvrir l&apos;association
              </Link>
            </div>
          </Reveal>
        </div>

        <div className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-cream-100/50 sm:flex">
          <span className="text-[10px] uppercase tracking-[0.3em]">Explorer</span>
          <span className="h-10 w-px animate-pulse bg-cream-100/40" />
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Nos établissements */}
      {/* ---------------------------------------------------------------- */}
      <section id="restaurants" className="bg-cream-100 py-24 sm:py-32">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <Reveal>
              <p className="eyebrow justify-center">Nos établissements</p>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="mt-4 font-display text-3xl text-ink-900 sm:text-4xl">
                Des restaurateurs passionnés, un savoir-faire partagé
              </h2>
            </Reveal>
            <Reveal delay={160}>
              <p className="mt-5 text-ink-600">
                Découvrez les femmes et les hommes qui font vivre notre savoir-faire au quotidien, à travers des
                établissements aussi variés que sincères.
              </p>
            </Reveal>
          </div>

          {restaurants.length === 0 ? (
            <p className="mt-16 text-center text-sm text-ink-500">Aucun restaurant publié pour le moment.</p>
          ) : (
            <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {restaurants.map((restaurant, index) => (
                <Reveal key={restaurant.id} delay={(index % 3) * 100} className="h-full">
                  <RestaurantCard
                    slug={restaurant.slug}
                    name={restaurant.name}
                    shortDescription={restaurant.shortDescription}
                    city={restaurant.city}
                    imageUrl={restaurant.mainImage?.url ?? null}
                    imageAlt={restaurant.mainImage?.alt ?? null}
                  />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Savoir-faire / histoire */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative overflow-hidden bg-ink-950 py-24 text-cream-100 sm:py-32">
        <div className="pointer-events-none absolute inset-0 bg-grain" />
        <div className="container relative grid grid-cols-1 gap-16 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <Reveal>
            <div>
              <p className="eyebrow text-gold-300 before:bg-gold-300">Notre histoire</p>
              <h2 className="mt-4 font-display text-3xl text-cream-50 sm:text-4xl">
                Un savoir-faire transmis, une passion partagée
              </h2>
              {homePage?.content ? (
                <div
                  className="prose prose-invert prose-sm mt-6 max-w-none text-cream-100/80 [--tw-prose-headings:theme(colors.cream.50)] [--tw-prose-links:theme(colors.gold.300)]"
                  dangerouslySetInnerHTML={{ __html: homePage.content }}
                />
              ) : (
                <p className="mt-6 text-cream-100/75">
                  Réunis autour d&apos;une même exigence, nos membres mettent en commun leur expérience, leurs
                  produits et leur passion pour faire vivre une cuisine authentique et généreuse.
                </p>
              )}
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-md border border-cream-50/10 bg-cream-50/5 p-6 text-center">
                <UtensilsCrossed className="mx-auto h-6 w-6 text-gold-300" aria-hidden />
                <p className="mt-4 font-display text-3xl text-cream-50">{restaurants.length}</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-cream-100/60">Restaurants membres</p>
              </div>
              <div className="rounded-md border border-cream-50/10 bg-cream-50/5 p-6 text-center">
                <ChefHat className="mx-auto h-6 w-6 text-gold-300" aria-hidden />
                <p className="mt-4 font-display text-3xl text-cream-50">{boardMemberCount}</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-cream-100/60">Membres du bureau</p>
              </div>
              <div className="rounded-md border border-cream-50/10 bg-cream-50/5 p-6 text-center">
                <MapPin className="mx-auto h-6 w-6 text-gold-300" aria-hidden />
                <p className="mt-4 font-display text-3xl text-cream-50">{towns.length || "—"}</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-cream-100/60">Communes sarthoises</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Territoire */}
      {/* ---------------------------------------------------------------- */}
      {towns.length > 0 ? (
        <section className="bg-cream-100 py-24">
          <div className="container text-center">
            <Reveal>
              <p className="eyebrow justify-center">Le territoire</p>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="mx-auto mt-4 max-w-2xl font-display text-3xl text-ink-900 sm:text-4xl">
                Une association qui fait vivre la Sarthe, une table à la fois
              </h2>
            </Reveal>

            {mapRestaurants.length > 0 ? (
              <Reveal delay={140}>
                <div className="mx-auto mt-10 h-[420px] max-w-4xl overflow-hidden rounded-md shadow-elevated sm:h-[480px]">
                  <RestaurantsMapLoader restaurants={mapRestaurants} />
                </div>
              </Reveal>
            ) : null}

            <Reveal delay={200}>
              <div className="mx-auto mt-8 flex max-w-3xl flex-wrap justify-center gap-3">
                {towns.map((town) => (
                  <span
                    key={town}
                    className="rounded-full border border-ink-900/10 bg-cream-50 px-4 py-2 text-sm text-ink-700"
                  >
                    {town}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>
        </section>
      ) : null}

      {/* ---------------------------------------------------------------- */}
      {/* Contact */}
      {/* ---------------------------------------------------------------- */}
      <section id="contactez-nous" className="border-t border-ink-900/10 bg-cream-50 py-24">
        <div className="container">
          <div className="mx-auto max-w-xl text-center">
            <Reveal>
              <p className="eyebrow justify-center">Restons en contact</p>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="mt-4 font-display text-3xl text-ink-900">Contactez-nous</h2>
            </Reveal>
            <Reveal delay={140}>
              <p className="mt-4 text-sm text-ink-600">
                Pour toute demande de renseignements concernant l&apos;association ou de collaborations,
                contactez-nous, nous vous répondrons dans les plus brefs délais. Ce site n&apos;est pas destiné aux
                réservations — contactez directement l&apos;établissement de votre choix.
              </p>
            </Reveal>
          </div>
          <Reveal delay={200}>
            <div className="mx-auto mt-10 max-w-xl">
              <ContactForm />
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
