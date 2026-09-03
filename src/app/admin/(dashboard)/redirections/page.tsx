import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { RedirectManager } from "@/components/admin/redirect-manager";

export const metadata = { title: "Redirections | Administration" };

export default async function AdminRedirectsPage() {
  const session = await auth();
  if (session?.user.role !== "SUPER_ADMIN") redirect("/admin");

  const redirects = await prisma.redirect.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <h1 className="mb-2 font-display text-2xl text-ink-900">Redirections 301</h1>
      <p className="mb-6 text-sm text-ink-500">
        Les redirections connues de l&apos;ancien site B12 sont déjà configurées au niveau serveur. Utilisez cette
        page pour en ajouter de nouvelles au fil du temps (ex. changement de slug d&apos;un restaurant).
      </p>
      <RedirectManager initialRedirects={redirects} />
    </div>
  );
}
