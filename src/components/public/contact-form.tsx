"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Send } from "lucide-react";
import { submitContactForm, type ContactFormState } from "@/app/(public)/contact/actions";

const initialState: ContactFormState = {};

const inputClass =
  "w-full rounded-sm border border-ink-900/15 bg-cream-50 px-3.5 py-2.5 text-sm text-ink-900 shadow-sm placeholder:text-ink-400 focus:border-wine-700 focus:outline-none focus:ring-1 focus:ring-wine-700";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex w-full items-center justify-center gap-2 rounded-sm bg-wine-700 px-4 py-3 text-sm font-medium tracking-wide text-cream-50 transition-colors hover:bg-wine-800 disabled:opacity-50"
    >
      {pending ? "Envoi..." : "Envoyer le message"}
      {!pending ? <Send className="h-4 w-4" aria-hidden /> : null}
    </button>
  );
}

export function ContactForm() {
  const [state, formAction] = useActionState(submitContactForm, initialState);

  if (state.success) {
    return (
      <p className="rounded-sm border border-gold-300 bg-gold-50 p-5 text-sm text-ink-800">
        Merci, votre message a bien été envoyé. Nous vous répondrons dans les meilleurs délais.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-5 rounded-md border border-ink-900/10 bg-cream-50 p-6 shadow-card sm:p-8">
      <div>
        <label htmlFor="fullName" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-600">
          Identité
        </label>
        <input id="fullName" name="fullName" required placeholder="Jean Dupont" className={inputClass} />
        {state.fieldErrors?.fullName ? <p className="mt-1 text-xs text-wine-700">{state.fieldErrors.fullName[0]}</p> : null}
      </div>

      <div>
        <label htmlFor="email" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-600">
          E-mail
        </label>
        <input id="email" name="email" type="email" required placeholder="email@gmail.com" className={inputClass} />
        {state.fieldErrors?.email ? <p className="mt-1 text-xs text-wine-700">{state.fieldErrors.email[0]}</p> : null}
      </div>

      <div>
        <label htmlFor="phone" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-600">
          Numéro de téléphone
        </label>
        <input id="phone" name="phone" placeholder="00.00.00.00.00" className={inputClass} />
        {state.fieldErrors?.phone ? <p className="mt-1 text-xs text-wine-700">{state.fieldErrors.phone[0]}</p> : null}
      </div>

      <div>
        <label htmlFor="subject" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-600">
          Objet
        </label>
        <input id="subject" name="subject" className={inputClass} />
      </div>

      <div>
        <label htmlFor="message" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-600">
          Message
        </label>
        <textarea id="message" name="message" required rows={4} className={inputClass} />
        {state.fieldErrors?.message ? <p className="mt-1 text-xs text-wine-700">{state.fieldErrors.message[0]}</p> : null}
      </div>

      {/* Honeypot anti-spam : champ invisible, doit rester vide */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Site web</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <label className="flex items-start gap-2.5 text-xs text-ink-600">
        <input type="checkbox" name="consentGdpr" required className="mt-0.5 accent-wine-700" />
        J&apos;autorise ce site à enregistrer ma demande afin que je puisse recevoir une réponse.
      </label>

      {state.error ? <p className="text-sm text-wine-700">{state.error}</p> : null}

      <SubmitButton />
    </form>
  );
}
