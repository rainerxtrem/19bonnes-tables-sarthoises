import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { FaqForm } from "@/components/admin/faq-form";

export const metadata = { title: "Modifier une question | Administration" };

export default async function EditFaqPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await prisma.faqItem.findUnique({ where: { id } });
  if (!item) notFound();

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl text-ink-900">Modifier la question</h1>
      <FaqForm item={item} />
    </div>
  );
}
