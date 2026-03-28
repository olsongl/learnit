import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import Enrollment from "@/models/Enrollment";
import Course from "@/models/Course";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { courseId, stripePaymentIntentId } = await request.json();
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
        { success: false, error: "Course not found or not available" },
        { status: 404 }
      );
    }

    // For paid courses, require payment
    if (course.pricingModel !== "free" && course.price > 0 && !stripePaymentIntentId) {
      return NextResponse.json(
        { success: false, error: "Payment required for this course" },
        { status: 402 }
      );
    }

    const enrollment = await Enrollment.create({
      userId: session.user.id,
      courseId,
      pricePaid: course.pricingModel === "free" ? 0 : course.price,
      pricingModelAtPurchase: course.pricingModel,
      stripePaymentIntentId: stripePaymentIntentId || undefined,
      status: "active",
      enrolledAt: new Date(),
    });

    // Increment enrollment count
    await Course.findByIdAndUpdate(courseId, {
      $inc: { enrollmentCount: 1 },
    });

    return NextResponse.json(
      { success: true, data: enrollment },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create enrollment error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
