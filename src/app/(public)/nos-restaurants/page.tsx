import type { Metadata } from "next";
import { listPublishedRestaurants } from "@/lib/services/restaurant.service";
import { RestaurantDirectory } from "@/components/public/restaurant-directory";
import { RestaurantsMapLoader } from "@/components/public/restaurants-map-loader";
import { Reveal } from "@/components/public/reveal";
import { buildMetadata, breadcrumbJsonLd, absoluteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "Nos restaurants",
  description:
    "Le guide des restaurants membres des 19 Bonnes Tables Sarthoises : découvrez leurs adresses, leur cuisine et leur savoir-faire à travers la Sarthe.",
  path: "/nos-restaurants",
});

export default async function NosRestaurantsPage() {
  const restaurants = await listPublishedRestaurants();
  const mapRestaurants = restaurants
    .filter((r): r is typeof r & { latitude: number; longitude: number } => r.latitude != null && r.longitude != null)
    .map((r) => ({ id: r.id, slug: r.slug, name: r.name, city: r.city, latitude: r.latitude, longitude: r.longitude }));

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: restaurants.map((r, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(`/${r.slug}`),
      name: r.name,
    })),
  };
  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Nos restaurants", path: "/nos-restaurants" },
  ]);

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

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

      {mapRestaurants.length > 0 ? (
        <section className="border-b border-ink-900/10 py-16 sm:py-20">
          <div className="container">
            <Reveal>
              <div className="mx-auto h-[420px] max-w-4xl overflow-hidden rounded-md shadow-elevated sm:h-[480px]">
                <RestaurantsMapLoader restaurants={mapRestaurants} />
              </div>
            </Reveal>
          </div>
        </section>
      ) : null}

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
