import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { MobileNavProvider } from "@/components/admin/mobile-nav-context";
import { MobileNavToggle } from "@/components/admin/mobile-nav-toggle";
import { prisma } from "@/lib/db/prisma";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }

  const unreadMessages = await prisma.contactMessage.count({ where: { status: "UNREAD" } });

  return (
    <MobileNavProvider>
      <div className="flex min-h-screen bg-cream-50">
        <AdminSidebar role={session.user.role} />
        {/* min-w-0 : sans ça, une table large dans {children} peut forcer
            cette colonne flex à s'étirer au-delà de l'écran plutôt que de
            laisser son propre conteneur `overflow-x-auto` gérer le débord. */}
        <div className="min-w-0 flex-1">
          <AdminTopbar name={session.user.name} unreadMessages={unreadMessages} leftSlot={<MobileNavToggle />} />
          <main className="p-4 sm:p-8">{children}</main>
        </div>
      </div>
    </MobileNavProvider>
  );
}
