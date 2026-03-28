import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { signUpSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = signUpSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, email, password, role } = parsed.data;
    await connectDB();

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "Email already in use" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const userData: Record<string, unknown> = {
      name,
      email: email.toLowerCase(),
      passwordHash,
      role,
    };

    if (role === "teacher") {
      userData.teacherProfile = {
        bio: "",
        headline: "",
        verificationStatus: "pending",
        subscriptionStatus: "none",
        socialLinks: [],
      };
    }

    const user = await User.create(userData);

    return NextResponse.json(
      {
        success: true,
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
