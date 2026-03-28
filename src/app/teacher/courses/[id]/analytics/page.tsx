"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { StarRating } from "@/components/shared/StarRating";
import { formatPrice } from "@/lib/utils";
import { Users, DollarSign, Star, TrendingUp } from "lucide-react";

export default function CourseAnalyticsPage() {
  const params = useParams();
  const courseId = params.id as string;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/courses/${courseId}/analytics`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setData(d.data);
      })
      .finally(() => setLoading(false));
  }, [courseId]);

  if (loading) return <LoadingSpinner />;
  if (!data) return <p className="text-muted-foreground">Analytics not available.</p>;

  const stats = [
    { label: "Enrollments", value: data.enrollmentCount, icon: Users },
    { label: "Revenue", value: formatPrice(data.revenue || 0), icon: DollarSign },
    { label: "Avg Rating", value: data.averageRating?.toFixed(1) || "N/A", icon: Star },
    { label: "Avg Completion", value: `${Math.round(data.avgCompletion || 0)}%`, icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Course Analytics</h1>

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

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Enrollments</CardTitle>
          </CardHeader>
          <CardContent>
            {data.recentEnrollments?.length === 0 ? (
              <p className="text-sm text-muted-foreground">No enrollments yet.</p>
            ) : (
              <div className="space-y-3">
                {data.recentEnrollments?.map((e: any) => (
                  <div key={e._id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                        {e.userId?.name?.[0] || "?"}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{e.userId?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(e.enrolledAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">{e.progress?.percentComplete || 0}%</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            {data.recentReviews?.length === 0 ? (
              <p className="text-sm text-muted-foreground">No reviews yet.</p>
            ) : (
              <div className="space-y-4">
                {data.recentReviews?.map((r: any) => (
                  <div key={r._id} className="border-b pb-3 last:border-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{r.userId?.name}</p>
                      <StarRating rating={r.rating} size="sm" />
                    </div>
                    <p className="mt-1 text-sm font-medium">{r.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {r.body}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
