import { PageForm } from "@/components/admin/page-form";

export const metadata = { title: "Nouvelle page | Administration" };

export default function NewPagePage() {
  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-gray-900">Nouvelle page</h1>
      <PageForm />
    </div>
  );
}
