import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    if (user.role === "teacher") {
      return NextResponse.json(
        { success: false, error: "Already a teacher" },
        { status: 400 }
      );
    }

    if (user.role === "admin") {
      return NextResponse.json(
        { success: false, error: "Admins cannot switch to teacher" },
        { status: 400 }
      );
    }

    user.role = "teacher";
    user.teacherProfile = {
      bio: "",
      headline: "",
      verificationStatus: "pending",
      subscriptionStatus: "none",
      socialLinks: [],
    };
    await user.save();

    return NextResponse.json({
      success: true,
      data: { role: user.role },
      message: "Upgraded to teacher. Please submit your credentials for verification.",
    });
  } catch (error) {
    console.error("Upgrade to teacher error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
