import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { stripe } from "@/lib/stripe";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findById(session.user.id);
    if (!user || user.role !== "teacher") {
      return NextResponse.json(
        { success: false, error: "Teachers only" },
        { status: 403 }
      );
    }

    let accountId = user.teacherProfile?.stripeConnectAccountId;

    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        email: user.email,
        metadata: { userId: session.user.id },
      });
      accountId = account.id;
      await User.findByIdAndUpdate(session.user.id, {
        "teacherProfile.stripeConnectAccountId": accountId,
      });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${appUrl}/teacher/earnings?refresh=true`,
      return_url: `${appUrl}/teacher/earnings?onboarded=true`,
      type: "account_onboarding",
    });

    return NextResponse.json({
      success: true,
      data: { url: accountLink.url },
    });
  } catch (error) {
    console.error("Connect onboard error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
