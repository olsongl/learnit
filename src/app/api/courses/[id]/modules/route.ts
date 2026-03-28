import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import Course from "@/models/Course";
import Module from "@/models/Module";
import Lesson from "@/models/Lesson";
import { createModuleSchema } from "@/lib/validators";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();

    const modules = await Module.find({ courseId: id }).sort({ order: 1 });

    const modulesWithLessons = await Promise.all(
      modules.map(async (mod) => {
        const lessons = await Lesson.find({ moduleId: mod._id }).sort({ order: 1 });
        return { ...mod.toObject(), lessons };
      })
    );

    return NextResponse.json({ success: true, data: modulesWithLessons });
  } catch (error) {
    console.error("Get modules error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
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

    const body = await request.json();
    const parsed = createModuleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    // Auto-increment order if not provided
    let order = parsed.data.order;
    if (order === undefined) {
      const lastModule = await Module.findOne({ courseId: id }).sort({ order: -1 });
      order = lastModule ? lastModule.order + 1 : 0;
    }

    const module = await Module.create({
      ...parsed.data,
      courseId: id,
      order,
    });

    return NextResponse.json(
      { success: true, data: module },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create module error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
