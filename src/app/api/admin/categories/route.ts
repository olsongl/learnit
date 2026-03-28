import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import Category from "@/models/Category";
import { createCategorySchema } from "@/lib/validators";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = createCategorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    await connectDB();

    let slug = slugify(parsed.data.name);
    const existing = await Category.findOne({ slug });
    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const category = await Category.create({
      ...parsed.data,
      slug,
    });

    return NextResponse.json(
      { success: true, data: category },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create category error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
