"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/EmptyState";
import { StarRating } from "@/components/shared/StarRating";
import { formatPrice } from "@/lib/utils";
import { Heart, BookOpen, Trash2 } from "lucide-react";

// ---------- Mock data ----------

interface WishlistCourse {
  id: string;
  title: string;
  teacher: string;
  thumbnail: string;
  price: number;
  rating: number;
  reviewCount: number;
  enrollmentCount: number;
  difficulty: string;
}

const INITIAL_WISHLIST: WishlistCourse[] = [
  {
    id: "10",
    title: "TypeScript Masterclass",
    teacher: "David Park",
    thumbnail: "/images/placeholder-course.jpg",
    price: 4999,
    rating: 4.8,
    reviewCount: 312,
    enrollmentCount: 2450,
    difficulty: "Intermediate",
  },
  {
    id: "11",
    title: "System Design Interview Prep",
    teacher: "Lisa Wang",
    thumbnail: "/images/placeholder-course.jpg",
    price: 7999,
    rating: 4.9,
    reviewCount: 187,
    enrollmentCount: 1320,
    difficulty: "Advanced",
  },
  {
    id: "12",
    title: "CSS Animations & Transitions",
    teacher: "James Oliver",
    thumbnail: "/images/placeholder-course.jpg",
    price: 2999,
    rating: 4.6,
    reviewCount: 98,
    enrollmentCount: 870,
    difficulty: "Beginner",
  },
  {
    id: "13",
    title: "Docker & Kubernetes for Developers",
    teacher: "Maya Patel",
    thumbnail: "/images/placeholder-course.jpg",
    price: 5999,
    rating: 4.7,
    reviewCount: 245,
    enrollmentCount: 1780,
    difficulty: "Intermediate",
  },
];

// ---------- Page ----------

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState(INITIAL_WISHLIST);

  function handleRemove(id: string) {
    setWishlist((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">Wishlist</h1>
        <p className="mt-1 text-muted-foreground">
          Courses you&apos;ve saved for later.
        </p>
      </div>

      {wishlist.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Your wishlist is empty"
          description="Browse courses and save the ones you're interested in."
          actionLabel="Browse Courses"
          actionHref="/courses"
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {wishlist.map((course) => (
            <Card key={course.id} className="overflow-hidden">
              <div className="relative aspect-video bg-muted">
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  <BookOpen className="h-10 w-10" />
                </div>
                <Badge variant="secondary" className="absolute right-2 top-2">
                  {course.difficulty}
                </Badge>
              </div>

              <CardContent className="p-4">
                <h3 className="font-semibold leading-tight">{course.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {course.teacher}
                </p>

                <div className="mt-2 flex items-center gap-2">
                  <StarRating rating={course.rating} size="sm" showValue />
                  <span className="text-xs text-muted-foreground">
                    ({course.reviewCount})
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-lg font-bold">
                    {formatPrice(course.price)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {course.enrollmentCount.toLocaleString()} students
                  </span>
                </div>

                <div className="mt-3 flex gap-2">
                  <Button size="sm" className="flex-1" asChild>
                    <Link href={`/courses/${course.id}`}>Enroll</Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRemove(course.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Remove</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
