import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import Course from "@/models/Course";
import User from "@/models/User";
import { createCourseSchema } from "@/lib/validators";
import { calculatePriceBreakdown } from "@/lib/stripe";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = request.nextUrl;
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const difficulty = searchParams.get("difficulty");
    const pricingModel = searchParams.get("pricingModel");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const sort = searchParams.get("sort") || "newest";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const teacherId = searchParams.get("teacherId");
    const status = searchParams.get("status");

    const query: Record<string, unknown> = {};

    // If teacherId is provided (teacher viewing own courses), allow all statuses
    if (teacherId) {
      query.teacherId = teacherId;
      if (status) query.status = status;
    } else {
      query.status = "published";
    }

    if (search) {
      query.$text = { $search: search };
    }
    if (category) {
      query.category = category;
    }
    if (difficulty) {
      query.difficulty = difficulty;
    }
    if (pricingModel) {
      query.pricingModel = pricingModel;
    }
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) (query.price as Record<string, number>).$gte = parseInt(minPrice);
      if (maxPrice) (query.price as Record<string, number>).$lte = parseInt(maxPrice);
    }

    let sortObj: Record<string, 1 | -1> = { createdAt: -1 };
    switch (sort) {
      case "popular":
        sortObj = { enrollmentCount: -1 };
        break;
      case "rating":
        sortObj = { averageRating: -1 };
        break;
      case "price_low":
        sortObj = { price: 1 };
        break;
      case "price_high":
        sortObj = { price: -1 };
        break;
    }

    const skip = (page - 1) * limit;

    const [courses, total] = await Promise.all([
      Course.find(query)
        .populate("teacherId", "name avatar teacherProfile.verificationStatus")
        .populate("category", "name slug")
        .sort(sortObj)
        .skip(skip)
        .limit(limit),
      Course.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        items: courses,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get courses error:", error);
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

    await connectDB();

    const user = await User.findById(session.user.id);
    if (
      !user ||
      user.role !== "teacher" ||
      user.teacherProfile?.verificationStatus !== "approved"
    ) {
      return NextResponse.json(
        { success: false, error: "Only verified teachers can create courses" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = createCourseSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    let slug = slugify(parsed.data.title);
    const existingSlug = await Course.findOne({ slug });
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const priceBreakdown =
      parsed.data.price && parsed.data.price > 0
        ? calculatePriceBreakdown(parsed.data.price)
        : undefined;

    const course = await Course.create({
      ...parsed.data,
      slug,
      teacherId: session.user.id,
      priceBreakdown,
      status: "draft",
    });

    return NextResponse.json(
      { success: true, data: course },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create course error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
