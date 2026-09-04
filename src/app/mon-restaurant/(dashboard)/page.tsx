import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Gift, UtensilsCrossed } from "lucide-react";
import { auth } from "@/lib/auth";
import { getRestaurantById } from "@/lib/services/restaurant.service";

export const metadata: Metadata = { title: "Espace restaurateur" };

export default async function MonRestaurantHomePage() {
  const session = await auth();
  if (!session?.user?.restaurantId) redirect("/mon-restaurant/login");

  const restaurant = await getRestaurantById(session.user.restaurantId);
  if (!restaurant) redirect("/mon-restaurant/login");

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-gray-900">Bonjour {session.user.name} 👋</h1>
        <p className="mt-1 text-sm text-gray-500">Que souhaitez-vous faire aujourd&apos;hui ?</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Link
          href="/mon-restaurant/fiche"
          className="group flex flex-col justify-between rounded-lg border border-ink-100 bg-white p-6 shadow-sm transition-all hover:border-wine-200 hover:shadow-md"
        >
          <div>
            <span className="flex h-11 w-11 items-center justify-center rounded-md bg-wine-50 text-wine-700">
              <UtensilsCrossed className="h-5 w-5" aria-hidden />
            </span>
            <h2 className="mt-4 font-display text-lg text-ink-900">Modifier ma page restaurant</h2>
            <p className="mt-1.5 text-sm text-ink-500">
              Informations, photos et galerie de {restaurant.name}, visibles immédiatement sur le site public.
            </p>
          </div>
          <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-wine-700">
            Accéder à ma fiche
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </span>
        </Link>

        <Link
          href="/mon-restaurant/bons-cadeaux"
          className="group flex flex-col justify-between rounded-lg border border-ink-100 bg-white p-6 shadow-sm transition-all hover:border-wine-200 hover:shadow-md"
        >
          <div>
            <span className="flex h-11 w-11 items-center justify-center rounded-md bg-gold-100 text-gold-800">
              <Gift className="h-5 w-5" aria-hidden />
            </span>
            <h2 className="mt-4 font-display text-lg text-ink-900">Validation bons cadeaux</h2>
            <p className="mt-1.5 text-sm text-ink-500">
              Vérifiez et validez un bon cadeau présenté par un client, dans n&apos;importe lequel des restaurants
              membres.
            </p>
          </div>
          <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-wine-700">
            Valider un bon
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </span>
        </Link>
      </div>
    </div>
  );
}
