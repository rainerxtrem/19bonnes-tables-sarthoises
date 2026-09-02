import { NextResponse } from "next/server";
import { requireContentAccess } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api/handle-error";
import { listActiveSubscribers } from "@/lib/services/newsletter.service";

function escapeCsvField(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

export async function GET() {
  try {
    await requireContentAccess();
    const subscribers = await listActiveSubscribers();

    const rows = [
      ["email", "date d'inscription"],
      ...subscribers.map((s) => [s.email, s.subscribedAt.toISOString()]),
    ];
    const csv = rows.map((row) => row.map(escapeCsvField).join(",")).join("\r\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="newsletter-abonnes.csv"`,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
