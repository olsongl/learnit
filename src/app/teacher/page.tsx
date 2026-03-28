"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { formatPrice } from "@/lib/utils";
import {
  GraduationCap,
  Users,
  DollarSign,
  Star,
  Plus,
  Award,
  TrendingUp,
} from "lucide-react";

export default function TeacherDashboard() {
  const [user, setUser] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [userRes, coursesRes] = await Promise.all([
          fetch("/api/users/me"),
          fetch("/api/courses?teacherId=me&limit=50"),
        ]);
        const userData = await userRes.json();
        const courseData = await coursesRes.json();
        if (userData.success) setUser(userData.data);
        if (courseData.success) setCourses(courseData.data?.items || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <LoadingSpinner />;

  const totalStudents = courses.reduce((s, c) => s + (c.enrollmentCount || 0), 0);
  const avgRating =
    courses.length > 0
      ? courses.reduce((s, c) => s + (c.averageRating || 0), 0) / courses.length
      : 0;

  const stats = [
    { label: "Total Courses", value: courses.length, icon: GraduationCap },
    { label: "Total Students", value: totalStudents, icon: Users },
    { label: "Avg Rating", value: avgRating.toFixed(1), icon: Star },
    { label: "Published", value: courses.filter((c) => c.status === "published").length, icon: TrendingUp },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">
            Welcome, {user?.name || "Teacher"}
          </h1>
          <p className="mt-1 text-muted-foreground">
            Manage your courses and track performance.
          </p>
        </div>
        <Button asChild>
          <Link href="/teacher/courses/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Course
          </Link>
        </Button>
      </div>

      {user?.teacherProfile?.verificationStatus !== "approved" && (
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950">
          <CardContent className="flex items-center gap-4 p-4">
            <Award className="h-8 w-8 text-amber-600" />
            <div className="flex-1">
              <p className="font-semibold">Credentials {user?.teacherProfile?.verificationStatus || "pending"}</p>
              <p className="text-sm text-muted-foreground">
                Submit and get your credentials verified to start publishing courses.
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/teacher/credentials">Manage Credentials</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
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

      <section>
        <h2 className="mb-4 text-xl font-semibold">Your Courses</h2>
        {courses.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-12">
              <GraduationCap className="h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">No courses yet. Create your first course!</p>
              <Button asChild>
                <Link href="/teacher/courses/new">Create Course</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses.slice(0, 6).map((course) => (
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
                  <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{course.enrollmentCount || 0} students</span>
                    <span>{course.averageRating?.toFixed(1) || "0.0"} rating</span>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button variant="outline" size="sm" asChild className="flex-1">
                      <Link href={`/teacher/courses/${course._id}/edit`}>Edit</Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild className="flex-1">
                      <Link href={`/teacher/courses/${course._id}/analytics`}>Analytics</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
