import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { stripe } from "@/lib/stripe";

export async function GET() {
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
    if (!user?.teacherProfile?.stripeConnectAccountId) {
      return NextResponse.json({
        success: true,
        data: {
          hasAccount: false,
          chargesEnabled: false,
          payoutsEnabled: false,
          detailsSubmitted: false,
        },
      });
    }

    const account = await stripe.accounts.retrieve(
      user.teacherProfile.stripeConnectAccountId
    );

    return NextResponse.json({
      success: true,
      data: {
        hasAccount: true,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        detailsSubmitted: account.details_submitted,
      },
    });
  } catch (error) {
    console.error("Connect status error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
