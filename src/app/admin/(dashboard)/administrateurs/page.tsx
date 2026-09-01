import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { UserManager } from "@/components/admin/user-manager";

export const metadata = { title: "Administrateurs | Administration" };

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") redirect("/admin");

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, isActive: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-gray-900">Administrateurs</h1>
      <UserManager initialUsers={users} currentUserId={session.user.id} />
    </div>
  );
}
