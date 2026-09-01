import { listRestaurantsAdmin } from "@/lib/services/restaurant.service";
import { RestaurantListHeader, RestaurantTable } from "@/components/admin/restaurant-table";

export const metadata = { title: "Restaurants | Administration" };

export default async function AdminRestaurantsPage() {
  const restaurants = await listRestaurantsAdmin();

  const rows = restaurants.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    status: r.status,
    order: r.order,
    updatedAt: r.updatedAt.toISOString(),
    mainImage: r.mainImage ? { url: r.mainImage.url, alt: r.mainImage.alt } : null,
  }));

  return (
    <div>
      <RestaurantListHeader />
      <RestaurantTable initialRows={rows} />
    </div>
  );
}
