"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ChevronDown, Archive, ArchiveRestore, Trash2, Send, CheckCircle2 } from "lucide-react";
import { Textarea } from "@/components/ui/field";

const STATUS_LABELS: Record<MessageRow["status"], string> = {
  UNREAD: "Non lu",
  READ: "Lu",
  ARCHIVED: "Archivé",
};

interface ReplyRow {
  id: string;
  direction: "STAFF" | "CLIENT";
  body: string;
  createdAt: string;
  authorName: string | null;
}

interface MessageRow {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  status: "UNREAD" | "READ" | "ARCHIVED";
  createdAt: string;
  replies: ReplyRow[];
}

function formatDateTime(value: string) {
  return format(new Date(value), "d MMMM yyyy à HH:mm", { locale: fr });
}

export function MessageList({ initialRows }: { initialRows: MessageRow[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(initialRows);
  const [openId, setOpenId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [replyError, setReplyError] = useState<string | null>(null);

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
    setReplyError(null);
    if (row.status === "UNREAD") await setStatus(row, "READ");
  }

  async function sendReply(row: MessageRow) {
    const replyMessage = (drafts[row.id] ?? "").trim();
    if (!replyMessage) return;
    setSendingId(row.id);
    setReplyError(null);
    try {
      const res = await fetch(`/api/admin/messages/${row.id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ replyMessage }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setReplyError(data.error ?? "L'envoi a échoué.");
        return;
      }
      const { message } = await res.json();
      setRows((prev) =>
        prev.map((r) =>
          r.id === row.id
            ? {
                ...r,
                status: message.status,
                replies: [
                  ...r.replies,
                  {
                    id: message.reply.id,
                    direction: "STAFF" as const,
                    body: message.reply.body,
                    createdAt: message.reply.createdAt,
                    authorName: message.reply.authorName,
                  },
                ],
              }
            : r
        )
      );
      setDrafts((prev) => ({ ...prev, [row.id]: "" }));
      router.refresh();
    } catch {
      setReplyError("Une erreur est survenue. Merci de réessayer.");
    } finally {
      setSendingId(null);
    }
  }

  return (
    <div className="divide-y divide-ink-100 rounded-lg border border-ink-100 bg-white shadow-sm">
      {rows.map((row) => {
        const hasStaffReply = row.replies.some((r) => r.direction === "STAFF");
        return (
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
                  {row.email} {row.phone ? `· ${row.phone}` : ""} · {formatDateTime(row.createdAt)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                {hasStaffReply ? (
                  <span className="flex items-center gap-1 text-xs font-medium text-green-700">
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                    Répondu
                  </span>
                ) : null}
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
                {/* Message initial du client */}
                <div>
                  <p className="mb-1 text-xs text-ink-400">{formatDateTime(row.createdAt)}</p>
                  <p className="whitespace-pre-wrap rounded-md bg-cream-50 p-3 text-sm text-ink-700">{row.message}</p>
                </div>

                {/* Fil de discussion : réponses de l'équipe et du client, dans l'ordre */}
                {row.replies.map((reply) => (
                  <div key={reply.id} className={cn("flex", reply.direction === "STAFF" ? "justify-end" : "justify-start")}>
                    <div
                      className={cn(
                        "max-w-[85%] rounded-md p-3 text-sm",
                        reply.direction === "STAFF" ? "bg-wine-50 text-ink-800" : "border border-green-100 bg-green-50 text-ink-800"
                      )}
                    >
                      <p className={cn("mb-1 text-xs font-medium", reply.direction === "STAFF" ? "text-wine-700" : "text-green-700")}>
                        {reply.direction === "STAFF" ? reply.authorName ?? "Équipe" : row.fullName} ·{" "}
                        {formatDateTime(reply.createdAt)}
                      </p>
                      <p className="whitespace-pre-wrap">{reply.body}</p>
                    </div>
                  </div>
                ))}

                <div className="space-y-2 pt-1">
                  <Textarea
                    value={drafts[row.id] ?? ""}
                    onChange={(e) => setDrafts((prev) => ({ ...prev, [row.id]: e.target.value }))}
                    placeholder={hasStaffReply ? "Envoyer une nouvelle réponse..." : `Répondre à ${row.fullName}...`}
                    className="min-h-[90px] text-sm"
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => sendReply(row)}
                      disabled={sendingId === row.id || !(drafts[row.id] ?? "").trim()}
                      className="inline-flex items-center gap-1.5 rounded-sm bg-wine-700 px-3 py-1.5 text-xs font-medium text-cream-50 transition-colors hover:bg-wine-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Send className="h-3.5 w-3.5" aria-hidden />
                      {sendingId === row.id ? "Envoi..." : "Envoyer la réponse par email"}
                    </button>
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
                  {replyError && openId === row.id ? <p className="text-xs text-red-600">{replyError}</p> : null}
                </div>
              </div>
            ) : null}
          </div>
        );
      })}
      {rows.length === 0 ? <p className="p-8 text-center text-sm text-ink-500">Aucun message.</p> : null}
    </div>
  );
}
