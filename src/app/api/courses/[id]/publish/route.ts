import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import Course from "@/models/Course";
import User from "@/models/User";

export async function POST(
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

    if (course.teacherId.toString() !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "Not authorized" },
        { status: 403 }
      );
    }

    // Check teacher has active subscription
    const teacher = await User.findById(session.user.id);
    if (
      !teacher?.teacherProfile ||
      teacher.teacherProfile.subscriptionStatus !== "active"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Active platform subscription required to publish courses",
        },
        { status: 403 }
      );
    }

    if (course.status !== "draft" && course.status !== "archived") {
      return NextResponse.json(
        { success: false, error: "Course can only be published from draft or archived status" },
        { status: 400 }
      );
    }

    course.status = "pending_review";
    await course.save();

    return NextResponse.json({
      success: true,
      data: course,
      message: "Course submitted for review",
    });
  } catch (error) {
    console.error("Publish course error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
