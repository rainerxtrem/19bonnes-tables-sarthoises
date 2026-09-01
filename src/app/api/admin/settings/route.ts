import { NextResponse, type NextRequest } from "next/server";
import { requireSuperAdmin } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api/handle-error";
import { siteSettingSchema } from "@/lib/validation/settings";
import { prisma } from "@/lib/db/prisma";
import { recordAuditLog } from "@/lib/services/audit-log.service";

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireSuperAdmin();
    const input = siteSettingSchema.parse(await request.json());

    const settings = await prisma.siteSetting.upsert({
      where: { id: "singleton" },
      update: {
        ...input,
        siteDescription: input.siteDescription || null,
        contactEmail: input.contactEmail || null,
        contactPhone: input.contactPhone || null,
        address: input.address || null,
        facebookUrl: input.facebookUrl || null,
        instagramUrl: input.instagramUrl || null,
        linkedinUrl: input.linkedinUrl || null,
        seoDefaultTitle: input.seoDefaultTitle || null,
        seoDefaultDescription: input.seoDefaultDescription || null,
        footerText: input.footerText || null,
        gtmId: input.gtmId || null,
      },
      create: { id: "singleton", ...input },
    });

    await recordAuditLog({ userId: session.user.id, action: "settings.update", entityType: "SiteSetting" });

    return NextResponse.json({ settings });
  } catch (error) {
    return handleApiError(error);
  }
}
