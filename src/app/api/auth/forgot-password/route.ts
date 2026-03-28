import { NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { sendPasswordResetEmail } from "@/lib/email";
import { forgotPasswordSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid email" },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email: parsed.data.email.toLowerCase() });
    if (user) {
      const token = crypto.randomUUID();
      user.resetPasswordToken = token;
      user.resetPasswordTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);
      await user.save();
      await sendPasswordResetEmail(user.email, token);
    }

    // Always return success to not leak whether email exists
    return NextResponse.json({
      success: true,
      message: "If an account exists, a reset link has been sent",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
