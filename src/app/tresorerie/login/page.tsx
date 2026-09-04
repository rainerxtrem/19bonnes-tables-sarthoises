import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { TresorierLoginForm } from "./login-form";

export const metadata: Metadata = { title: "Espace trésorerie" };

export default async function TresorierLoginPage() {
  const session = await auth();
  if (session?.user?.role === "TRESORIER") {
    redirect("/tresorerie");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream-100 px-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-1 font-display text-lg font-medium text-ink-900">Espace trésorerie</h1>
        <p className="mb-6 text-sm text-gray-500">Suivi des versements aux restaurants.</p>
        <TresorierLoginForm />
      </div>
    </div>
  );
}
