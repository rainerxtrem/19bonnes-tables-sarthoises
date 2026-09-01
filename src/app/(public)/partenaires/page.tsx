import type { Metadata } from "next";
import Image from "next/image";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Partenaires" };

export default async function PartenairesPage() {
  const partners = await prisma.partner.findMany({
    where: { isActive: true },
    include: { logo: true },
    orderBy: { order: "asc" },
  });

  return (
    <div className="container py-16">
      <h1 className="mb-10 text-center text-3xl font-semibold text-brand-dark">Partenaires locaux</h1>

      {partners.length === 0 ? (
        <p className="text-center text-sm text-gray-500">Aucun partenaire publié pour le moment.</p>
      ) : (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {partners.map((partner) => {
            const content = (
              <div className="flex h-full flex-col items-center rounded-lg border border-gray-200 bg-white p-6 text-center">
                {partner.logo ? (
                  <div className="relative mb-4 h-16 w-full">
                    <Image src={partner.logo.url} alt={partner.logo.alt ?? partner.name} fill className="object-contain" />
                  </div>
                ) : null}
                <p className="font-semibold text-gray-900">{partner.name}</p>
                {partner.description ? (
                  <p className="mt-2 text-sm text-gray-600">{partner.description}</p>
                ) : null}
              </div>
            );

            return partner.websiteUrl ? (
              <a key={partner.id} href={partner.websiteUrl} target="_blank" rel="noopener noreferrer">
                {content}
              </a>
            ) : (
              <div key={partner.id}>{content}</div>
            );
          })}
        </div>
      )}
    </div>
  );
}
