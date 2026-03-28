"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Pagination } from "@/components/shared/Pagination";
import { formatPrice } from "@/lib/utils";
import { DollarSign } from "lucide-react";

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (statusFilter) params.set("status", statusFilter);
    fetch(`/api/admin/transactions?${params}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setTransactions(d.data?.items || []);
          setTotal(d.data?.total || 0);
          setSummary(d.data?.summary);
        }
      })
      .finally(() => setLoading(false));
  }, [page, statusFilter]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Transactions</h1>

      {summary && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-lg bg-green-100 p-2.5 dark:bg-green-900">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatPrice(summary.totalAmount || 0)}</p>
                <p className="text-xs text-muted-foreground">Total Volume</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-lg bg-primary/10 p-2.5">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatPrice(summary.totalPlatformFee || 0)}</p>
                <p className="text-xs text-muted-foreground">Platform Revenue</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-lg bg-blue-100 p-2.5 dark:bg-blue-900">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatPrice(summary.totalTeacherPayout || 0)}</p>
                <p className="text-xs text-muted-foreground">Teacher Payouts</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex gap-2">
        {["", "pending", "completed", "failed", "refunded"].map((s) => (
          <Button
            key={s || "all"}
            variant={statusFilter === s ? "default" : "outline"}
            size="sm"
            onClick={() => { setStatusFilter(s); setPage(1); }}
          >
            {s || "All"}
          </Button>
        ))}
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
                    <th className="px-4 py-3 text-left font-medium">Date</th>
                    <th className="px-4 py-3 text-left font-medium">Student</th>
                    <th className="px-4 py-3 text-left font-medium">Teacher</th>
                    <th className="px-4 py-3 text-left font-medium">Course</th>
                    <th className="px-4 py-3 text-right font-medium">Amount</th>
                    <th className="px-4 py-3 text-right font-medium">Platform Fee</th>
                    <th className="px-4 py-3 text-right font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx._id} className="border-b">
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">{tx.studentId?.name || "—"}</td>
                      <td className="px-4 py-3">{tx.teacherId?.name || "—"}</td>
                      <td className="px-4 py-3">{tx.courseId?.title || "—"}</td>
                      <td className="px-4 py-3 text-right">{formatPrice(tx.amount)}</td>
                      <td className="px-4 py-3 text-right">{formatPrice(tx.platformFee)}</td>
                      <td className="px-4 py-3 text-right">
                        <Badge
                          variant={
                            tx.status === "completed"
                              ? "default"
                              : tx.status === "failed"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {tx.status}
                        </Badge>
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
