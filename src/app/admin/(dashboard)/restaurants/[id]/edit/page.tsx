import { notFound } from "next/navigation";
import { getRestaurantById } from "@/lib/services/restaurant.service";
import { RestaurantForm } from "@/components/admin/restaurant-form";

export const metadata = { title: "Modifier un restaurant | Administration" };

export default async function EditRestaurantPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const restaurant = await getRestaurantById(id);
  if (!restaurant) notFound();

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl text-ink-900">Modifier {restaurant.name}</h1>
      <RestaurantForm restaurant={restaurant} />
    </div>
  );
}
