import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { RestaurateurLoginForm } from "./login-form";

export const metadata: Metadata = { title: "Espace restaurateur" };

export default async function RestaurateurLoginPage() {
  const session = await auth();
  if (session?.user?.role === "RESTAURATEUR") {
    redirect("/mon-restaurant");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream-100 px-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-1 font-display text-lg font-medium text-ink-900">Espace restaurateur</h1>
        <p className="mb-6 text-sm text-gray-500">Gérez votre fiche et vos photos.</p>
        <RestaurateurLoginForm />
      </div>
    </div>
  );
}
