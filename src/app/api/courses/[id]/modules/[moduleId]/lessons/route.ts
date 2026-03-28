import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import Course from "@/models/Course";
import Module from "@/models/Module";
import Lesson from "@/models/Lesson";
import { createLessonSchema } from "@/lib/validators";

export async function POST(
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

    const mod = await Module.findById(moduleId);
    if (!mod || mod.courseId.toString() !== id) {
      return NextResponse.json(
        { success: false, error: "Module not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const parsed = createLessonSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    let order = parsed.data.order;
    if (order === undefined) {
      const lastLesson = await Lesson.findOne({ moduleId }).sort({ order: -1 });
      order = lastLesson ? lastLesson.order + 1 : 0;
    }

    const lesson = await Lesson.create({
      ...parsed.data,
      moduleId,
      order,
    });

    // Update course stats
    course.totalLessons += 1;
    if (lesson.content?.duration) {
      course.totalDuration += Math.round(lesson.content.duration / 60);
    }
    await course.save();

    return NextResponse.json(
      { success: true, data: lesson },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create lesson error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
