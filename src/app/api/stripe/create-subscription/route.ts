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

    if (user.teacherProfile?.subscriptionStatus === "active") {
      return NextResponse.json(
        { success: false, error: "Already subscribed" },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price: process.env.STRIPE_TEACHER_SUBSCRIPTION_PRICE_ID!,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 7,
      },
      success_url: `${appUrl}/teacher/subscription?success=true`,
      cancel_url: `${appUrl}/teacher/subscription`,
      metadata: {
        userId: session.user.id,
        type: "teacher_subscription",
      },
    });

    return NextResponse.json({
      success: true,
      data: { sessionId: checkoutSession.id, url: checkoutSession.url },
    });
  } catch (error) {
    console.error("Create subscription error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
