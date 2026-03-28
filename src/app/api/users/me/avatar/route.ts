import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { avatarUrl } = await request.json();
    if (!avatarUrl) {
      return NextResponse.json(
        { success: false, error: "avatarUrl is required" },
        { status: 400 }
      );
    }

    await connectDB();
    const user = await User.findByIdAndUpdate(
      session.user.id,
      { avatar: avatarUrl },
      { new: true }
    );

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error("Update avatar error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
