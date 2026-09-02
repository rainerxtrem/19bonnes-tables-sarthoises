import { NextResponse, type NextRequest } from "next/server";
import { requireContentAccess } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api/handle-error";
import { newsletterCampaignSchema } from "@/lib/validation/newsletter-campaign";
import { sendCampaign, listCampaigns } from "@/lib/services/newsletter.service";

export async function GET() {
  try {
    await requireContentAccess();
    const campaigns = await listCampaigns();
    return NextResponse.json({ campaigns });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireContentAccess();
    const input = newsletterCampaignSchema.parse(await request.json());
    const result = await sendCampaign({ ...input, actorUserId: session.user.id });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
