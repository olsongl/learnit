"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { formatPrice } from "@/lib/utils";
import {
  Users,
  GraduationCap,
  DollarSign,
  BookOpen,
  BadgeCheck,
  FileText,
  CreditCard,
  UserPlus,
} from "lucide-react";

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setAnalytics(d.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!analytics) return <p>Failed to load analytics.</p>;

  const stats = [
    { label: "Total Users", value: analytics.totalUsers, icon: Users, color: "bg-blue-100 dark:bg-blue-900 text-blue-600" },
    { label: "Teachers", value: analytics.totalTeachers, icon: GraduationCap, color: "bg-purple-100 dark:bg-purple-900 text-purple-600" },
    { label: "Published Courses", value: analytics.publishedCourses, icon: BookOpen, color: "bg-green-100 dark:bg-green-900 text-green-600" },
    { label: "Total Enrollments", value: analytics.totalEnrollments, icon: FileText, color: "bg-amber-100 dark:bg-amber-900 text-amber-600" },
    { label: "Platform Revenue", value: formatPrice(analytics.platformRevenue || 0), icon: DollarSign, color: "bg-emerald-100 dark:bg-emerald-900 text-emerald-600" },
    { label: "Active Subs", value: analytics.activeSubscriptions, icon: CreditCard, color: "bg-indigo-100 dark:bg-indigo-900 text-indigo-600" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">Admin Dashboard</h1>
        <p className="mt-1 text-muted-foreground">Platform overview and management.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className={`rounded-lg p-2.5 ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pending Actions */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-lg">
              Pending Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/admin/credentials" className="flex items-center justify-between rounded-md border p-3 hover:bg-accent">
              <div className="flex items-center gap-3">
                <BadgeCheck className="h-5 w-5 text-amber-500" />
                <span className="text-sm font-medium">Credentials to Review</span>
              </div>
              <Badge variant="destructive">{analytics.pendingCredentials}</Badge>
            </Link>
            <Link href="/admin/courses?status=pending_review" className="flex items-center justify-between rounded-md border p-3 hover:bg-accent">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-amber-500" />
                <span className="text-sm font-medium">Courses Pending Approval</span>
              </div>
              <Badge variant="destructive">{analytics.pendingCourses}</Badge>
            </Link>
            <Link href="/admin/users" className="flex items-center justify-between rounded-md border p-3 hover:bg-accent">
              <div className="flex items-center gap-3">
                <UserPlus className="h-5 w-5 text-blue-500" />
                <span className="text-sm font-medium">Recent Signups (30d)</span>
              </div>
              <Badge>{analytics.recentSignups}</Badge>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium mb-2">Users by Role</p>
              <div className="flex gap-2">
                {Object.entries(analytics.usersByRole || {}).map(([role, count]) => (
                  <Badge key={role} variant="outline" className="text-xs">
                    {role}: {count as number}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Courses by Status</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(analytics.coursesByStatus || {}).map(([status, count]) => (
                  <Badge key={status} variant="outline" className="text-xs">
                    {status}: {count as number}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
