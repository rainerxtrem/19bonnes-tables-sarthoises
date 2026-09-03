import { PageForm } from "@/components/admin/page-form";

export const metadata = { title: "Nouvelle page | Administration" };

export default function NewPagePage() {
  return (
    <div>
      <h1 className="mb-6 font-display text-2xl text-ink-900">Nouvelle page</h1>
      <PageForm />
    </div>
  );
}
