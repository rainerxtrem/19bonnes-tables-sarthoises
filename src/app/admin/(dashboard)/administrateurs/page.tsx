import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { UserManager } from "@/components/admin/user-manager";

export const metadata = { title: "Administrateurs | Administration" };

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") redirect("/admin");

  const [users, restaurants] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        restaurantId: true,
        restaurant: { select: { name: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.restaurant.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="mb-2 text-xl font-semibold text-gray-900">Administrateurs</h1>
      <p className="mb-6 text-sm text-gray-500">
        Gérez les comptes admin/super-admin ainsi que les accès individuels des restaurateurs (
        <code className="rounded bg-gray-100 px-1 py-0.5 text-xs">/mon-restaurant</code>).
      </p>
      <UserManager initialUsers={users} restaurants={restaurants} currentUserId={session.user.id} />
    </div>
  );
}
