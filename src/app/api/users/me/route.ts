import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { updateProfileSchema } from "@/lib/validators";

export async function GET() {
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

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = updateProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
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

    const { name, bio, headline, linkedIn, website, socialLinks } = parsed.data;

    if (name) user.name = name;

    if (user.role === "teacher" && user.teacherProfile) {
      if (bio !== undefined) user.teacherProfile.bio = bio;
      if (headline !== undefined) user.teacherProfile.headline = headline;
      if (linkedIn !== undefined) user.teacherProfile.linkedIn = linkedIn;
      if (website !== undefined) user.teacherProfile.website = website;
      if (socialLinks !== undefined) user.teacherProfile.socialLinks = socialLinks;
    }

    await user.save();
    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
