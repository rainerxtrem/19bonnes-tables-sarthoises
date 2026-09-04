"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";

export type LoginState = { error?: string };

const LOGIN_LIMIT = 3;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

export async function tresorierLoginAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (email && !checkRateLimit(`login:tresorier:${email}`, LOGIN_LIMIT, LOGIN_WINDOW_MS)) {
    return { error: "Trop de tentatives de connexion. Réessayez dans quelques minutes." };
  }
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/tresorerie",
    });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") {
        return { error: "Email ou mot de passe incorrect." };
      }
      return { error: "Une erreur est survenue lors de la connexion." };
    }
    // NEXT_REDIRECT est levée volontairement par signIn en cas de succès.
    throw error;
  }
}
