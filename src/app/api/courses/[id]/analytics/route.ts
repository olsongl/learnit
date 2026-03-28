import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import Course from "@/models/Course";
import Enrollment from "@/models/Enrollment";
import Transaction from "@/models/Transaction";
import Review from "@/models/Review";

export async function GET(
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

    const course = await Course.findById(id);
    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      );
    }

    if (course.teacherId.toString() !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Not authorized" },
        { status: 403 }
      );
    }

    const [revenueResult, recentEnrollments, recentReviews, completionStats] =
      await Promise.all([
        Transaction.aggregate([
          { $match: { courseId: course._id, status: "completed" } },
          { $group: { _id: null, total: { $sum: "$teacherPayout" } } },
        ]),
        Enrollment.find({ courseId: id })
          .populate("userId", "name email avatar")
          .sort({ enrolledAt: -1 })
          .limit(10),
        Review.find({ courseId: id })
          .populate("userId", "name avatar")
          .sort({ createdAt: -1 })
          .limit(10),
        Enrollment.aggregate([
          { $match: { courseId: course._id } },
          {
            $group: {
              _id: null,
              avgCompletion: { $avg: "$progress.percentComplete" },
            },
          },
        ]),
      ]);

    return NextResponse.json({
      success: true,
      data: {
        enrollmentCount: course.enrollmentCount,
        revenue: revenueResult[0]?.total || 0,
        averageRating: course.averageRating,
        reviewCount: course.reviewCount,
        avgCompletion: completionStats[0]?.avgCompletion || 0,
        recentEnrollments,
        recentReviews,
      },
    });
  } catch (error) {
    console.error("Get course analytics error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
