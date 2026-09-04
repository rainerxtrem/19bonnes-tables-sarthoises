import { cn } from "@/lib/utils/cn";
import type { GiftVoucherStatus } from "@prisma/client";

export const STATUS_LABELS: Record<GiftVoucherStatus, string> = {
  PENDING_PAYMENT: "Paiement en attente",
  ACTIVE: "Actif",
  REDEEMED: "Utilisé",
  EXPIRED: "Expiré",
  CANCELLED: "Annulé",
};

const STATUS_CLASSES: Record<GiftVoucherStatus, string> = {
  PENDING_PAYMENT: "bg-amber-100 text-amber-800",
  ACTIVE: "bg-green-100 text-green-800",
  REDEEMED: "bg-cream-100 text-ink-700",
  EXPIRED: "bg-red-100 text-red-700",
  CANCELLED: "bg-ink-100 text-ink-500",
};

export function StatusBadge({ status }: { status: GiftVoucherStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        STATUS_CLASSES[status]
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
