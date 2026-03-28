import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { updateUserAdminSchema } from "@/lib/validators";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = updateUserAdminSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    await connectDB();

    const updateData: Record<string, unknown> = {};
    if (parsed.data.role !== undefined) {
      updateData.role = parsed.data.role;
      // Initialize teacher profile if upgrading to teacher
      if (parsed.data.role === "teacher") {
        const user = await User.findById(id);
        if (user && !user.teacherProfile) {
          updateData.teacherProfile = {
            bio: "",
            headline: "",
            verificationStatus: "pending",
            subscriptionStatus: "none",
            socialLinks: [],
          };
        }
      }
    }
    if (parsed.data.suspended !== undefined) {
      updateData.suspended = parsed.data.suspended;
    }

    const user = await User.findByIdAndUpdate(id, updateData, { new: true });
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error("Update user admin error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
