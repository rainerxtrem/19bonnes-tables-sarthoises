"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { submitContactForm, type ContactFormState } from "@/app/(public)/contact/actions";

const initialState: ContactFormState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-md bg-brand px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-50"
    >
      {pending ? "Envoi..." : "Envoyer"}
    </button>
  );
}

export function ContactForm() {
  const [state, formAction] = useActionState(submitContactForm, initialState);

  if (state.success) {
    return (
      <p className="rounded-md bg-green-50 p-4 text-sm text-green-800">
        Merci, votre message a bien été envoyé. Nous vous répondrons dans les meilleurs délais.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="fullName" className="mb-1 block text-sm font-medium text-gray-700">
          Identité
        </label>
        <input
          id="fullName"
          name="fullName"
          required
          placeholder="Jean Dupont"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        />
        {state.fieldErrors?.fullName ? <p className="mt-1 text-xs text-red-600">{state.fieldErrors.fullName[0]}</p> : null}
      </div>

      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="email@gmail.com"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        />
        {state.fieldErrors?.email ? <p className="mt-1 text-xs text-red-600">{state.fieldErrors.email[0]}</p> : null}
      </div>

      <div>
        <label htmlFor="phone" className="mb-1 block text-sm font-medium text-gray-700">
          Numéro de téléphone
        </label>
        <input
          id="phone"
          name="phone"
          placeholder="00.00.00.00.00"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        />
        {state.fieldErrors?.phone ? <p className="mt-1 text-xs text-red-600">{state.fieldErrors.phone[0]}</p> : null}
      </div>

      <div>
        <label htmlFor="subject" className="mb-1 block text-sm font-medium text-gray-700">
          Objet
        </label>
        <input
          id="subject"
          name="subject"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        />
      </div>

      <div>
        <label htmlFor="message" className="mb-1 block text-sm font-medium text-gray-700">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={4}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        />
        {state.fieldErrors?.message ? <p className="mt-1 text-xs text-red-600">{state.fieldErrors.message[0]}</p> : null}
      </div>

      {/* Honeypot anti-spam : champ invisible, doit rester vide */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Site web</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <label className="flex items-start gap-2 text-xs text-gray-600">
        <input type="checkbox" name="consentGdpr" required className="mt-0.5" />
        J&apos;autorise ce site à enregistrer ma demande afin que je puisse recevoir une réponse.
      </label>

      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}

      <SubmitButton />
    </form>
  );
}
