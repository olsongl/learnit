"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { formatPrice } from "@/lib/utils";
import {
  Users,
  GraduationCap,
  BookOpen,
  DollarSign,
  TrendingUp,
  CreditCard,
} from "lucide-react";

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setData(d.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!data) return <p>Failed to load analytics.</p>;

  const metrics = [
    { label: "Total Users", value: data.totalUsers, icon: Users },
    { label: "Total Teachers", value: data.totalTeachers, icon: GraduationCap },
    { label: "Total Courses", value: data.totalCourses, icon: BookOpen },
    { label: "Published Courses", value: data.publishedCourses, icon: BookOpen },
    { label: "Total Enrollments", value: data.totalEnrollments, icon: TrendingUp },
    { label: "Total Revenue", value: formatPrice(data.totalRevenue || 0), icon: DollarSign },
    { label: "Platform Revenue", value: formatPrice(data.platformRevenue || 0), icon: DollarSign },
    { label: "Active Subscriptions", value: data.activeSubscriptions, icon: CreditCard },
    { label: "Recent Signups (30d)", value: data.recentSignups, icon: Users },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Platform Analytics</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {metrics.map((m) => (
          <Card key={m.label}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-lg bg-primary/10 p-2.5">
                <m.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{m.value}</p>
                <p className="text-xs text-muted-foreground">{m.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Users by Role</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(data.usersByRole || {}).map(([role, count]) => (
                <div key={role} className="flex items-center justify-between">
                  <span className="capitalize text-sm">{role}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.max(20, ((count as number) / data.totalUsers) * 200)}px` }} />
                    <span className="text-sm font-medium">{count as number}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Courses by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(data.coursesByStatus || {}).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <Badge variant="outline">{status}</Badge>
                  <span className="text-sm font-medium">{count as number}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
