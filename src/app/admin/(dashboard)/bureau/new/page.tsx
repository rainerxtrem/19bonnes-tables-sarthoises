import { prisma } from "@/lib/db/prisma";
import { BoardMemberForm } from "@/components/admin/board-member-form";

export const metadata = { title: "Nouveau membre du bureau | Administration" };

export default async function NewBoardMemberPage() {
  const restaurants = await prisma.restaurant.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-gray-900">Nouveau membre du bureau</h1>
      <BoardMemberForm restaurants={restaurants} />
    </div>
  );
}
