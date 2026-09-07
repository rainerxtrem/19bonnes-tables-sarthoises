import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { EventForm } from "@/components/admin/event-form";

export const metadata = { title: "Modifier un événement | Administration" };

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await prisma.event.findUnique({ where: { id }, include: { mainImage: true } });
  if (!event) notFound();

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl text-ink-900">Modifier {event.title}</h1>
      <EventForm event={event} />
    </div>
  );
}
