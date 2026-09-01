import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getRestaurantById } from "@/lib/services/restaurant.service";
import { RestaurantForm } from "@/components/admin/restaurant-form";

export const metadata: Metadata = { title: "Ma fiche restaurant" };

export default async function MonRestaurantPage() {
  const session = await auth();
  // Filet de sécurité : le middleware + le layout ont déjà vérifié le rôle
  // et la présence de restaurantId avant d'arriver ici.
  if (!session?.user?.restaurantId) redirect("/mon-restaurant/login");

  const restaurant = await getRestaurantById(session.user.restaurantId);
  if (!restaurant) redirect("/mon-restaurant/login");

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Ma fiche restaurant</h1>
          <p className="mt-1 text-sm text-gray-500">
            Modifiez les informations, les photos et la galerie de votre établissement. Les changements sont
            visibles immédiatement sur le site public.
          </p>
        </div>
        <Link href={`/${restaurant.slug}`} target="_blank" className="shrink-0 text-sm text-brand hover:underline">
          Voir ma fiche publique ↗
        </Link>
      </div>
      <RestaurantForm restaurant={restaurant} mode="owner" redirectTo="/mon-restaurant" />
    </div>
  );
}
