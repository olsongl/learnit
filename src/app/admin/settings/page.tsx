"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Settings, Percent, DollarSign, Clock, Database } from "lucide-react";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setSettings(d.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const items = [
    {
      icon: Percent,
      label: "Platform Commission Rate",
      value: `${((settings?.platformCommissionRate || 0) * 100).toFixed(1)}%`,
      description: "Applied to every course sale",
    },
    {
      icon: DollarSign,
      label: "Teacher Subscription Price",
      value: `$${((settings?.teacherSubscriptionPrice || 0) / 100).toFixed(2)}/month`,
      description: "Monthly fee for teacher platform access",
    },
    {
      icon: Clock,
      label: "Free Trial Period",
      value: `${settings?.trialPeriodDays || 7} days`,
      description: "Teacher subscription trial period",
    },
    {
      icon: Database,
      label: "Storage Provider",
      value: settings?.storageProvider || "local",
      description: "File storage backend",
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Platform Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {items.map((item) => (
            <div key={item.label} className="flex items-center justify-between border-b pb-4 last:border-0">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-muted p-2">
                  <item.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">{item.label}</p>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
              <span className="text-lg font-semibold">{item.value}</span>
            </div>
          ))}
          <p className="text-sm text-muted-foreground">
            These settings are configured via environment variables. Update .env.local to change them.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
