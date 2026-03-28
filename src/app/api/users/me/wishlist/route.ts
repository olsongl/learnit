import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";

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
    const user = await User.findById(session.user.id).populate({
      path: "wishlist",
      select: "title slug thumbnail shortDescription price pricingModel averageRating enrollmentCount teacherId",
      populate: { path: "teacherId", select: "name avatar" },
    });

    return NextResponse.json({ success: true, data: user?.wishlist || [] });
  } catch (error) {
    console.error("Get wishlist error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { courseId } = await request.json();
    if (!courseId) {
      return NextResponse.json(
        { success: false, error: "courseId is required" },
        { status: 400 }
      );
    }

    await connectDB();
    await User.findByIdAndUpdate(session.user.id, {
      $addToSet: { wishlist: courseId },
    });

    return NextResponse.json({ success: true, message: "Added to wishlist" });
  } catch (error) {
    console.error("Add to wishlist error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { courseId } = await request.json();
    if (!courseId) {
      return NextResponse.json(
        { success: false, error: "courseId is required" },
        { status: 400 }
      );
    }

    await connectDB();
    await User.findByIdAndUpdate(session.user.id, {
      $pull: { wishlist: courseId },
    });

    return NextResponse.json({ success: true, message: "Removed from wishlist" });
  } catch (error) {
    console.error("Remove from wishlist error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
