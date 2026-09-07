import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { PressAssetForm } from "@/components/admin/press-asset-form";

export const metadata = { title: "Modifier un visuel | Administration" };

export default async function EditPressAssetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const asset = await prisma.pressAsset.findUnique({ where: { id }, include: { media: true } });
  if (!asset) notFound();

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl text-ink-900">Modifier {asset.label}</h1>
      <PressAssetForm asset={asset} />
    </div>
  );
}
