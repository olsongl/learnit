import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { calculatePriceBreakdown } from "@/lib/stripe";

export async function GET(request: NextRequest) {
  const amount = parseInt(
    request.nextUrl.searchParams.get("amount") || "0"
  );

  if (amount <= 0) {
    return NextResponse.json(
      { success: false, error: "amount must be positive (in cents)" },
      { status: 400 }
    );
  }

  const breakdown = calculatePriceBreakdown(amount);

  return NextResponse.json({ success: true, data: breakdown });
}
