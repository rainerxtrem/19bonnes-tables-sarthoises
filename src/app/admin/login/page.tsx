import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Connexion administration" };

export default async function AdminLoginPage() {
  const session = await auth();
  // On ne vérifie pas que la présence d'une session mais bien le rôle : un
  // compte RESTAURATEUR connecté (via /mon-restaurant) ne doit pas être
  // renvoyé vers /admin — le middleware l'y refuserait de toute façon,
  // provoquant une boucle de redirection entre les deux pages.
  if (session?.user && (session.user.role === "SUPER_ADMIN" || session.user.role === "ADMIN")) {
    redirect("/admin");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-cream px-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-1 text-lg font-semibold text-gray-900">Administration</h1>
        <p className="mb-6 text-sm text-gray-500">19 Bonnes Tables Sarthoises</p>
        <LoginForm />
      </div>
    </div>
  );
}
