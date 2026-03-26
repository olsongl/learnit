import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 100);
}

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function calculatePriceBreakdown(priceInCents: number) {
  const stripeFeePercent = 0.029;
  const stripeFeeFixed = 30; // 30 cents
  const platformFeePercent = parseFloat(
    process.env.PLATFORM_COMMISSION_RATE || "0.015"
  );

  const stripeFee = Math.round(priceInCents * stripeFeePercent + stripeFeeFixed);
  const platformFee = Math.round(priceInCents * platformFeePercent);
  const teacherPayout = priceInCents - stripeFee - platformFee;

  return {
    listPrice: priceInCents,
    stripeFee,
    platformFee,
    teacherPayout,
  };
}

export function generateVerificationToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}
