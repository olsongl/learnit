import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import Credential from "@/models/Credential";
import User from "@/models/User";
import { reviewCredentialSchema } from "@/lib/validators";

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
    const parsed = reviewCredentialSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    await connectDB();

    const credential = await Credential.findById(id);
    if (!credential) {
      return NextResponse.json(
        { success: false, error: "Credential not found" },
        { status: 404 }
      );
    }

    const { status, adminNotes } = parsed.data;

    credential.verifiedByAdmin = status === "approved";
    credential.adminNotes = adminNotes || "";
    credential.reviewedAt = new Date();
    await credential.save();

    // Update teacher's overall verification status
    const allCredentials = await Credential.find({
      teacherId: credential.teacherId,
    });

    let verificationStatus: string;
    if (allCredentials.some((c) => c.reviewedAt && !c.verifiedByAdmin && c.adminNotes)) {
      // Check if any were explicitly rejected (has adminNotes and not verified)
      const hasRejected = allCredentials.some(
        (c) => c.reviewedAt && !c.verifiedByAdmin
      );
      const hasMoreInfo = status === "more_info_needed";
      if (hasMoreInfo) {
        verificationStatus = "more_info_needed";
      } else if (hasRejected) {
        verificationStatus = "rejected";
      } else {
        verificationStatus = "pending";
      }
    } else if (allCredentials.length > 0 && allCredentials.every((c) => c.verifiedByAdmin)) {
      verificationStatus = "approved";
    } else {
      verificationStatus = "pending";
    }

    await User.findByIdAndUpdate(credential.teacherId, {
      "teacherProfile.verificationStatus": verificationStatus,
    });

    return NextResponse.json({
      success: true,
      data: credential,
      message: `Credential ${status}`,
    });
  } catch (error) {
    console.error("Review credential error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
