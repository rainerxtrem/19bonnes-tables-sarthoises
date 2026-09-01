"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { RestaurantCard } from "@/components/public/restaurant-card";

interface DirectoryRestaurant {
  id: string;
  slug: string;
  name: string;
  shortDescription: string | null;
  city: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
}

export function RestaurantDirectory({ restaurants }: { restaurants: DirectoryRestaurant[] }) {
  const [query, setQuery] = useState("");
  const [town, setTown] = useState<string>("all");

  const towns = useMemo(
    () => Array.from(new Set(restaurants.map((r) => r.city).filter((c): c is string => Boolean(c)))).sort(),
    [restaurants]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return restaurants.filter((r) => {
      const matchesTown = town === "all" || r.city === town;
      const matchesQuery =
        !q ||
        r.name.toLowerCase().includes(q) ||
        (r.shortDescription ?? "").toLowerCase().includes(q) ||
        (r.city ?? "").toLowerCase().includes(q);
      return matchesTown && matchesQuery;
    });
  }, [restaurants, query, town]);

  return (
    <div>
      <div className="mx-auto flex max-w-2xl flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Rechercher un restaurant</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un restaurant, une ville…"
            className="w-full rounded-sm border border-ink-900/15 bg-cream-50 py-3 pl-11 pr-4 text-sm text-ink-900 placeholder:text-ink-400 focus:border-wine-700 focus:outline-none focus:ring-1 focus:ring-wine-700"
          />
        </label>
        {towns.length > 1 ? (
          <select
            value={town}
            onChange={(e) => setTown(e.target.value)}
            className="rounded-sm border border-ink-900/15 bg-cream-50 px-4 py-3 text-sm text-ink-900 focus:border-wine-700 focus:outline-none focus:ring-1 focus:ring-wine-700"
          >
            <option value="all">Toutes les communes</option>
            {towns.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        ) : null}
      </div>

      <p className="mt-6 text-center text-xs uppercase tracking-wide text-ink-400">
        {filtered.length} établissement{filtered.length > 1 ? "s" : ""}
        {town !== "all" ? ` à ${town}` : ""}
      </p>

      {filtered.length === 0 ? (
        <p className="mt-16 text-center text-sm text-ink-500">
          Aucun restaurant ne correspond à votre recherche.
        </p>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((restaurant) => (
            <RestaurantCard
              key={restaurant.id}
              slug={restaurant.slug}
              name={restaurant.name}
              shortDescription={restaurant.shortDescription}
              city={restaurant.city}
              imageUrl={restaurant.imageUrl}
              imageAlt={restaurant.imageAlt}
            />
          ))}
        </div>
      )}
    </div>
  );
}
