import { NextResponse, type NextRequest } from "next/server";
import { requireContentAccess } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api/handle-error";
import { articleSchema } from "@/lib/validation/article";
import { createArticle, listArticlesAdmin } from "@/lib/services/article.service";
import { recordAuditLog } from "@/lib/services/audit-log.service";

export async function GET() {
  try {
    await requireContentAccess();
    const articles = await listArticlesAdmin();
    return NextResponse.json({ articles });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireContentAccess();
    const input = articleSchema.parse(await request.json());
    const article = await createArticle(input, session.user.id);

    await recordAuditLog({
      userId: session.user.id,
      action: "article.create",
      entityType: "Article",
      entityId: article.id,
      metadata: { title: article.title },
    });

    return NextResponse.json({ article }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
