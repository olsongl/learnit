import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Course from "@/models/Course";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();

    const user = await User.findById(id).select(
      "name avatar role teacherProfile.bio teacherProfile.headline teacherProfile.verificationStatus teacherProfile.socialLinks teacherProfile.linkedIn teacherProfile.website createdAt"
    );

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const courseStats = await Course.aggregate([
      { $match: { teacherId: user._id, status: "published" } },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          avgRating: { $avg: "$averageRating" },
          totalStudents: { $sum: "$enrollmentCount" },
        },
      },
    ]);

    const stats = courseStats[0] || { count: 0, avgRating: 0, totalStudents: 0 };

    const courses = await Course.find({
      teacherId: user._id,
      status: "published",
    })
      .select("title slug thumbnail shortDescription price pricingModel averageRating enrollmentCount")
      .sort({ enrollmentCount: -1 })
      .limit(10);

    return NextResponse.json({
      success: true,
      data: {
        user,
        stats: {
          courseCount: stats.count,
          averageRating: Math.round(stats.avgRating * 10) / 10,
          totalStudents: stats.totalStudents,
        },
        courses,
      },
    });
  } catch (error) {
    console.error("Get public profile error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
