import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-03-25.dahlia",
  typescript: true,
});

export const PLATFORM_COMMISSION_RATE = parseFloat(
  process.env.PLATFORM_COMMISSION_RATE || "0.015"
);

export const STRIPE_FEE_PERCENT = 0.029;
export const STRIPE_FEE_FIXED = 30; // cents

export function calculateApplicationFee(amountInCents: number): number {
  return Math.round(amountInCents * PLATFORM_COMMISSION_RATE);
}

export function calculatePriceBreakdown(amountInCents: number) {
  const stripeFee = Math.round(
    amountInCents * STRIPE_FEE_PERCENT + STRIPE_FEE_FIXED
  );
  const platformFee = calculateApplicationFee(amountInCents);
  const teacherPayout = amountInCents - stripeFee - platformFee;

  return {
    listPrice: amountInCents,
    stripeFee,
    platformFee,
    teacherPayout,
  };
}
