import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { resetPasswordSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = resetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({
      resetPasswordToken: parsed.data.token,
      resetPasswordTokenExpiry: { $gt: new Date() },
    }).select("+resetPasswordToken +resetPasswordTokenExpiry +passwordHash");

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired token" },
        { status: 400 }
      );
    }

    user.passwordHash = await bcrypt.hash(parsed.data.password, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpiry = undefined;
    await user.save();

    return NextResponse.json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
