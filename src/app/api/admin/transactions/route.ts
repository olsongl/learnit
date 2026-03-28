import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import Transaction from "@/models/Transaction";

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
    const status = searchParams.get("status");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const teacherId = searchParams.get("teacherId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    await connectDB();

    const query: Record<string, unknown> = {};
    if (status) query.status = status;
    if (teacherId) query.teacherId = teacherId;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) (query.createdAt as Record<string, Date>).$gte = new Date(startDate);
      if (endDate) (query.createdAt as Record<string, Date>).$lte = new Date(endDate);
    }

    const [transactions, total, summary] = await Promise.all([
      Transaction.find(query)
        .populate("studentId", "name email")
        .populate("teacherId", "name email")
        .populate("courseId", "title slug")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Transaction.countDocuments(query),
      Transaction.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$amount" },
            totalPlatformFee: { $sum: "$platformFee" },
            totalTeacherPayout: { $sum: "$teacherPayout" },
          },
        },
      ]),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        items: transactions,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        summary: summary[0] || {
          totalAmount: 0,
          totalPlatformFee: 0,
          totalTeacherPayout: 0,
        },
      },
    });
  } catch (error) {
    console.error("Get transactions error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
