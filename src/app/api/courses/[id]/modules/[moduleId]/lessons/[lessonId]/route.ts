import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import Course from "@/models/Course";
import Lesson from "@/models/Lesson";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; moduleId: string; lessonId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id, lessonId } = await params;
    await connectDB();

    const course = await Course.findById(id);
    if (!course || course.teacherId.toString() !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "Not authorized" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const oldLesson = await Lesson.findById(lessonId);
    const oldDuration = oldLesson?.content?.duration || 0;

    const lesson = await Lesson.findByIdAndUpdate(lessonId, body, { new: true });
    if (!lesson) {
      return NextResponse.json(
        { success: false, error: "Lesson not found" },
        { status: 404 }
      );
    }

    // Update course duration if changed
    const newDuration = lesson.content?.duration || 0;
    if (newDuration !== oldDuration) {
      course.totalDuration += Math.round((newDuration - oldDuration) / 60);
      await course.save();
    }

    return NextResponse.json({ success: true, data: lesson });
  } catch (error) {
    console.error("Update lesson error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; moduleId: string; lessonId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id, lessonId } = await params;
    await connectDB();

    const course = await Course.findById(id);
    if (!course || course.teacherId.toString() !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "Not authorized" },
        { status: 403 }
      );
    }

    const lesson = await Lesson.findByIdAndDelete(lessonId);
    if (!lesson) {
      return NextResponse.json(
        { success: false, error: "Lesson not found" },
        { status: 404 }
      );
    }

    course.totalLessons = Math.max(0, course.totalLessons - 1);
    if (lesson.content?.duration) {
      course.totalDuration = Math.max(
        0,
        course.totalDuration - Math.round(lesson.content.duration / 60)
      );
    }
    await course.save();

    return NextResponse.json({ success: true, message: "Lesson deleted" });
  } catch (error) {
    console.error("Delete lesson error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
