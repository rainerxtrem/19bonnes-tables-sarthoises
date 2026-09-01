"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export interface SimpleAdminColumn<T> {
  header: string;
  render: (row: T) => React.ReactNode;
}

export function SimpleAdminList<T extends { id: string }>({
  rows,
  columns,
  editHref,
  deleteEndpoint,
  confirmLabel,
  emptyLabel,
}: {
  rows: T[];
  columns: SimpleAdminColumn<T>[];
  editHref: (row: T) => string;
  deleteEndpoint: (row: T) => string;
  confirmLabel: (row: T) => string;
  emptyLabel: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);

  async function remove(row: T) {
    if (!window.confirm(confirmLabel(row))) return;
    setPending(row.id);
    await fetch(deleteEndpoint(row), { method: "DELETE" });
    router.refresh();
    setPending(null);
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
          <tr>
            {columns.map((col) => (
              <th key={col.header} className="px-3 py-2">
                {col.header}
              </th>
            ))}
            <th className="px-3 py-2">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((row) => (
            <tr key={row.id}>
              {columns.map((col) => (
                <td key={col.header} className="px-3 py-2">
                  {col.render(row)}
                </td>
              ))}
              <td className="px-3 py-2">
                <div className="flex gap-3">
                  <Link href={editHref(row)} className="text-brand hover:underline">
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
