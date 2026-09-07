import type { Metadata } from "next";
import Image from "next/image";
import { Download } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { getSiteSettings } from "@/lib/services/settings.service";
import { Reveal } from "@/components/public/reveal";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata: Metadata = buildMetadata({
  title: "Espace presse",
  description: "Logos, photos et ressources téléchargeables pour la presse — 19 Bonnes Tables Sarthoises.",
  path: "/presse",
});

function downloadUrl(mediaUrl: string, filename: string) {
  const separator = mediaUrl.includes("?") ? "&" : "?";
  return `${mediaUrl}${separator}download=${encodeURIComponent(filename)}`;
}

export default async function PressPage() {
  const [assets, settings] = await Promise.all([
    prisma.pressAsset.findMany({ where: { isActive: true }, include: { media: true }, orderBy: { order: "asc" } }),
    getSiteSettings(),
  ]);

  return (
    <div>
      <section className="border-b border-ink-900/10 bg-cream-100 py-20 sm:py-28">
        <div className="container text-center">
          <Reveal>
            <p className="eyebrow justify-center">Journalistes &amp; médias</p>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="mx-auto mt-4 max-w-2xl font-display text-4xl text-ink-900 sm:text-5xl">Espace presse</h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mx-auto mt-5 max-w-xl text-ink-600">
              Logos et visuels de l&apos;association des 19 Bonnes Tables Sarthoises, libres de téléchargement pour
              un usage rédactionnel.
              {settings.contactEmail ? (
                <>
                  {" "}
                  Pour toute demande complémentaire (interview, photo haute définition, dossier de presse) :{" "}
                  <a href={`mailto:${settings.contactEmail}`} className="link-sweep font-medium text-wine-700">
                    {settings.contactEmail}
                  </a>
                  .
                </>
              ) : null}
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="container">
          {assets.length === 0 ? (
            <p className="text-center text-sm text-ink-500">Aucun visuel disponible pour le moment.</p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {assets.map((asset, index) => (
                <Reveal key={asset.id} delay={(index % 3) * 100}>
                  <div className="flex h-full flex-col overflow-hidden rounded-md border border-ink-900/10 bg-cream-50 shadow-card">
                    <div className="relative aspect-video w-full bg-ink-100">
                      <Image src={asset.media.url} alt={asset.media.alt ?? asset.label} fill className="object-contain p-4" />
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <p className="font-display text-lg text-ink-900">{asset.label}</p>
                      {asset.description ? <p className="mt-1.5 text-sm text-ink-500">{asset.description}</p> : null}
                      {/* Téléchargement de fichier (Content-Disposition côté route /media), pas de navigation interne — <a> volontaire. */}
                      <a
                        href={downloadUrl(asset.media.url, asset.media.filename)}
                        className="link-sweep mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-wine-700"
                      >
                        <Download className="h-4 w-4" aria-hidden />
                        Télécharger
                      </a>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
