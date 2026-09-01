import { NextResponse, type NextRequest } from "next/server";
import { requireContentAccess } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api/handle-error";
import { articleSchema } from "@/lib/validation/article";
import { deleteArticle, getArticleById, updateArticle } from "@/lib/services/article.service";
import { recordAuditLog } from "@/lib/services/audit-log.service";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    await requireContentAccess();
    const { id } = await params;
    const article = await getArticleById(id);
    if (!article) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
    return NextResponse.json({ article });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const session = await requireContentAccess();
    const { id } = await params;
    const input = articleSchema.parse(await request.json());
    const article = await updateArticle(id, input);

    await recordAuditLog({
      userId: session.user.id,
      action: "article.update",
      entityType: "Article",
      entityId: id,
      metadata: { title: article.title },
    });

    return NextResponse.json({ article });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const session = await requireContentAccess();
    const { id } = await params;
    await deleteArticle(id);

    await recordAuditLog({ userId: session.user.id, action: "article.delete", entityType: "Article", entityId: id });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
