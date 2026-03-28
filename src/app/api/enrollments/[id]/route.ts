import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import Enrollment from "@/models/Enrollment";
import Module from "@/models/Module";
import Lesson from "@/models/Lesson";

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

    const enrollment = await Enrollment.findOne({
      _id: id,
      userId: session.user.id,
    }).populate({
      path: "courseId",
      populate: [
        { path: "teacherId", select: "name avatar" },
        { path: "category", select: "name slug" },
      ],
    });

    if (!enrollment) {
      return NextResponse.json(
        { success: false, error: "Enrollment not found" },
        { status: 404 }
      );
    }

    // Get full course content
    const modules = await Module.find({
      courseId: enrollment.courseId._id,
    }).sort({ order: 1 });

    const modulesWithLessons = await Promise.all(
      modules.map(async (mod) => {
        const lessons = await Lesson.find({ moduleId: mod._id }).sort({
          order: 1,
        });
        return { ...mod.toObject(), lessons };
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        enrollment,
        modules: modulesWithLessons,
      },
    });
  } catch (error) {
    console.error("Get enrollment detail error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
