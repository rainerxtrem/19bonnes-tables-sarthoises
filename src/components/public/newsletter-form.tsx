"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Mail } from "lucide-react";
import { subscribeAction, type NewsletterState } from "@/app/(public)/newsletter/actions";

const initialState: NewsletterState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-sm bg-gold-400 px-4 py-2.5 text-sm font-medium text-ink-900 transition-colors hover:bg-gold-500 disabled:opacity-50"
    >
      {pending ? "Inscription..." : "S'inscrire"}
    </button>
  );
}

export function NewsletterForm() {
  const [state, formAction] = useActionState(subscribeAction, initialState);

  if (state.success) {
    return (
      <p className="flex items-center gap-2 text-sm text-gold-300">
        <Mail className="h-4 w-4" aria-hidden />
        Merci de votre inscription ! Un email de bienvenue vient de vous être envoyé.
      </p>
    );
  }

  return (
    <form action={formAction} className="w-full max-w-sm">
      <div className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor="newsletter-email" className="sr-only">
          Adresse email
        </label>
        <input
          id="newsletter-email"
          name="email"
          type="email"
          required
          placeholder="votre@email.fr"
          className="w-full rounded-sm border border-cream-50/20 bg-cream-50/5 px-3.5 py-2.5 text-sm text-cream-50 placeholder:text-cream-100/40 focus:border-gold-400 focus:outline-none"
        />
        <SubmitButton />
      </div>

      {/* Pot de miel anti-spam : invisible, doit rester vide */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="newsletter-website">Site web</label>
        <input id="newsletter-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <label className="mt-2 flex items-start gap-2 text-xs text-cream-100/50">
        <input type="checkbox" name="consent" required className="mt-0.5 accent-gold-400" />
        J&apos;accepte de recevoir la newsletter de l&apos;association. Désinscription possible à tout moment.
      </label>

      {state.error ? <p className="mt-2 text-xs text-red-300">{state.error}</p> : null}
    </form>
  );
}
