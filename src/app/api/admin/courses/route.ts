import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import Course from "@/models/Course";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    const { searchParams } = request.nextUrl;
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const teacherId = searchParams.get("teacherId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    await connectDB();

    const query: Record<string, unknown> = {};
    if (status) query.status = status;
    if (teacherId) query.teacherId = teacherId;
    if (search) {
      query.$text = { $search: search };
    }

    const [courses, total] = await Promise.all([
      Course.find(query)
        .populate("teacherId", "name email avatar")
        .populate("category", "name slug")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Course.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        items: courses,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Admin get courses error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
