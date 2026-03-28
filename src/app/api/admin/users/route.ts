import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";

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
    const role = searchParams.get("role");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    await connectDB();

    const query: Record<string, unknown> = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .select("-passwordHash -twoFactorSecret -verificationToken -resetPasswordToken")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        items: users,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
