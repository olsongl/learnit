import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import Course from "@/models/Course";
import { updateCourseAdminSchema } from "@/lib/validators";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = updateCourseAdminSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    await connectDB();

    const updateData: Record<string, unknown> = {};
    if (parsed.data.featured !== undefined) updateData.featured = parsed.data.featured;
    if (parsed.data.status) {
      updateData.status = parsed.data.status;
      if (parsed.data.status === "published") {
        updateData.publishedAt = new Date();
      }
    }

    const course = await Course.findByIdAndUpdate(id, updateData, { new: true });
    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: course });
  } catch (error) {
    console.error("Admin update course error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
