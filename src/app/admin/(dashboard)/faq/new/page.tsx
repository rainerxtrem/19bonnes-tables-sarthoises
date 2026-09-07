import { FaqForm } from "@/components/admin/faq-form";

export const metadata = { title: "Nouvelle question | Administration" };

export default function NewFaqPage() {
  return (
    <div>
      <h1 className="mb-6 font-display text-2xl text-ink-900">Nouvelle question</h1>
      <FaqForm />
    </div>
  );
}
