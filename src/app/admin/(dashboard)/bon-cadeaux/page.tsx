import { prisma } from "@/lib/db/prisma";
import { PageForm } from "@/components/admin/page-form";

export const metadata = { title: "Bons cadeaux | Administration" };

export default async function AdminBonCadeauxPage() {
  const page = await prisma.page.findUnique({ where: { slug: "bon-cadeaux" } });

  return (
    <div>
      <h1 className="mb-2 text-xl font-semibold text-gray-900">Bons cadeaux</h1>
      <p className="mb-6 text-sm text-gray-500">
        Ce contenu est une page CMS comme les autres (visible sur /bon-cadeaux). La commande en ligne, le paiement
        et la génération automatique de bons ne sont pas développés pour le moment — l&apos;architecture (modèle
        Page + Media) permet de les ajouter plus tard sans tout reconstruire.
      </p>
      {page ? <PageForm page={page} /> : <p className="text-sm text-red-600">Page introuvable — relancez le seed.</p>}
    </div>
  );
}
