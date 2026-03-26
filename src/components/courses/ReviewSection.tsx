"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/shared/StarRating";
import { cn } from "@/lib/utils";
import { ThumbsUp } from "lucide-react";

interface ReviewAuthor {
  name: string;
  avatar: string;
}

interface Review {
  id: string;
  author: ReviewAuthor;
  rating: number;
  title: string;
  body: string;
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  createdAt: string;
}

interface RatingBreakdown {
  5: number;
  4: number;
  3: number;
  2: number;
  1: number;
}

interface ReviewSectionProps {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
  ratingBreakdown: RatingBreakdown;
  className?: string;
}

export function ReviewSection({
  reviews,
  averageRating,
  totalReviews,
  ratingBreakdown,
  className,
}: ReviewSectionProps) {
  return (
    <div className={cn("space-y-6", className)}>
      <h2 className="text-2xl font-bold">Student Reviews</h2>

      {/* Rating Overview */}
      <div className="flex flex-col sm:flex-row gap-6 sm:gap-10">
        {/* Average Rating */}
        <div className="flex flex-col items-center sm:items-start">
          <span className="text-5xl font-bold">{averageRating.toFixed(1)}</span>
          <StarRating rating={averageRating} size="lg" className="mt-1" />
          <span className="text-sm text-muted-foreground mt-1">
            {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
          </span>
        </div>

        {/* Rating Breakdown Bar Chart */}
        <div className="flex-1 space-y-2">
          {([5, 4, 3, 2, 1] as const).map((star) => {
            const count = ratingBreakdown[star];
            const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-3">
                <span className="text-sm w-12 text-right text-muted-foreground">
                  {star} star
                </span>
                <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm w-8 text-muted-foreground">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Individual Reviews */}
      <div className="space-y-6">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>

      {reviews.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          No reviews yet. Be the first to leave a review!
        </p>
      )}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const initials = review.author.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={review.author.avatar} alt={review.author.name} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-sm">{review.author.name}</span>
              {review.isVerifiedPurchase && (
                <Badge variant="success" className="text-[10px] px-1.5 py-0">
                  Verified Purchase
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <StarRating rating={review.rating} size="sm" />
              <span className="text-xs text-muted-foreground">
                {review.createdAt}
              </span>
            </div>
            {review.title && (
              <h4 className="font-semibold mt-2">{review.title}</h4>
            )}
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              {review.body}
            </p>
            {review.helpfulCount > 0 && (
              <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
                <ThumbsUp className="h-3 w-3" />
                <span>
                  {review.helpfulCount}{" "}
                  {review.helpfulCount === 1 ? "person" : "people"} found this
                  helpful
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
