import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { PartnerForm } from "@/components/admin/partner-form";

export const metadata = { title: "Modifier un partenaire | Administration" };

export default async function EditPartnerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const partner = await prisma.partner.findUnique({ where: { id }, include: { logo: true } });
  if (!partner) notFound();

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-gray-900">Modifier {partner.name}</h1>
      <PartnerForm partner={partner} />
    </div>
  );
}
