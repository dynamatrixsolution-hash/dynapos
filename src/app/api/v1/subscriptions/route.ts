import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionContext, authErrorResponse } from "@/lib/api-helper";

export async function GET() {
  const context = await getSessionContext();
  if (!context) return authErrorResponse();

  try {
    const subscription = await db.subscription.findUnique({
      where: { businessId: context.businessId },
    });

    if (!subscription) {
      return NextResponse.json({ error: "No active subscription found" }, { status: 404 });
    }

    const branchCount = await db.branch.count({
      where: { businessId: context.businessId, deletedAt: null },
    });

    const userCount = await db.user.count({
      where: { businessId: context.businessId, deletedAt: null },
    });

    return NextResponse.json({
      subscription,
      metrics: {
        branchCount,
        userCount,
      },
    });
  } catch (error: any) {
    console.error("GET subscription error:", error);
    return NextResponse.json({ error: "Failed to fetch subscription details" }, { status: 500 });
  }
}
