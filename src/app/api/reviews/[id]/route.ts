import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import Review from "@/models/Review";
import Course from "@/models/Course";

async function recalcCourseRating(courseId: string) {
  const stats = await Review.aggregate([
    { $match: { courseId } },
    {
      $group: {
        _id: null,
        avgRating: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);

  const update = stats[0]
    ? { averageRating: Math.round(stats[0].avgRating * 10) / 10, reviewCount: stats[0].count }
    : { averageRating: 0, reviewCount: 0 };

  await Course.findByIdAndUpdate(courseId, update);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    await connectDB();

    const review = await Review.findOne({ _id: id, userId: session.user.id });
    if (!review) {
      return NextResponse.json(
        { success: false, error: "Review not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    if (body.rating) review.rating = body.rating;
    if (body.title) review.title = body.title;
    if (body.body) {
      if (body.body.length < 100) {
        return NextResponse.json(
          { success: false, error: "Review body must be at least 100 characters" },
          { status: 400 }
        );
      }
      review.body = body.body;
    }

    await review.save();
    await recalcCourseRating(review.courseId.toString());

    return NextResponse.json({ success: true, data: review });
  } catch (error) {
    console.error("Update review error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    await connectDB();

    const review = await Review.findOne({ _id: id, userId: session.user.id });
    if (!review) {
      return NextResponse.json(
        { success: false, error: "Review not found" },
        { status: 404 }
      );
    }

    const courseId = review.courseId.toString();
    await review.deleteOne();
    await recalcCourseRating(courseId);

    return NextResponse.json({ success: true, message: "Review deleted" });
  } catch (error) {
    console.error("Delete review error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
