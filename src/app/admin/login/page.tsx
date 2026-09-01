import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Connexion administration" };

export default async function AdminLoginPage() {
  const session = await auth();
  if (session?.user) {
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
