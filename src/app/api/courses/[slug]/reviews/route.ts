import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import Course from "@/models/Course";
import Review from "@/models/Review";
import Enrollment from "@/models/Enrollment";
import { createReviewSchema } from "@/lib/validators";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const page = parseInt(request.nextUrl.searchParams.get("page") || "1");
    const limit = parseInt(request.nextUrl.searchParams.get("limit") || "10");

    await connectDB();

    const course = await Course.findOne({ slug });
    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      );
    }

    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find({ courseId: course._id })
        .populate("userId", "name avatar")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Review.countDocuments({ courseId: course._id }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        items: reviews,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get reviews error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { slug } = await params;
    await connectDB();

    const course = await Course.findOne({ slug });
    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      );
    }

    // Check enrollment
    const enrollment = await Enrollment.findOne({
      userId: session.user.id,
      courseId: course._id,
      status: "active",
    });
    if (!enrollment) {
      return NextResponse.json(
        { success: false, error: "Must be enrolled to review" },
        { status: 403 }
      );
    }

    // Check not already reviewed
    const existingReview = await Review.findOne({
      courseId: course._id,
      userId: session.user.id,
    });
    if (existingReview) {
      return NextResponse.json(
        { success: false, error: "Already reviewed this course" },
        { status: 409 }
      );
    }

    const body = await request.json();
    const parsed = createReviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    // Enforce minimum 100 characters
    if (parsed.data.body.length < 100) {
      return NextResponse.json(
        { success: false, error: "Review body must be at least 100 characters" },
        { status: 400 }
      );
    }

    const review = await Review.create({
      ...parsed.data,
      courseId: course._id,
      userId: session.user.id,
      isVerifiedPurchase: true,
    });

    // Recalculate course rating
    const stats = await Review.aggregate([
      { $match: { courseId: course._id } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$rating" },
          count: { $sum: 1 },
        },
      },
    ]);

    if (stats[0]) {
      course.averageRating = Math.round(stats[0].avgRating * 10) / 10;
      course.reviewCount = stats[0].count;
      await course.save();
    }

    return NextResponse.json(
      { success: true, data: review },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create review error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
