import type { Metadata } from "next";
import Image from "next/image";
import { Gift } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { buildMetadata } from "@/lib/seo";
import { Reveal } from "@/components/public/reveal";
import { GiftVoucherForm } from "@/components/public/gift-voucher-form";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const page = await prisma.page.findUnique({ where: { slug: "bon-cadeaux" } });
  return buildMetadata({
    title: page?.seoTitle || page?.title || "Bons cadeaux",
    description:
      page?.seoDescription ||
      page?.excerpt ||
      "Offrez un bon cadeau utilisable dans n'importe lequel des restaurants membres des 19 Bonnes Tables Sarthoises.",
    path: "/bon-cadeaux",
  });
}

export default async function GiftVoucherPage() {
  const page = await prisma.page.findUnique({ where: { slug: "bon-cadeaux" }, include: { mainImage: true } });

  return (
    <article>
      <section className="border-b border-ink-900/10 bg-cream-100 py-20 sm:py-28">
        <div className="container text-center">
          <Reveal>
            <p className="eyebrow justify-center">
              <Gift className="mr-1.5 inline h-3.5 w-3.5" aria-hidden />
              Offrir un moment gourmand
            </p>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="mx-auto mt-4 max-w-2xl font-display text-4xl text-ink-900 sm:text-5xl">
              {page?.title ?? "Bons cadeaux"}
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mx-auto mt-5 max-w-xl text-ink-600">
              Un bon cadeau, valable dans n&apos;importe lequel des 19 restaurants membres de l&apos;association —
              livré par email en quelques secondes.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="container grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1fr]">
          <div>
            {page?.mainImage ? (
              <div className="relative mb-8 aspect-[4/3] overflow-hidden rounded-md shadow-card">
                <Image src={page.mainImage.url} alt={page.mainImage.alt ?? ""} fill className="object-cover" />
              </div>
            ) : null}
            {page?.content ? (
              <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: page.content }} />
            ) : null}
          </div>

          <Reveal>
            <GiftVoucherForm />
          </Reveal>
        </div>
      </section>
    </article>
  );
}
