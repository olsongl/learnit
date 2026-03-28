import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import Course from "@/models/Course";
import Module from "@/models/Module";
import Lesson from "@/models/Lesson";
import { updateCourseSchema } from "@/lib/validators";
import { calculatePriceBreakdown } from "@/lib/stripe";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    await connectDB();

    const course = await Course.findOne({ slug })
      .populate("teacherId", "name avatar teacherProfile.bio teacherProfile.headline teacherProfile.verificationStatus teacherProfile.socialLinks")
      .populate("category", "name slug")
      .populate("subCategory", "name slug");

    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      );
    }

    const modules = await Module.find({ courseId: course._id }).sort({ order: 1 });

    const modulesWithLessons = await Promise.all(
      modules.map(async (mod) => {
        const lessons = await Lesson.find({ moduleId: mod._id })
          .select("title type order duration isFreePreview content.duration")
          .sort({ order: 1 });
        return { ...mod.toObject(), lessons };
      })
    );

    return NextResponse.json({
      success: true,
      data: { ...course.toObject(), modules: modulesWithLessons },
    });
  } catch (error) {
    console.error("Get course error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { slug } = await params;
    await connectDB();

    const course = await Course.findOne({ slug });
    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      );
    }

    if (course.teacherId.toString() !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "Not authorized to edit this course" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = updateCourseSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    Object.assign(course, parsed.data);

    if (parsed.data.price && parsed.data.price > 0) {
      course.priceBreakdown = calculatePriceBreakdown(parsed.data.price);
    }

    await course.save();

    return NextResponse.json({ success: true, data: course });
  } catch (error) {
    console.error("Update course error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { slug } = await params;
    await connectDB();

    const course = await Course.findOne({ slug });
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

    course.status = "archived";
    await course.save();

    return NextResponse.json({ success: true, message: "Course archived" });
  } catch (error) {
    console.error("Delete course error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
