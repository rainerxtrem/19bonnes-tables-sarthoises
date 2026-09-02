import type { Metadata } from "next";
import { listPublishedRestaurants } from "@/lib/services/restaurant.service";
import { RestaurantDirectory } from "@/components/public/restaurant-directory";
import { Reveal } from "@/components/public/reveal";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "Nos restaurants",
  description:
    "Le guide des restaurants membres des 19 Bonnes Tables Sarthoises : découvrez leurs adresses, leur cuisine et leur savoir-faire à travers la Sarthe.",
  path: "/nos-restaurants",
});

export default async function NosRestaurantsPage() {
  const restaurants = await listPublishedRestaurants();

  return (
    <div>
      <section className="border-b border-ink-900/10 bg-cream-100 py-20 sm:py-28">
        <div className="container text-center">
          <Reveal>
            <p className="eyebrow justify-center">Le guide</p>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="mx-auto mt-4 max-w-2xl font-display text-4xl text-ink-900 sm:text-5xl">
              Nos restaurants
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mx-auto mt-5 max-w-xl text-ink-600">
              Chaque établissement porte la même exigence : des produits choisis, un accueil sincère, un
              savoir-faire mis au service de votre table.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="container">
          <RestaurantDirectory
            restaurants={restaurants.map((r) => ({
              id: r.id,
              slug: r.slug,
              name: r.name,
              shortDescription: r.shortDescription,
              city: r.city,
              imageUrl: r.mainImage?.url ?? null,
              imageAlt: r.mainImage?.alt ?? null,
            }))}
          />
        </div>
      </section>
    </div>
  );
}
