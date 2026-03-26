"use client";

import Link from "next/link";
import { Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/shared/StarRating";
import { VerifiedBadge } from "@/components/shared/VerifiedBadge";
import { cn, formatPrice } from "@/lib/utils";

export interface CourseCardData {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  thumbnail?: string;
  teacherName: string;
  teacherVerified: boolean;
  averageRating: number;
  reviewCount: number;
  pricingModel: "free" | "one_time" | "monthly" | "tiered";
  price: number; // in cents
  enrollmentCount: number;
  difficulty: "beginner" | "intermediate" | "advanced" | "all_levels";
  category: string;
}

const difficultyConfig: Record<
  CourseCardData["difficulty"],
  { label: string; variant: "default" | "secondary" | "warning" | "success" }
> = {
  beginner: { label: "Beginner", variant: "success" },
  intermediate: { label: "Intermediate", variant: "warning" },
  advanced: { label: "Advanced", variant: "destructive" as "default" },
  all_levels: { label: "All Levels", variant: "secondary" },
};

const gradients = [
  "from-blue-500 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-orange-500 to-red-600",
  "from-purple-500 to-pink-600",
  "from-cyan-500 to-blue-600",
  "from-amber-500 to-orange-600",
];

function getGradient(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return gradients[Math.abs(hash) % gradients.length];
}

function formatPriceDisplay(
  pricingModel: CourseCardData["pricingModel"],
  price: number
): string {
  if (pricingModel === "free") return "Free";
  const formatted = formatPrice(price);
  if (pricingModel === "monthly") return `${formatted}/mo`;
  return formatted;
}

function formatEnrollmentCount(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return count.toString();
}

interface CourseCardProps {
  course: CourseCardData;
  className?: string;
}

export function CourseCard({ course, className }: CourseCardProps) {
  const difficulty = difficultyConfig[course.difficulty];

  return (
    <Link href={`/courses/${course.slug}`} className={cn("group", className)}>
      <Card className="h-full overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden">
          {course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div
              className={cn(
                "h-full w-full bg-gradient-to-br",
                getGradient(course.id)
              )}
            />
          )}
          <Badge
            variant={difficulty.variant as "default"}
            className="absolute top-2 right-2 text-[10px]"
          >
            {difficulty.label}
          </Badge>
        </div>

        <CardContent className="p-4 space-y-3">
          {/* Title */}
          <h3 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {course.title}
          </h3>

          {/* Short description */}
          <p className="text-xs text-muted-foreground line-clamp-2">
            {course.shortDescription}
          </p>

          {/* Teacher */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="truncate">{course.teacherName}</span>
            {course.teacherVerified && (
              <VerifiedBadge size="sm" showLabel={false} />
            )}
          </div>

          {/* Rating */}
          <StarRating
            rating={course.averageRating}
            size="sm"
            showValue
            count={course.reviewCount}
          />

          {/* Footer: Price + Enrollments */}
          <div className="flex items-center justify-between pt-1">
            <span
              className={cn(
                "font-bold text-sm",
                course.pricingModel === "free"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-foreground"
              )}
            >
              {formatPriceDisplay(course.pricingModel, course.price)}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="h-3 w-3" />
              {formatEnrollmentCount(course.enrollmentCount)}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
