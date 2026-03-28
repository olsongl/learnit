"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatPrice } from "@/lib/utils";
import { Plus, GraduationCap, Search } from "lucide-react";

export default function TeacherCoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const params = new URLSearchParams({ limit: "50" });
        if (statusFilter) params.set("status", statusFilter);
        if (search) params.set("search", search);
        const res = await fetch(`/api/courses?teacherId=me&${params}`);
        const data = await res.json();
        if (data.success) setCourses(data.data?.items || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [search, statusFilter]);

  if (loading) return <LoadingSpinner />;

  const statuses = ["", "draft", "pending_review", "published", "archived"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Courses</h1>
        <Button asChild>
          <Link href="/teacher/courses/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Course
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {statuses.map((s) => (
            <Button
              key={s || "all"}
              variant={statusFilter === s ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(s)}
            >
              {s || "All"}
            </Button>
          ))}
        </div>
      </div>

      {courses.length === 0 ? (
        <EmptyState
          icon={<GraduationCap className="h-12 w-12" />}
          title="No courses found"
          description="Create your first course to get started."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card key={course._id} className="overflow-hidden">
              <div className="aspect-video bg-muted flex items-center justify-center">
                {course.thumbnail ? (
                  <img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover" />
                ) : (
                  <GraduationCap className="h-10 w-10 text-muted-foreground" />
                )}
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold leading-tight">{course.title}</h3>
                  <Badge
                    variant={
                      course.status === "published"
                        ? "default"
                        : course.status === "draft"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {course.status}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                  {course.shortDescription || course.description}
                </p>
                <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
                  <span>{course.enrollmentCount || 0} students</span>
                  <span>{course.pricingModel === "free" ? "Free" : formatPrice(course.price || 0)}</span>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button variant="outline" size="sm" asChild className="flex-1">
                    <Link href={`/teacher/courses/${course._id}/edit`}>Edit</Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild className="flex-1">
                    <Link href={`/teacher/courses/${course._id}/analytics`}>Stats</Link>
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
