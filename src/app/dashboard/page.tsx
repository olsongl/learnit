"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/shared/StarRating";
import { formatPrice } from "@/lib/utils";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  TrendingUp,
  PlayCircle,
} from "lucide-react";

// ---------- Mock data ----------

const MOCK_USER = { name: "Alex" };

const CONTINUE_LEARNING = [
  {
    id: "1",
    title: "Advanced React Patterns",
    thumbnail: "/images/placeholder-course.jpg",
    teacher: "Sarah Chen",
    progress: 65,
    lastLesson: "Compound Components",
    totalLessons: 24,
    completedLessons: 16,
  },
  {
    id: "2",
    title: "Node.js Microservices",
    thumbnail: "/images/placeholder-course.jpg",
    teacher: "Marcus Johnson",
    progress: 30,
    lastLesson: "Service Discovery",
    totalLessons: 32,
    completedLessons: 10,
  },
  {
    id: "3",
    title: "UX Design Fundamentals",
    thumbnail: "/images/placeholder-course.jpg",
    teacher: "Emily Rodriguez",
    progress: 90,
    lastLesson: "Usability Testing",
    totalLessons: 18,
    completedLessons: 16,
  },
];

const STATS = [
  { label: "Courses Enrolled", value: "8", icon: BookOpen },
  { label: "Courses Completed", value: "3", icon: CheckCircle2 },
  { label: "Hours Learned", value: "47", icon: Clock },
  { label: "Average Progress", value: "62%", icon: TrendingUp },
];

const RECOMMENDED = [
  {
    id: "10",
    title: "TypeScript Masterclass",
    thumbnail: "/images/placeholder-course.jpg",
    teacher: "David Park",
    price: 4999,
    rating: 4.8,
    reviewCount: 312,
    enrollmentCount: 2450,
  },
  {
    id: "11",
    title: "System Design Interview Prep",
    thumbnail: "/images/placeholder-course.jpg",
    teacher: "Lisa Wang",
    price: 7999,
    rating: 4.9,
    reviewCount: 187,
    enrollmentCount: 1320,
  },
  {
    id: "12",
    title: "CSS Animations & Transitions",
    thumbnail: "/images/placeholder-course.jpg",
    teacher: "James Oliver",
    price: 2999,
    rating: 4.6,
    reviewCount: 98,
    enrollmentCount: 870,
  },
];

// ---------- Component ----------

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">
          Welcome back, {MOCK_USER.name}
        </h1>
        <p className="mt-1 text-muted-foreground">
          Pick up where you left off or discover something new.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STATS.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-lg bg-primary/10 p-2.5">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Continue Learning */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Continue Learning</h2>
          <Link
            href="/dashboard/courses"
            className="text-sm font-medium text-primary hover:underline"
          >
            View all
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CONTINUE_LEARNING.map((course) => (
            <Card key={course.id} className="overflow-hidden">
              <div className="relative aspect-video bg-muted">
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  <PlayCircle className="h-10 w-10" />
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold leading-tight">{course.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {course.teacher}
                </p>

                <div className="mt-3">
                  <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {course.completedLessons}/{course.totalLessons} lessons
                    </span>
                    <span>{course.progress}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>

                <p className="mt-2 text-xs text-muted-foreground">
                  Last: {course.lastLesson}
                </p>

                <Button size="sm" className="mt-3 w-full" asChild>
                  <Link href={`/dashboard/courses/${course.id}/learn`}>
                    Continue
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Recommended */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recommended for You</h2>
          <Link
            href="/courses"
            className="text-sm font-medium text-primary hover:underline"
          >
            Browse all
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {RECOMMENDED.map((course) => (
            <Card key={course.id} className="overflow-hidden">
              <div className="relative aspect-video bg-muted">
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  <BookOpen className="h-10 w-10" />
                </div>
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
                  <Badge variant="secondary">
                    {course.enrollmentCount.toLocaleString()} students
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
