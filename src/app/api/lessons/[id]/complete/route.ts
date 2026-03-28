import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import Enrollment from "@/models/Enrollment";
import Lesson from "@/models/Lesson";
import Module from "@/models/Module";

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

    const { id: lessonId } = await params;
    await connectDB();

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return NextResponse.json(
        { success: false, error: "Lesson not found" },
        { status: 404 }
      );
    }

    const module = await Module.findById(lesson.moduleId);
    if (!module) {
      return NextResponse.json(
        { success: false, error: "Module not found" },
        { status: 404 }
      );
    }

    const enrollment = await Enrollment.findOne({
      userId: session.user.id,
      courseId: module.courseId,
      status: "active",
    });

    if (!enrollment) {
      return NextResponse.json(
        { success: false, error: "Not enrolled in this course" },
        { status: 403 }
      );
    }

    // Add lesson to completed if not already there
    if (!enrollment.progress.completedLessons.includes(lesson._id)) {
      enrollment.progress.completedLessons.push(lesson._id);
    }
    enrollment.progress.lastAccessedLesson = lesson._id;

    // Calculate completion percentage
    const allModules = await Module.find({ courseId: module.courseId });
    const allLessons = await Lesson.countDocuments({
      moduleId: { $in: allModules.map((m) => m._id) },
    });

    enrollment.progress.percentComplete =
      allLessons > 0
        ? Math.round(
            (enrollment.progress.completedLessons.length / allLessons) * 100
          )
        : 0;

    await enrollment.save();

    return NextResponse.json({
      success: true,
      data: {
        percentComplete: enrollment.progress.percentComplete,
        completedLessons: enrollment.progress.completedLessons.length,
        totalLessons: allLessons,
      },
    });
  } catch (error) {
    console.error("Complete lesson error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
