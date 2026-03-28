import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import Course from "@/models/Course";
import Module from "@/models/Module";
import Lesson from "@/models/Lesson";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; moduleId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id, moduleId } = await params;
    await connectDB();

    const course = await Course.findById(id);
    if (!course || course.teacherId.toString() !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "Not authorized" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const module = await Module.findByIdAndUpdate(moduleId, body, { new: true });

    if (!module) {
      return NextResponse.json(
        { success: false, error: "Module not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: module });
  } catch (error) {
    console.error("Update module error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; moduleId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id, moduleId } = await params;
    await connectDB();

    const course = await Course.findById(id);
    if (!course || course.teacherId.toString() !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "Not authorized" },
        { status: 403 }
      );
    }

    // Delete all lessons in the module
    const lessons = await Lesson.find({ moduleId });
    const totalDurationRemoved = lessons.reduce(
      (sum, l) => sum + (l.content?.duration || 0),
      0
    );
    const lessonCountRemoved = lessons.length;

    await Lesson.deleteMany({ moduleId });
    await Module.findByIdAndDelete(moduleId);

    // Update course stats
    course.totalLessons = Math.max(0, course.totalLessons - lessonCountRemoved);
    course.totalDuration = Math.max(
      0,
      course.totalDuration - Math.round(totalDurationRemoved / 60)
    );
    await course.save();

    return NextResponse.json({ success: true, message: "Module and its lessons deleted" });
  } catch (error) {
    console.error("Delete module error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
