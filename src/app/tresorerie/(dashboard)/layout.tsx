import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";

export default async function TresorerieLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "TRESORIER") {
    redirect("/tresorerie/login");
  }

  return (
    <div className="min-h-screen bg-cream-50">
      <header className="flex h-16 items-center justify-between border-b border-ink-100 bg-white px-6 shadow-sm">
        <div>
          <p className="font-display text-base text-ink-900">{session.user.name}</p>
          <p className="text-xs text-ink-500">Espace trésorerie</p>
        </div>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/tresorerie/login" });
          }}
        >
          <button type="submit" className="text-sm text-ink-500 hover:text-wine-700">
            Déconnexion
          </button>
        </form>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
