import { NextResponse, type NextRequest } from "next/server";
import { requireContentAccess } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api/handle-error";
import { pageSchema } from "@/lib/validation/page";
import { createPage, listPagesAdmin } from "@/lib/services/page.service";
import { recordAuditLog } from "@/lib/services/audit-log.service";

export async function GET() {
  try {
    await requireContentAccess();
    const pages = await listPagesAdmin();
    return NextResponse.json({ pages });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireContentAccess();
    const input = pageSchema.parse(await request.json());
    const page = await createPage(input);

    await recordAuditLog({
      userId: session.user.id,
      action: "page.create",
      entityType: "Page",
      entityId: page.id,
      metadata: { title: page.title },
    });

    return NextResponse.json({ page }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
