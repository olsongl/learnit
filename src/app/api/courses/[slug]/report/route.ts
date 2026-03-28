import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import Course from "@/models/Course";
import mongoose from "mongoose";

// Simple report schema - create inline since it's lightweight
const reportSchema = new mongoose.Schema(
  {
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reason: { type: String, required: true },
    details: { type: String, default: "" },
    status: { type: String, enum: ["pending", "reviewed", "dismissed"], default: "pending" },
  },
  { timestamps: true }
);

const Report = mongoose.models.Report || mongoose.model("Report", reportSchema);

export async function POST(
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
    const { reason, details } = await request.json();

    if (!reason) {
      return NextResponse.json(
        { success: false, error: "Reason is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const course = await Course.findOne({ slug });
    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      );
    }

    await Report.create({
      courseId: course._id,
      userId: session.user.id,
      reason,
      details: details || "",
    });

    return NextResponse.json({
      success: true,
      message: "Report submitted. Our team will review it.",
    });
  } catch (error) {
    console.error("Report course error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
