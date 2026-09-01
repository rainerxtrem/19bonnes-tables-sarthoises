"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import Link from "next/link";

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
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-3 py-2">
                {header}
              </th>
            ))}
            <th className="px-3 py-2">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((row) => (
            <tr key={row.id}>
              {row.cells.map((cell, index) => (
                // eslint-disable-next-line react/no-array-index-key -- l'ordre des cellules est stable par ligne
                <td key={index} className="px-3 py-2">
                  {cell}
                </td>
              ))}
              <td className="px-3 py-2">
                <div className="flex gap-3">
                  <Link href={row.editHref} className="text-brand hover:underline">
                    Modifier
                  </Link>
                  <button
                    disabled={pending === row.id}
                    onClick={() => remove(row)}
                    className="text-red-600 hover:underline disabled:opacity-50"
                  >
                    Supprimer
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 ? <div className="p-8 text-center text-sm text-gray-500">{emptyLabel}</div> : null}
    </div>
  );
}
