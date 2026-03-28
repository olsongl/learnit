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
import { formatPrice } from "@/lib/utils";
import { DollarSign, CreditCard, TrendingUp, ExternalLink } from "lucide-react";

export default function TeacherEarningsPage() {
  const [connectStatus, setConnectStatus] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [statusRes, txRes] = await Promise.all([
          fetch("/api/stripe/connect/status"),
          fetch("/api/admin/transactions?limit=20"),
        ]);
        const statusData = await statusRes.json();
        const txData = await txRes.json();
        if (statusData.success) setConnectStatus(statusData.data);
        if (txData.success) setTransactions(txData.data?.items || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleOnboard() {
    const res = await fetch("/api/stripe/connect/onboard", { method: "POST" });
    const data = await res.json();
    if (data.success && data.data?.url) {
      window.location.href = data.data.url;
    }
  }

  if (loading) return <LoadingSpinner />;

  const totalEarnings = transactions.reduce((s, t) => s + (t.teacherPayout || 0), 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Earnings</h1>

      {!connectStatus?.hasAccount && (
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
          <CardContent className="flex items-center gap-4 p-4">
            <CreditCard className="h-8 w-8 text-blue-600" />
            <div className="flex-1">
              <p className="font-semibold">Set Up Stripe Payments</p>
              <p className="text-sm text-muted-foreground">
                Connect your Stripe account to receive payouts from course sales.
              </p>
            </div>
            <Button onClick={handleOnboard}>Connect Stripe</Button>
          </CardContent>
        </Card>
      )}

      {connectStatus?.hasAccount && !connectStatus?.chargesEnabled && (
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950">
          <CardContent className="flex items-center gap-4 p-4">
            <CreditCard className="h-8 w-8 text-amber-600" />
            <div className="flex-1">
              <p className="font-semibold">Complete Stripe Setup</p>
              <p className="text-sm text-muted-foreground">
                Your Stripe account needs additional information.
              </p>
            </div>
            <Button variant="outline" onClick={handleOnboard}>
              Complete Setup
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-green-100 p-2.5 dark:bg-green-900">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{formatPrice(totalEarnings)}</p>
              <p className="text-xs text-muted-foreground">Total Earnings</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-primary/10 p-2.5">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{transactions.length}</p>
              <p className="text-xs text-muted-foreground">Total Sales</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-primary/10 p-2.5">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {connectStatus?.chargesEnabled ? "Active" : "Inactive"}
              </p>
              <p className="text-xs text-muted-foreground">Payout Status</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No transactions yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="pb-2 text-left font-medium">Date</th>
                    <th className="pb-2 text-left font-medium">Course</th>
                    <th className="pb-2 text-left font-medium">Student</th>
                    <th className="pb-2 text-right font-medium">Amount</th>
                    <th className="pb-2 text-right font-medium">Your Payout</th>
                    <th className="pb-2 text-right font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx._id} className="border-b">
                      <td className="py-2">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-2">{tx.courseId?.title || "—"}</td>
                      <td className="py-2">{tx.studentId?.name || "—"}</td>
                      <td className="py-2 text-right">{formatPrice(tx.amount)}</td>
                      <td className="py-2 text-right font-medium text-green-600">
                        {formatPrice(tx.teacherPayout)}
                      </td>
                      <td className="py-2 text-right">
                        <Badge variant={tx.status === "completed" ? "default" : "secondary"}>
                          {tx.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
