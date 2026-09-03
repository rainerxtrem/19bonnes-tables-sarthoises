import { redirect } from "next/navigation";
import Link from "next/link";
import { Gift } from "lucide-react";
import { auth, signOut } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

export default async function RestaurateurLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "RESTAURATEUR" || !session.user.restaurantId) {
    redirect("/mon-restaurant/login");
  }

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: session.user.restaurantId },
    select: { name: true },
  });
  if (!restaurant) redirect("/mon-restaurant/login");

  return (
    <div className="min-h-screen bg-cream-50">
      <header className="flex h-16 items-center justify-between border-b border-ink-100 bg-white px-6 shadow-sm">
        <div>
          <p className="font-display text-base text-ink-900">{restaurant.name}</p>
          <p className="text-xs text-ink-500">Espace restaurateur</p>
        </div>
        <nav className="flex items-center gap-5">
          <Link href="/mon-restaurant" className="text-sm text-ink-600 hover:text-wine-700">
            Ma fiche
          </Link>
          <Link
            href="/mon-restaurant/bons-cadeaux"
            className="flex items-center gap-1.5 text-sm text-ink-600 hover:text-wine-700"
          >
            <Gift className="h-4 w-4" aria-hidden />
            Bons cadeaux
          </Link>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/mon-restaurant/login" });
            }}
          >
            <button type="submit" className="text-sm text-ink-500 hover:text-wine-700">
              Déconnexion
            </button>
          </form>
        </nav>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
