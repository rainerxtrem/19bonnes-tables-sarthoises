import { redirect } from "next/navigation";
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
    <div className="min-h-screen bg-gray-50">
      <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
        <div>
          <p className="font-display text-base text-ink-900">{restaurant.name}</p>
          <p className="text-xs text-gray-500">Espace restaurateur</p>
        </div>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/mon-restaurant/login" });
          }}
        >
          <button type="submit" className="text-sm text-gray-500 hover:text-brand-dark">
            Déconnexion
          </button>
        </form>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
