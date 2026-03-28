import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import Credential from "@/models/Credential";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "teacher") {
      return NextResponse.json(
        { success: false, error: "Unauthorized — teachers only" },
        { status: 403 }
      );
    }

    await connectDB();

    const credentials = await Credential.find({ teacherId: session.user.id }).sort({
      submittedAt: -1,
    });

    return NextResponse.json({ success: true, data: credentials });
  } catch (error) {
    console.error("Get credentials error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
