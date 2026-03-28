import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import Course from "@/models/Course";
import User from "@/models/User";
import Enrollment from "@/models/Enrollment";
import { stripe, calculateApplicationFee } from "@/lib/stripe";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { courseId } = await request.json();
    if (!courseId) {
      return NextResponse.json(
        { success: false, error: "courseId is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Check not already enrolled
    const existing = await Enrollment.findOne({
      userId: session.user.id,
      courseId,
    });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "Already enrolled" },
        { status: 409 }
      );
    }

    const course = await Course.findById(courseId);
    if (!course || course.status !== "published") {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      );
    }

    if (course.pricingModel === "free" || course.price === 0) {
      return NextResponse.json(
        { success: false, error: "This is a free course — enroll directly" },
        { status: 400 }
      );
    }

    const teacher = await User.findById(course.teacherId);
    if (!teacher?.teacherProfile?.stripeConnectAccountId) {
      return NextResponse.json(
        { success: false, error: "Teacher has not set up payments" },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: course.pricingModel === "monthly" ? "subscription" : "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: course.title,
              description: course.shortDescription || undefined,
            },
            unit_amount: course.price,
            ...(course.pricingModel === "monthly" && { recurring: { interval: "month" } }),
          },
          quantity: 1,
        },
      ],
      ...(course.pricingModel !== "monthly" && {
        payment_intent_data: {
          application_fee_amount: calculateApplicationFee(course.price),
          transfer_data: {
            destination: teacher.teacherProfile.stripeConnectAccountId,
          },
        },
      }),
      ...(course.pricingModel === "monthly" && {
        subscription_data: {
          application_fee_percent: 1.5,
          transfer_data: {
            destination: teacher.teacherProfile.stripeConnectAccountId,
          },
        },
      }),
      success_url: `${appUrl}/dashboard/courses/${courseId}/learn?enrolled=true`,
      cancel_url: `${appUrl}/courses/${course.slug}`,
      metadata: {
        courseId: courseId.toString(),
        userId: session.user.id,
        teacherId: course.teacherId.toString(),
      },
    });

    return NextResponse.json({
      success: true,
      data: { sessionId: checkoutSession.id, url: checkoutSession.url },
    });
  } catch (error) {
    console.error("Create checkout error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
