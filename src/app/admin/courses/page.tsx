"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Pagination } from "@/components/shared/Pagination";
import { formatPrice } from "@/lib/utils";
import { Search, CheckCircle2, Star, Archive } from "lucide-react";

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);
    fetch(`/api/admin/courses?${params}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setCourses(d.data?.items || []);
          setTotal(d.data?.total || 0);
        }
      })
      .finally(() => setLoading(false));
  }, [page, search, statusFilter]);

  async function updateCourse(id: string, updates: Record<string, unknown>) {
    const res = await fetch(`/api/admin/courses/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (data.success) {
      setCourses(courses.map((c) => (c._id === id ? { ...c, ...updates } : c)));
    }
  }

  const statuses = ["", "draft", "pending_review", "published", "archived"];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Course Management</h1>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-10"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {statuses.map((s) => (
            <Button
              key={s || "all"}
              variant={statusFilter === s ? "default" : "outline"}
              size="sm"
              onClick={() => { setStatusFilter(s); setPage(1); }}
            >
              {s ? s.replace("_", " ") : "All"}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium">Course</th>
                    <th className="px-4 py-3 text-left font-medium">Teacher</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-right font-medium">Students</th>
                    <th className="px-4 py-3 text-right font-medium">Price</th>
                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course) => (
                    <tr key={course._id} className="border-b">
                      <td className="px-4 py-3">
                        <p className="font-medium">{course.title}</p>
                        <p className="text-xs text-muted-foreground">{course.category?.name}</p>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {course.teacherId?.name}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            course.status === "published"
                              ? "default"
                              : course.status === "pending_review"
                                ? "outline"
                                : "secondary"
                          }
                        >
                          {course.status}
                        </Badge>
                        {course.featured && (
                          <Badge variant="default" className="ml-1 bg-amber-500">
                            <Star className="mr-1 h-3 w-3" />
                            Featured
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">{course.enrollmentCount || 0}</td>
                      <td className="px-4 py-3 text-right">
                        {course.pricingModel === "free" ? "Free" : formatPrice(course.price || 0)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          {course.status === "pending_review" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateCourse(course._id, { status: "published" })}
                              className="text-green-600"
                            >
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                              Approve
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateCourse(course._id, { featured: !course.featured })}
                          >
                            <Star className={`mr-1 h-3 w-3 ${course.featured ? "fill-amber-500 text-amber-500" : ""}`} />
                            {course.featured ? "Unfeature" : "Feature"}
                          </Button>
                          {course.status !== "archived" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateCourse(course._id, { status: "archived" })}
                            >
                              <Archive className="mr-1 h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {total > 20 && (
        <Pagination currentPage={page} totalPages={Math.ceil(total / 20)} onPageChange={setPage} />
      )}
    </div>
  );
}
