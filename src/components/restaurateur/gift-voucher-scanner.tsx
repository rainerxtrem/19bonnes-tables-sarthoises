"use client";

import { useEffect, useRef, useState } from "react";
import { QrCode, Search, CheckCircle2, XCircle, Loader2 } from "lucide-react";

type VoucherPreview = {
  code: string;
  amountCents: number;
  status: "PENDING_PAYMENT" | "ACTIVE" | "REDEEMED" | "EXPIRED" | "CANCELLED";
  buyerName: string;
  expiresAt: string | null;
  redeemedAt: string | null;
};

const STATUS_LABELS: Record<VoucherPreview["status"], string> = {
  PENDING_PAYMENT: "Paiement non confirmé",
  ACTIVE: "Valide",
  REDEEMED: "Déjà utilisé",
  EXPIRED: "Expiré",
  CANCELLED: "Annulé",
};

export function GiftVoucherScanner() {
  const [code, setCode] = useState("");
  const [voucher, setVoucher] = useState<VoucherPreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [redeeming, setRedeeming] = useState(false);
  const [redeemed, setRedeemed] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const scannerRef = useRef<import("html5-qrcode").Html5Qrcode | null>(null);

  async function lookup(candidateCode: string) {
    setLoading(true);
    setError(null);
    setVoucher(null);
    setRedeemed(false);
    try {
      const res = await fetch("/api/restaurateur/gift-vouchers/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: candidateCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Bon cadeau introuvable.");
        return;
      }
      setVoucher(data.voucher);
    } catch {
      setError("Une erreur est survenue. Merci de réessayer.");
    } finally {
      setLoading(false);
    }
  }

  async function confirmRedeem() {
    if (!voucher) return;
    setRedeeming(true);
    setError(null);
    try {
      const res = await fetch("/api/restaurateur/gift-vouchers/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: voucher.code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Validation impossible.");
        return;
      }
      setRedeemed(true);
    } catch {
      setError("Une erreur est survenue. Merci de réessayer.");
    } finally {
      setRedeeming(false);
    }
  }

  function reset() {
    setCode("");
    setVoucher(null);
    setError(null);
    setRedeemed(false);
  }

  // Scanner caméra : chargé dynamiquement (accède à navigator.mediaDevices,
  // incompatible avec le rendu serveur), démarré uniquement quand la zone
  // scanner est ouverte, arrêté proprement au démontage.
  useEffect(() => {
    if (!scannerOpen) return;

    let cancelled = false;

    import("html5-qrcode").then(({ Html5Qrcode }) => {
      if (cancelled) return;
      const instance = new Html5Qrcode("gift-voucher-qr-reader");
      scannerRef.current = instance;

      instance
        .start(
          { facingMode: "environment" },
          { fps: 10, qrbox: 220 },
          (decodedText) => {
            const normalized = decodedText.trim().toUpperCase();
            setCode(normalized);
            setScannerOpen(false);
            void lookup(normalized);
          },
          undefined
        )
        .catch(() => {
          setError("Impossible d'accéder à la caméra. Utilisez la saisie manuelle ci-dessous.");
          setScannerOpen(false);
        });
    });

    return () => {
      cancelled = true;
      const instance = scannerRef.current;
      if (instance) {
        instance.stop().catch(() => {}).finally(() => instance.clear());
        scannerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- lookup est stable pour l'usage qu'on en fait ici
  }, [scannerOpen]);

  if (redeemed && voucher) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-green-600" aria-hidden />
        <p className="mt-3 text-lg font-semibold text-green-900">
          Bon validé — {(voucher.amountCents / 100).toFixed(2)} €
        </p>
        <p className="mt-1 text-sm text-green-800">Code {voucher.code}</p>
        <button
          onClick={reset}
          className="mt-4 rounded-sm bg-wine-700 px-4 py-2 text-sm font-medium text-cream-50 hover:bg-wine-800"
        >
          Valider un autre bon
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-ink-100 bg-white p-6 shadow-sm">
        {scannerOpen ? (
          <div>
            <div id="gift-voucher-qr-reader" className="mx-auto max-w-sm overflow-hidden rounded-md" />
            <button
              onClick={() => setScannerOpen(false)}
              className="mt-3 w-full rounded-sm border border-ink-200 py-2 text-sm text-ink-600 hover:bg-cream-50"
            >
              Annuler le scan
            </button>
          </div>
        ) : (
          <button
            onClick={() => setScannerOpen(true)}
            className="flex w-full items-center justify-center gap-2 rounded-sm bg-wine-700 px-4 py-3 text-sm font-medium text-cream-50 transition-colors hover:bg-wine-800"
          >
            <QrCode className="h-4 w-4" aria-hidden />
            Scanner un QR code
          </button>
        )}

        <div className="my-4 flex items-center gap-3 text-xs uppercase tracking-wide text-ink-400">
          <span className="h-px flex-1 bg-ink-100" />
          ou saisie manuelle
          <span className="h-px flex-1 bg-ink-100" />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void lookup(code);
          }}
          className="flex gap-2"
        >
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="19BT-XXXX-XXXX"
            className="flex-1 rounded-md border border-ink-200 px-3 py-2 font-mono text-sm uppercase text-ink-900 shadow-sm focus:border-wine-700 focus:outline-none focus:ring-1 focus:ring-wine-700"
          />
          <button
            type="submit"
            disabled={loading || !code}
            className="flex items-center gap-1.5 rounded-md bg-ink-900 px-4 py-2 text-sm font-medium text-cream-50 hover:bg-ink-800 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Search className="h-4 w-4" aria-hidden />}
            Vérifier
          </button>
        </form>

        {error ? (
          <p className="mt-3 flex items-center gap-1.5 text-sm text-red-600">
            <XCircle className="h-4 w-4 shrink-0" aria-hidden />
            {error}
          </p>
        ) : null}
      </div>

      {voucher ? (
        <div className="rounded-lg border border-ink-100 bg-white p-6 shadow-sm">
          <p className="font-mono text-lg font-semibold text-ink-900">{voucher.code}</p>
          <p className="mt-1 text-2xl font-display text-ink-900">{(voucher.amountCents / 100).toFixed(2)} €</p>
          <dl className="mt-4 space-y-1.5 text-sm text-ink-600">
            <div className="flex justify-between">
              <dt>Acheté par</dt>
              <dd>{voucher.buyerName}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Statut</dt>
              <dd
                className={
                  voucher.status === "ACTIVE"
                    ? "font-medium text-green-700"
                    : "font-medium text-red-600"
                }
              >
                {STATUS_LABELS[voucher.status]}
              </dd>
            </div>
            {voucher.expiresAt ? (
              <div className="flex justify-between">
                <dt>Expire le</dt>
                <dd>{new Date(voucher.expiresAt).toLocaleDateString("fr-FR")}</dd>
              </div>
            ) : null}
          </dl>

          {voucher.status === "ACTIVE" ? (
            <button
              onClick={confirmRedeem}
              disabled={redeeming}
              className="mt-5 w-full rounded-sm bg-wine-700 px-4 py-3 text-sm font-medium text-cream-50 transition-colors hover:bg-wine-800 disabled:opacity-50"
            >
              {redeeming ? "Validation..." : "Valider ce bon (usage unique)"}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
