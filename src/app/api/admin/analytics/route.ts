import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Course from "@/models/Course";
import Enrollment from "@/models/Enrollment";
import Transaction from "@/models/Transaction";
import Credential from "@/models/Credential";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    await connectDB();

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      totalTeachers,
      totalCourses,
      publishedCourses,
      totalEnrollments,
      revenueResult,
      recentSignups,
      pendingCredentials,
      pendingCourses,
      usersByRole,
      coursesByStatus,
      activeSubscriptions,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "teacher" }),
      Course.countDocuments(),
      Course.countDocuments({ status: "published" }),
      Enrollment.countDocuments(),
      Transaction.aggregate([
        { $match: { status: "completed" } },
        { $group: { _id: null, total: { $sum: "$amount" }, platformTotal: { $sum: "$platformFee" } } },
      ]),
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Credential.countDocuments({ verifiedByAdmin: false, reviewedAt: null }),
      Course.countDocuments({ status: "pending_review" }),
      User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),
      Course.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      User.countDocuments({ "teacherProfile.subscriptionStatus": "active" }),
    ]);

    const revenue = revenueResult[0] || { total: 0, platformTotal: 0 };

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        totalTeachers,
        totalCourses,
        publishedCourses,
        totalEnrollments,
        totalRevenue: revenue.total,
        platformRevenue: revenue.platformTotal,
        recentSignups,
        pendingCredentials,
        pendingCourses,
        activeSubscriptions,
        usersByRole: Object.fromEntries(
          usersByRole.map((r: { _id: string; count: number }) => [r._id, r.count])
        ),
        coursesByStatus: Object.fromEntries(
          coursesByStatus.map((c: { _id: string; count: number }) => [c._id, c.count])
        ),
      },
    });
  } catch (error) {
    console.error("Get analytics error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
