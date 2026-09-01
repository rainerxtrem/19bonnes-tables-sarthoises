import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { BoardMemberForm } from "@/components/admin/board-member-form";

export const metadata = { title: "Modifier un membre | Administration" };

export default async function EditBoardMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [member, restaurants] = await Promise.all([
    prisma.boardMember.findUnique({ where: { id }, include: { photo: true } }),
    prisma.restaurant.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);
  if (!member) notFound();

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-gray-900">
        Modifier {member.firstName} {member.lastName}
      </h1>
      <BoardMemberForm member={member} restaurants={restaurants} />
    </div>
  );
}
