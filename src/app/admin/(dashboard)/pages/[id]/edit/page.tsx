import { notFound } from "next/navigation";
import { getPageById } from "@/lib/services/page.service";
import { PageForm } from "@/components/admin/page-form";

export const metadata = { title: "Modifier une page | Administration" };

export default async function EditPagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const page = await getPageById(id);
  if (!page) notFound();

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl text-ink-900">Modifier {page.title}</h1>
      <PageForm page={page} />
    </div>
  );
}
