import { EventForm } from "@/components/admin/event-form";

export const metadata = { title: "Nouvel événement | Administration" };

export default function NewEventPage() {
  return (
    <div>
      <h1 className="mb-6 font-display text-2xl text-ink-900">Nouvel événement</h1>
      <EventForm />
    </div>
  );
}
