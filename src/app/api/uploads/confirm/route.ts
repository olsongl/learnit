import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPublicUrl } from "@/lib/s3";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { key } = await request.json();
    if (!key) {
      return NextResponse.json(
        { success: false, error: "key is required" },
        { status: 400 }
      );
    }

    const url = getPublicUrl(key);
    return NextResponse.json({ success: true, data: { url } });
  } catch (error) {
    console.error("Confirm upload error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
