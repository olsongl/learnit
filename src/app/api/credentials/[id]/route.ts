import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import Credential from "@/models/Credential";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "teacher") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    const { id } = await params;
    await connectDB();

    const credential = await Credential.findOne({
      _id: id,
      teacherId: session.user.id,
    });

    if (!credential) {
      return NextResponse.json(
        { success: false, error: "Credential not found" },
        { status: 404 }
      );
    }

    await credential.deleteOne();

    return NextResponse.json({ success: true, message: "Credential deleted" });
  } catch (error) {
    console.error("Delete credential error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
