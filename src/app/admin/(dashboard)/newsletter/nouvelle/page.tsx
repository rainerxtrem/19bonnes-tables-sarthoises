import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { listActiveSubscribers } from "@/lib/services/newsletter.service";
import { NewsletterCampaignForm } from "@/components/admin/newsletter-campaign-form";

export const metadata = { title: "Nouvelle campagne | Administration" };

export default async function NewNewsletterCampaignPage() {
  const [articles, subscribers] = await Promise.all([
    prisma.article.findMany({
      where: { status: "PUBLISHED" },
      select: { id: true, title: true, excerpt: true },
      orderBy: { publishedAt: "desc" },
      take: 50,
    }),
    listActiveSubscribers(),
  ]);

  return (
    <div>
      <Link
        href="/admin/newsletter"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
        Retour aux abonnés
      </Link>
      <h1 className="mb-2 text-xl font-semibold text-gray-900">Nouvelle campagne</h1>
      <p className="mb-6 max-w-2xl text-sm text-gray-500">
        Envoie un email à tous les abonnés actifs de la newsletter. Associe un article publié pour ajouter
        automatiquement un bouton « Lire l&apos;article complet », ou rédige un message libre.
      </p>
      <div className="max-w-xl">
        <NewsletterCampaignForm articles={articles} subscriberCount={subscribers.length} />
      </div>
    </div>
  );
}
