import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Category from "@/models/Category";

export async function GET() {
  try {
    await connectDB();

    const categories = await Category.find({ isActive: true }).sort({ order: 1 });

    // Build hierarchical structure
    const parentCategories = categories.filter((c) => !c.parentId);
    const result = parentCategories.map((parent) => ({
      ...parent.toObject(),
      children: categories
        .filter((c) => c.parentId?.toString() === parent._id.toString())
        .map((c) => c.toObject()),
    }));

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Get categories error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
