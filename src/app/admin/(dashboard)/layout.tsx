import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { prisma } from "@/lib/db/prisma";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }

  const unreadMessages = await prisma.contactMessage.count({ where: { status: "UNREAD" } });

  return (
    <div className="flex min-h-screen bg-cream-50">
      <AdminSidebar role={session.user.role} />
      <div className="flex-1">
        <AdminTopbar name={session.user.name} unreadMessages={unreadMessages} />
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
