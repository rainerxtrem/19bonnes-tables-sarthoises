"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Gift, CreditCard } from "lucide-react";
import { purchaseVoucherAction, type GiftVoucherPurchaseState } from "@/app/(public)/bon-cadeaux/actions";

const initialState: GiftVoucherPurchaseState = {};

const PRESET_AMOUNTS = [30, 50, 100];

const inputClass =
  "w-full rounded-sm border border-ink-900/15 bg-white px-3.5 py-2.5 text-sm text-ink-900 shadow-sm placeholder:text-ink-400 focus:border-wine-700 focus:outline-none focus:ring-1 focus:ring-wine-700";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex w-full items-center justify-center gap-2 rounded-sm bg-wine-700 px-4 py-3 text-sm font-medium tracking-wide text-cream-50 transition-colors hover:bg-wine-800 disabled:opacity-50"
    >
      {pending ? "Redirection vers le paiement..." : "Payer et recevoir mon bon cadeau"}
      {!pending ? <CreditCard className="h-4 w-4" aria-hidden /> : null}
    </button>
  );
}

export function GiftVoucherForm() {
  const [state, formAction] = useActionState(purchaseVoucherAction, initialState);
  const [selectedAmount, setSelectedAmount] = useState<number | "custom">(50);
  const [customAmount, setCustomAmount] = useState("");
  const [isGift, setIsGift] = useState(false);

  return (
    <form
      action={formAction}
      className="space-y-6 rounded-md border border-ink-900/10 bg-cream-50 p-6 shadow-card sm:p-8"
    >
      <div>
        <p className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-ink-600">
          <Gift className="h-3.5 w-3.5 text-gold-600" aria-hidden />
          Montant du bon
        </p>
        <div className="grid grid-cols-4 gap-2">
          {PRESET_AMOUNTS.map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => setSelectedAmount(amount)}
              className={`rounded-sm border px-3 py-2.5 text-sm font-medium transition-colors ${
                selectedAmount === amount
                  ? "border-wine-700 bg-wine-700 text-cream-50"
                  : "border-ink-900/15 bg-white text-ink-800 hover:border-wine-700"
              }`}
            >
              {amount} €
            </button>
          ))}
          <button
            type="button"
            onClick={() => setSelectedAmount("custom")}
            className={`rounded-sm border px-3 py-2.5 text-sm font-medium transition-colors ${
              selectedAmount === "custom"
                ? "border-wine-700 bg-wine-700 text-cream-50"
                : "border-ink-900/15 bg-white text-ink-800 hover:border-wine-700"
            }`}
          >
            Libre
          </button>
        </div>
        {selectedAmount === "custom" ? (
          <input
            type="number"
            min={10}
            max={500}
            step={1}
            placeholder="Montant en €"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            className={`mt-2 ${inputClass}`}
          />
        ) : null}
        <input type="hidden" name="amount" value={selectedAmount === "custom" ? customAmount : selectedAmount} />
        {state.fieldErrors?.amount ? <p className="mt-1 text-xs text-wine-700">{state.fieldErrors.amount[0]}</p> : null}
      </div>

      <div>
        <label htmlFor="buyerName" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-600">
          Votre nom
        </label>
        <input id="buyerName" name="buyerName" required placeholder="Jean Dupont" className={inputClass} />
        {state.fieldErrors?.buyerName ? <p className="mt-1 text-xs text-wine-700">{state.fieldErrors.buyerName[0]}</p> : null}
      </div>

      <div>
        <label htmlFor="buyerEmail" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-600">
          Votre email
        </label>
        <input id="buyerEmail" name="buyerEmail" type="email" required placeholder="email@gmail.com" className={inputClass} />
        {state.fieldErrors?.buyerEmail ? <p className="mt-1 text-xs text-wine-700">{state.fieldErrors.buyerEmail[0]}</p> : null}
      </div>

      <label className="flex items-center gap-2.5 text-sm text-ink-800">
        <input
          type="checkbox"
          checked={isGift}
          onChange={(e) => setIsGift(e.target.checked)}
          className="accent-wine-700"
        />
        C&apos;est un cadeau pour quelqu&apos;un d&apos;autre
      </label>

      {isGift ? (
        <div className="space-y-4 border-l-2 border-gold-300 pl-4">
          <div>
            <label htmlFor="recipientName" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-600">
              Nom du destinataire
            </label>
            <input id="recipientName" name="recipientName" placeholder="Marie Martin" className={inputClass} />
          </div>
          <div>
            <label htmlFor="recipientEmail" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-600">
              Email du destinataire
            </label>
            <input id="recipientEmail" name="recipientEmail" type="email" placeholder="email@gmail.com" className={inputClass} />
            {state.fieldErrors?.recipientEmail ? (
              <p className="mt-1 text-xs text-wine-700">{state.fieldErrors.recipientEmail[0]}</p>
            ) : null}
          </div>
          <div>
            <label htmlFor="message" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-600">
              Message personnel (optionnel)
            </label>
            <textarea id="message" name="message" rows={3} placeholder="Joyeux anniversaire !" className={inputClass} />
          </div>
        </div>
      ) : null}

      {/* Honeypot anti-spam : champ invisible, doit rester vide */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Site web</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {state.error ? <p className="text-sm text-wine-700">{state.error}</p> : null}

      <SubmitButton />

      <p className="text-center text-xs text-ink-500">
        Paiement sécurisé par carte bancaire via Stripe. Bon valable 12 mois dans n&apos;importe lequel des
        restaurants membres de l&apos;association.
      </p>
    </form>
  );
}
