"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";

export interface SimpleAdminRow {
  id: string;
  /** Cellules déjà rendues côté serveur (JSX = sérialisable ; une fonction
   * "render" ne l'est pas et ne peut pas franchir la frontière Server →
   * Client Component, voir https://nextjs.org/docs/messages/functions-cannot-be-passed-to-client-components). */
  cells: ReactNode[];
  editHref: string;
  deleteEndpoint: string;
  confirmLabel: string;
}

export function SimpleAdminList({
  headers,
  rows,
  emptyLabel,
}: {
  headers: string[];
  rows: SimpleAdminRow[];
  emptyLabel: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);

  async function remove(row: SimpleAdminRow) {
    if (!window.confirm(row.confirmLabel)) return;
    setPending(row.id);
    await fetch(row.deleteEndpoint, { method: "DELETE" });
    router.refresh();
    setPending(null);
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-ink-100 bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead className="border-b border-ink-100 bg-cream-50 text-left text-xs font-medium uppercase tracking-wide text-ink-400">
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-4 py-3">
                {header}
              </th>
            ))}
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-100">
          {rows.map((row) => (
            <tr key={row.id} className="transition-colors hover:bg-cream-50/60">
              {row.cells.map((cell, index) => (
                // eslint-disable-next-line react/no-array-index-key -- l'ordre des cellules est stable par ligne
                <td key={index} className="px-4 py-3 text-ink-700">
                  {cell}
                </td>
              ))}
              <td className="px-4 py-3">
                <div className="flex items-center gap-1">
                  <Link
                    href={row.editHref}
                    title="Modifier"
                    className="flex h-7 w-7 items-center justify-center rounded-sm text-ink-400 transition-colors hover:bg-wine-50 hover:text-wine-700"
                  >
                    <Pencil className="h-3.5 w-3.5" aria-hidden />
                  </Link>
                  <button
                    disabled={pending === row.id}
                    onClick={() => remove(row)}
                    title="Supprimer"
                    className="flex h-7 w-7 items-center justify-center rounded-sm text-ink-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 ? <div className="p-8 text-center text-sm text-ink-400">{emptyLabel}</div> : null}
    </div>
  );
}
