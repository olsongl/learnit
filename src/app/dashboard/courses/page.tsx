"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared/EmptyState";
import { StarRating } from "@/components/shared/StarRating";
import { BookOpen, PlayCircle } from "lucide-react";

// ---------- Mock data ----------

interface EnrolledCourse {
  id: string;
  title: string;
  teacher: string;
  thumbnail: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  lastAccessed: string;
  rating: number;
  status: "in_progress" | "completed";
}

const MOCK_COURSES: EnrolledCourse[] = [
  {
    id: "1",
    title: "Advanced React Patterns",
    teacher: "Sarah Chen",
    thumbnail: "/images/placeholder-course.jpg",
    progress: 65,
    totalLessons: 24,
    completedLessons: 16,
    lastAccessed: "2 hours ago",
    rating: 4.8,
    status: "in_progress",
  },
  {
    id: "2",
    title: "Node.js Microservices",
    teacher: "Marcus Johnson",
    thumbnail: "/images/placeholder-course.jpg",
    progress: 30,
    totalLessons: 32,
    completedLessons: 10,
    lastAccessed: "1 day ago",
    rating: 4.6,
    status: "in_progress",
  },
  {
    id: "3",
    title: "UX Design Fundamentals",
    teacher: "Emily Rodriguez",
    thumbnail: "/images/placeholder-course.jpg",
    progress: 90,
    totalLessons: 18,
    completedLessons: 16,
    lastAccessed: "3 days ago",
    rating: 4.7,
    status: "in_progress",
  },
  {
    id: "4",
    title: "Git & GitHub Mastery",
    teacher: "Tom Baker",
    thumbnail: "/images/placeholder-course.jpg",
    progress: 100,
    totalLessons: 14,
    completedLessons: 14,
    lastAccessed: "2 weeks ago",
    rating: 4.5,
    status: "completed",
  },
  {
    id: "5",
    title: "Intro to Python",
    teacher: "Ana Costa",
    thumbnail: "/images/placeholder-course.jpg",
    progress: 100,
    totalLessons: 20,
    completedLessons: 20,
    lastAccessed: "1 month ago",
    rating: 4.9,
    status: "completed",
  },
];

// ---------- Helpers ----------

function CourseCard({ course }: { course: EnrolledCourse }) {
  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-video bg-muted">
        <div className="flex h-full items-center justify-center text-muted-foreground">
          <PlayCircle className="h-10 w-10" />
        </div>
        {course.status === "completed" && (
          <Badge variant="success" className="absolute right-2 top-2">
            Completed
          </Badge>
        )}
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold leading-tight">{course.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{course.teacher}</p>

        <div className="mt-2">
          <StarRating rating={course.rating} size="sm" showValue />
        </div>

        {/* Progress */}
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
          Last accessed: {course.lastAccessed}
        </p>

        <Button size="sm" className="mt-3 w-full" asChild>
          <Link href={`/dashboard/courses/${course.id}/learn`}>
            {course.status === "completed" ? "Review" : "Continue"}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

// ---------- Page ----------

export default function MyCoursesPage() {
  const [tab, setTab] = useState("all");

  const filtered =
    tab === "all"
      ? MOCK_COURSES
      : MOCK_COURSES.filter((c) => c.status === tab);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">My Courses</h1>
        <p className="mt-1 text-muted-foreground">
          Track your progress and continue learning.
        </p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="all">
            All ({MOCK_COURSES.length})
          </TabsTrigger>
          <TabsTrigger value="in_progress">
            In Progress (
            {MOCK_COURSES.filter((c) => c.status === "in_progress").length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed (
            {MOCK_COURSES.filter((c) => c.status === "completed").length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={tab}>
          {filtered.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No courses yet"
              description={
                tab === "completed"
                  ? "You haven't completed any courses yet. Keep learning!"
                  : "You haven't enrolled in any courses. Browse our catalog to get started."
              }
              actionLabel="Browse Courses"
              actionHref="/courses"
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
