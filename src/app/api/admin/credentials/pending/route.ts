import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import Credential from "@/models/Credential";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    const page = parseInt(request.nextUrl.searchParams.get("page") || "1");
    const limit = parseInt(request.nextUrl.searchParams.get("limit") || "20");
    const status = request.nextUrl.searchParams.get("status"); // pending, approved, rejected
    const skip = (page - 1) * limit;

    await connectDB();

    const query: Record<string, unknown> = {};
    if (status === "approved") {
      query.verifiedByAdmin = true;
    } else if (status === "rejected") {
      query.adminNotes = { $ne: "" };
      query.verifiedByAdmin = false;
    } else {
      // Default: pending (not yet reviewed)
      query.verifiedByAdmin = false;
      query.reviewedAt = null;
    }

    const [credentials, total] = await Promise.all([
      Credential.find(query)
        .populate("teacherId", "name email avatar teacherProfile.verificationStatus")
        .sort({ submittedAt: -1 })
        .skip(skip)
        .limit(limit),
      Credential.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        items: credentials,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get pending credentials error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
