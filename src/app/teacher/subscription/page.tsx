"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { CreditCard, CheckCircle2 } from "lucide-react";

export default function TeacherSubscriptionPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/users/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setUser(d.data);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSubscribe() {
    const res = await fetch("/api/stripe/create-subscription", { method: "POST" });
    const data = await res.json();
    if (data.success && data.data?.url) {
      window.location.href = data.data.url;
    }
  }

  if (loading) return <LoadingSpinner />;

  const subStatus = user?.teacherProfile?.subscriptionStatus || "none";
  const isActive = subStatus === "active";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Platform Subscription</h1>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Teacher Plan</CardTitle>
            <Badge variant={isActive ? "default" : "secondary"}>
              {subStatus === "none" ? "Not Subscribed" : subStatus}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">$5</span>
            <span className="text-muted-foreground">/month</span>
          </div>

          <ul className="space-y-2">
            {[
              "Publish unlimited courses",
              "Access to course analytics",
              "Stripe Connect payouts",
              "Course bundling",
              "Student management",
              "7-day free trial",
            ].map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                {feature}
              </li>
            ))}
          </ul>

          {isActive ? (
            <p className="text-sm text-green-600 font-medium">
              Your subscription is active. You can publish courses.
            </p>
          ) : (
            <Button onClick={handleSubscribe} className="w-full" size="lg">
              <CreditCard className="mr-2 h-4 w-4" />
              {subStatus === "none" ? "Start Free Trial" : "Resubscribe"}
            </Button>
          )}

          {subStatus === "past_due" && (
            <p className="text-sm text-amber-600">
              Your payment is past due. Please update your payment method.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
