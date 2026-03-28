import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { saveLocalFile } from "@/lib/s3";

export async function POST(request: NextRequest) {
  if (process.env.STORAGE_PROVIDER !== "local") {
    return NextResponse.json(
      { success: false, error: "Local uploads not enabled" },
      { status: 400 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const key = formData.get("key") as string;

    if (!file || !key) {
      return NextResponse.json(
        { success: false, error: "file and key are required" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    await saveLocalFile(key, buffer);

    return NextResponse.json({
      success: true,
      data: { url: `/uploads/${key}` },
    });
  } catch (error) {
    console.error("Local upload error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  if (process.env.STORAGE_PROVIDER !== "local") {
    return NextResponse.json(
      { success: false, error: "Local uploads not enabled" },
      { status: 400 }
    );
  }

  const key = request.nextUrl.searchParams.get("key");
  if (!key) {
    return NextResponse.json(
      { success: false, error: "key parameter required" },
      { status: 400 }
    );
  }

  // Redirect to the static file path
  return NextResponse.redirect(new URL(`/uploads/${key}`, request.url));
}
