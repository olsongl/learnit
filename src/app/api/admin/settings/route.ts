import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { PLATFORM_COMMISSION_RATE } from "@/lib/stripe";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        platformCommissionRate: PLATFORM_COMMISSION_RATE,
        teacherSubscriptionPrice: 500, // $5.00 in cents
        trialPeriodDays: 7,
        storageProvider: process.env.STORAGE_PROVIDER || "local",
        appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      },
    });
  } catch (error) {
    console.error("Get settings error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
