import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import Category from "@/models/Category";
import Course from "@/models/Course";

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

    await connectDB();

    const category = await Category.findByIdAndUpdate(id, body, { new: true });
    if (!category) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    console.error("Update category error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
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
    await connectDB();

    // Check if any courses use this category
    const courseCount = await Course.countDocuments({
      $or: [{ category: id }, { subCategory: id }],
    });
    if (courseCount > 0) {
      return NextResponse.json(
        { success: false, error: `Cannot delete: ${courseCount} courses use this category` },
        { status: 400 }
      );
    }

    // Also check for child categories
    const children = await Category.countDocuments({ parentId: id });
    if (children > 0) {
      return NextResponse.json(
        { success: false, error: "Cannot delete: category has subcategories" },
        { status: 400 }
      );
    }

    await Category.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: "Category deleted" });
  } catch (error) {
    console.error("Delete category error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
