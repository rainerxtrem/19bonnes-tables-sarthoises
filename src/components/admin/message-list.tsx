"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ChevronDown, Archive, ArchiveRestore, Trash2, Mail } from "lucide-react";

const STATUS_LABELS: Record<MessageRow["status"], string> = {
  UNREAD: "Non lu",
  READ: "Lu",
  ARCHIVED: "Archivé",
};

interface MessageRow {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  status: "UNREAD" | "READ" | "ARCHIVED";
  createdAt: string;
}

export function MessageList({ initialRows }: { initialRows: MessageRow[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(initialRows);
  const [openId, setOpenId] = useState<string | null>(null);

  async function setStatus(row: MessageRow, status: MessageRow["status"]) {
    await fetch(`/api/admin/messages/${row.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, status } : r)));
    router.refresh();
  }

  async function remove(row: MessageRow) {
    if (!window.confirm(`Supprimer le message de ${row.fullName} ?`)) return;
    await fetch(`/api/admin/messages/${row.id}`, { method: "DELETE" });
    setRows((prev) => prev.filter((r) => r.id !== row.id));
    router.refresh();
  }

  async function open(row: MessageRow) {
    setOpenId(openId === row.id ? null : row.id);
    if (row.status === "UNREAD") await setStatus(row, "READ");
  }

  return (
    <div className="divide-y divide-ink-100 rounded-lg border border-ink-100 bg-white shadow-sm">
      {rows.map((row) => (
        <div
          key={row.id}
          className={cn(
            "border-l-2 p-4 transition-colors",
            row.status === "UNREAD" ? "border-wine-700 bg-wine-50/40" : "border-transparent"
          )}
        >
          <button onClick={() => open(row)} className="flex w-full items-center justify-between gap-4 text-left">
            <div className="min-w-0">
              <p className={cn("truncate text-sm", row.status === "UNREAD" ? "font-semibold text-ink-900" : "text-ink-700")}>
                {row.fullName} — {row.subject || "Sans objet"}
              </p>
              <p className="mt-0.5 truncate text-xs text-ink-500">
                {row.email} {row.phone ? `· ${row.phone}` : ""} ·{" "}
                {format(new Date(row.createdAt), "d MMMM yyyy à HH:mm", { locale: fr })}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <span
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-xs font-medium",
                  row.status === "UNREAD" && "bg-wine-100 text-wine-700",
                  row.status === "READ" && "bg-cream-100 text-ink-600",
                  row.status === "ARCHIVED" && "bg-ink-100 text-ink-500"
                )}
              >
                {STATUS_LABELS[row.status]}
              </span>
              <ChevronDown
                className={cn("h-4 w-4 text-ink-400 transition-transform", openId === row.id && "rotate-180")}
                aria-hidden
              />
            </div>
          </button>

          {openId === row.id ? (
            <div className="mt-3 space-y-3">
              <p className="whitespace-pre-wrap rounded-md bg-cream-50 p-3 text-sm text-ink-700">{row.message}</p>
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={`mailto:${row.email}`}
                  className="inline-flex items-center gap-1.5 rounded-sm bg-wine-700 px-3 py-1.5 text-xs font-medium text-cream-50 transition-colors hover:bg-wine-800"
                >
                  <Mail className="h-3.5 w-3.5" aria-hidden />
                  Répondre par email
                </a>
                {row.status !== "ARCHIVED" ? (
                  <button
                    onClick={() => setStatus(row, "ARCHIVED")}
                    className="inline-flex items-center gap-1.5 rounded-sm border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-600 transition-colors hover:bg-cream-100"
                  >
                    <Archive className="h-3.5 w-3.5" aria-hidden />
                    Archiver
                  </button>
                ) : (
                  <button
                    onClick={() => setStatus(row, "READ")}
                    className="inline-flex items-center gap-1.5 rounded-sm border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-600 transition-colors hover:bg-cream-100"
                  >
                    <ArchiveRestore className="h-3.5 w-3.5" aria-hidden />
                    Désarchiver
                  </button>
                )}
                <button
                  onClick={() => remove(row)}
                  className="inline-flex items-center gap-1.5 rounded-sm border border-ink-200 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden />
                  Supprimer
                </button>
              </div>
            </div>
          ) : null}
        </div>
      ))}
      {rows.length === 0 ? <p className="p-8 text-center text-sm text-ink-500">Aucun message.</p> : null}
    </div>
  );
}
