import { NextResponse, type NextRequest } from "next/server";
import { requireContentAccess } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api/handle-error";
import { pageSchema } from "@/lib/validation/page";
import { deletePage, getPageById, updatePage } from "@/lib/services/page.service";
import { recordAuditLog } from "@/lib/services/audit-log.service";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    await requireContentAccess();
    const { id } = await params;
    const page = await getPageById(id);
    if (!page) return NextResponse.json({ error: "Page introuvable" }, { status: 404 });
    return NextResponse.json({ page });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const session = await requireContentAccess();
    const { id } = await params;
    const input = pageSchema.parse(await request.json());
    const page = await updatePage(id, input);

    await recordAuditLog({
      userId: session.user.id,
      action: "page.update",
      entityType: "Page",
      entityId: id,
      metadata: { title: page.title },
    });

    return NextResponse.json({ page });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const session = await requireContentAccess();
    const { id } = await params;
    await deletePage(id);

    await recordAuditLog({ userId: session.user.id, action: "page.delete", entityType: "Page", entityId: id });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
