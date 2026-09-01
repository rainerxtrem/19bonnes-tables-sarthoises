import type { Metadata } from "next";
import Image from "next/image";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Le bureau" };

export default async function BureauPage() {
  const members = await prisma.boardMember.findMany({
    where: { isActive: true },
    include: { photo: true, restaurant: { select: { name: true, slug: true } } },
    orderBy: { order: "asc" },
  });

  return (
    <div className="container py-16">
      <h1 className="mb-2 text-center text-3xl font-semibold text-brand-dark">
        Bureau de l&apos;association
      </h1>
      <p className="mx-auto mt-4 max-w-2xl text-center text-sm text-gray-600">
        Le bureau met à profit sa vaste expérience pour aider l&apos;association à répondre à ses divers
        besoins.
      </p>

      {members.length === 0 ? (
        <p className="mt-10 text-center text-sm text-gray-500">Aucun membre publié pour le moment.</p>
      ) : (
        <div className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {members.map((member) => (
            <div key={member.id} className="text-center">
              <div className="relative mx-auto aspect-square w-32 overflow-hidden rounded-full bg-gray-100">
                {member.photo ? (
                  <Image src={member.photo.url} alt={member.photo.alt ?? `${member.firstName} ${member.lastName}`} fill className="object-cover" />
                ) : null}
              </div>
              <p className="mt-3 text-sm font-semibold text-gray-900">
                {member.firstName} {member.lastName}
              </p>
              <p className="text-xs text-gray-500">{member.role}</p>
              {member.restaurant ? (
                <p className="text-xs text-brand">{member.restaurant.name}</p>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
