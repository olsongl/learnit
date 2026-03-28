import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import Enrollment from "@/models/Enrollment";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const status = request.nextUrl.searchParams.get("status");
    await connectDB();

    const query: Record<string, unknown> = { userId: session.user.id };
    if (status) query.status = status;

    const enrollments = await Enrollment.find(query)
      .populate({
        path: "courseId",
        select: "title slug thumbnail shortDescription teacherId totalLessons totalDuration",
        populate: { path: "teacherId", select: "name avatar" },
      })
      .sort({ enrolledAt: -1 });

    return NextResponse.json({ success: true, data: enrollments });
  } catch (error) {
    console.error("Get enrollments error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
