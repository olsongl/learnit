import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function POST(request: Request) {
  try {
    const { token } = await request.json();
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Token is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: new Date() },
    }).select("+verificationToken +verificationTokenExpiry");

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired token" },
        { status: 400 }
      );
    }

    user.emailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    await user.save();

    return NextResponse.json({ success: true, message: "Email verified" });
  } catch (error) {
    console.error("Verify email error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
