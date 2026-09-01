"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

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
    <div className="divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white">
      {rows.map((row) => (
        <div key={row.id} className={cn("p-4", row.status === "UNREAD" && "bg-brand-cream/40")}>
          <button onClick={() => open(row)} className="flex w-full items-center justify-between text-left">
            <div>
              <p className={cn("text-sm", row.status === "UNREAD" ? "font-semibold text-gray-900" : "text-gray-700")}>
                {row.fullName} — {row.subject || "Sans objet"}
              </p>
              <p className="text-xs text-gray-500">
                {row.email} {row.phone ? `· ${row.phone}` : ""} ·{" "}
                {format(new Date(row.createdAt), "d MMMM yyyy à HH:mm", { locale: fr })}
              </p>
            </div>
            <span className="text-xs uppercase text-gray-400">{row.status}</span>
          </button>

          {openId === row.id ? (
            <div className="mt-3 space-y-3">
              <p className="whitespace-pre-wrap rounded-md bg-gray-50 p-3 text-sm text-gray-700">{row.message}</p>
              <div className="flex gap-3 text-sm">
                {row.status !== "ARCHIVED" ? (
                  <button onClick={() => setStatus(row, "ARCHIVED")} className="text-gray-600 hover:underline">
                    Archiver
                  </button>
                ) : (
                  <button onClick={() => setStatus(row, "READ")} className="text-gray-600 hover:underline">
                    Désarchiver
                  </button>
                )}
                <button onClick={() => remove(row)} className="text-red-600 hover:underline">
                  Supprimer
                </button>
                <a href={`mailto:${row.email}`} className="text-brand hover:underline">
                  Répondre par email
                </a>
              </div>
            </div>
          ) : null}
        </div>
      ))}
      {rows.length === 0 ? <p className="p-8 text-center text-sm text-gray-500">Aucun message.</p> : null}
    </div>
  );
}
