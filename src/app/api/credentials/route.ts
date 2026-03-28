import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import Credential from "@/models/Credential";
import { createCredentialSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "teacher") {
      return NextResponse.json(
        { success: false, error: "Unauthorized — teachers only" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = createCredentialSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    await connectDB();

    const credential = await Credential.create({
      ...parsed.data,
      teacherId: session.user.id,
      submittedAt: new Date(),
    });

    return NextResponse.json(
      { success: true, data: credential },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create credential error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
