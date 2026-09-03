import { cn } from "@/lib/utils/cn";
import type { PublishStatus } from "@prisma/client";

const STATUS_LABELS: Record<PublishStatus, string> = {
  DRAFT: "Brouillon",
  SCHEDULED: "Programmé",
  PUBLISHED: "Publié",
  ARCHIVED: "Archivé",
};

const STATUS_CLASSES: Record<PublishStatus, string> = {
  DRAFT: "bg-cream-100 text-ink-700",
  SCHEDULED: "bg-amber-100 text-amber-800",
  PUBLISHED: "bg-green-100 text-green-800",
  ARCHIVED: "bg-red-100 text-red-700",
};

export function StatusBadge({ status }: { status: PublishStatus }) {
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
