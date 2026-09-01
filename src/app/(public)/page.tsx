import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { prisma } from "@/lib/db/prisma";
import { listPublishedRestaurants } from "@/lib/services/restaurant.service";
import { getSiteSettings } from "@/lib/services/settings.service";
import { RestaurantCard } from "@/components/public/restaurant-card";
import { ContactForm } from "@/components/public/contact-form";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: settings.seoDefaultTitle || settings.siteName,
    description: settings.seoDefaultDescription || settings.siteDescription || undefined,
  };
}

export default async function HomePage() {
  const [homePage, restaurants, settings] = await Promise.all([
    prisma.page.findUnique({ where: { slug: "accueil" }, include: { mainImage: true } }),
    listPublishedRestaurants(),
    getSiteSettings(),
  ]);

  return (
    <div>
      <section id="accueil" className="relative flex min-h-[70vh] items-center justify-center overflow-hidden bg-brand-dark text-center text-white">
        {homePage?.mainImage ? (
          <Image
            src={homePage.mainImage.url}
            alt=""
            fill
            priority
            className="object-cover opacity-40 blur-[2px]"
          />
        ) : null}
        <div className="relative z-10 mx-auto max-w-2xl px-4">
          <h1 className="text-3xl font-semibold sm:text-4xl">{homePage?.title ?? settings.siteName}</h1>
          {homePage?.excerpt ? <p className="mt-4 text-brand-cream/90">{homePage.excerpt}</p> : null}
          <Link
            href="#services"
            className="mt-8 inline-block rounded-md bg-brand-light px-6 py-3 text-sm font-medium text-brand-dark hover:brightness-95"
          >
            Nos restaurants
          </Link>
        </div>
      </section>

      {homePage?.content ? (
        <section id="about" className="container py-16">
          <div
            className="prose prose-sm mx-auto max-w-3xl text-center"
            dangerouslySetInnerHTML={{ __html: homePage.content }}
          />
        </section>
      ) : null}

      <section id="services" className="bg-white py-16">
        <div className="container">
          <h2 className="mb-10 text-center text-2xl font-semibold text-brand-dark">
            Les restaurants membres des 19 Bonnes Tables Sarthoises
          </h2>
          {restaurants.length === 0 ? (
            <p className="text-center text-sm text-gray-500">
              Aucun restaurant publié pour le moment.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {restaurants.map((restaurant) => (
                <RestaurantCard
                  key={restaurant.id}
                  slug={restaurant.slug}
                  name={restaurant.name}
                  shortDescription={restaurant.shortDescription}
                  imageUrl={restaurant.mainImage?.url ?? null}
                  imageAlt={restaurant.mainImage?.alt ?? null}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <section id="contactez-nous" className="container py-16">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-2xl font-semibold text-brand-dark">Contactez-nous</h2>
          <p className="mt-3 text-sm text-gray-600">
            Pour toute demande de renseignements concernant l&apos;association ou de collaborations,
            contactez-nous, nous vous répondrons dans les plus brefs délais. Ce site n&apos;est pas
            destiné aux réservations.
          </p>
        </div>
        <div className="mx-auto mt-8 max-w-xl">
          <ContactForm />
        </div>
      </section>
    </div>
  );
}
