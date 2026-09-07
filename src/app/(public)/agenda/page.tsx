import type { Metadata } from "next";
import Image from "next/image";
import { Calendar, MapPin } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { prisma } from "@/lib/db/prisma";
import { Reveal } from "@/components/public/reveal";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata: Metadata = buildMetadata({
  title: "Agenda",
  description: "Les prochains événements de l'association des 19 Bonnes Tables Sarthoises : repas, portes ouvertes, soirées thématiques.",
  path: "/agenda",
});

function formatRange(startAt: Date, endAt: Date | null) {
  const start = format(startAt, "EEEE d MMMM yyyy à HH:mm", { locale: fr });
  if (!endAt) return start;
  const sameDay = startAt.toDateString() === endAt.toDateString();
  return sameDay ? `${start} – ${format(endAt, "HH:mm", { locale: fr })}` : `${start} → ${format(endAt, "d MMMM yyyy à HH:mm", { locale: fr })}`;
}

export default async function AgendaPage() {
  const now = new Date();
  const events = await prisma.event.findMany({
    where: { status: "PUBLISHED" },
    include: { mainImage: true },
    orderBy: { startAt: "asc" },
  });

  const upcoming = events.filter((e) => (e.endAt ?? e.startAt) >= now);
  const past = events.filter((e) => (e.endAt ?? e.startAt) < now).reverse();

  return (
    <div>
      <section className="border-b border-ink-900/10 bg-cream-100 py-20 sm:py-28">
        <div className="container text-center">
          <Reveal>
            <p className="eyebrow justify-center">Vie de l&apos;association</p>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="mx-auto mt-4 max-w-2xl font-display text-4xl text-ink-900 sm:text-5xl">Agenda</h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mx-auto mt-5 max-w-xl text-ink-600">
              Repas, portes ouvertes, soirées thématiques : retrouvez les prochains rendez-vous de l&apos;association.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="container max-w-3xl">
          {upcoming.length === 0 ? (
            <p className="text-center text-sm text-ink-500">Aucun événement à venir pour le moment.</p>
          ) : (
            <div className="space-y-6">
              {upcoming.map((event, index) => (
                <Reveal key={event.id} delay={(index % 3) * 100}>
                  <article className="overflow-hidden rounded-md border border-ink-900/10 bg-cream-50 shadow-card sm:flex">
                    {event.mainImage ? (
                      <div className="relative h-48 w-full shrink-0 sm:h-auto sm:w-56">
                        <Image src={event.mainImage.url} alt={event.mainImage.alt ?? event.title} fill className="object-cover" />
                      </div>
                    ) : null}
                    <div className="p-6">
                      <h2 className="font-display text-xl text-ink-900">{event.title}</h2>
                      <p className="mt-2 flex items-center gap-1.5 text-sm text-wine-700">
                        <Calendar className="h-3.5 w-3.5 shrink-0" aria-hidden />
                        {formatRange(event.startAt, event.endAt)}
                      </p>
                      {event.location ? (
                        <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-500">
                          <MapPin className="h-3.5 w-3.5 shrink-0 text-gold-600" aria-hidden />
                          {event.location}
                        </p>
                      ) : null}
                      {event.description ? (
                        <p className="mt-3 whitespace-pre-wrap text-sm text-ink-600">{event.description}</p>
                      ) : null}
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {past.length > 0 ? (
        <section className="border-t border-ink-900/10 bg-cream-100 py-16 sm:py-20">
          <div className="container max-w-3xl">
            <p className="eyebrow mb-8">Événements passés</p>
            <ul className="space-y-3">
              {past.map((event) => (
                <li key={event.id} className="flex flex-wrap items-baseline gap-x-3 border-b border-ink-900/10 pb-3 text-sm">
                  <span className="text-ink-400">{format(event.startAt, "d MMMM yyyy", { locale: fr })}</span>
                  <span className="font-medium text-ink-700">{event.title}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </div>
  );
}
