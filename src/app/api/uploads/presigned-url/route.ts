import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPresignedUploadUrl } from "@/lib/s3";
import { presignedUrlSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = presignedUrlSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { filename, contentType, folder } = parsed.data;
    const key = `${folder}/${session.user.id}/${Date.now()}-${filename}`;
    const url = await getPresignedUploadUrl(key, contentType);

    return NextResponse.json({ success: true, data: { url, key } });
  } catch (error) {
    console.error("Presigned URL error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
