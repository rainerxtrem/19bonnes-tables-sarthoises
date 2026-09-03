import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getSiteSettings } from "@/lib/services/settings.service";
import { SettingsForm } from "@/components/admin/settings-form";

export const metadata = { title: "Paramètres | Administration" };

export default async function AdminSettingsPage() {
  const session = await auth();
  if (session?.user.role !== "SUPER_ADMIN") redirect("/admin");

  const settings = await getSiteSettings();

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl text-ink-900">Paramètres du site</h1>
      <SettingsForm settings={settings} />
    </div>
  );
}
