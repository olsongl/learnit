"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatPrice } from "@/lib/utils";
import { CreditCard, Receipt, ExternalLink } from "lucide-react";

// ---------- Mock data ----------

interface Subscription {
  id: string;
  courseName: string;
  price: number;
  nextBillingDate: string;
  status: "active" | "cancelled" | "past_due";
}

interface PaymentRecord {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: "completed" | "pending" | "failed" | "refunded";
  receiptUrl: string;
}

const MOCK_SUBSCRIPTIONS: Subscription[] = [
  {
    id: "sub_1",
    courseName: "Advanced React Patterns",
    price: 1999,
    nextBillingDate: "Apr 15, 2026",
    status: "active",
  },
  {
    id: "sub_2",
    courseName: "Node.js Microservices",
    price: 2499,
    nextBillingDate: "Apr 22, 2026",
    status: "active",
  },
];

const MOCK_PAYMENTS: PaymentRecord[] = [
  {
    id: "pay_1",
    date: "Mar 15, 2026",
    description: "Advanced React Patterns - Monthly",
    amount: 1999,
    status: "completed",
    receiptUrl: "#",
  },
  {
    id: "pay_2",
    date: "Mar 10, 2026",
    description: "UX Design Fundamentals - One-time",
    amount: 4999,
    status: "completed",
    receiptUrl: "#",
  },
  {
    id: "pay_3",
    date: "Feb 22, 2026",
    description: "Node.js Microservices - Monthly",
    amount: 2499,
    status: "completed",
    receiptUrl: "#",
  },
  {
    id: "pay_4",
    date: "Feb 15, 2026",
    description: "Advanced React Patterns - Monthly",
    amount: 1999,
    status: "completed",
    receiptUrl: "#",
  },
  {
    id: "pay_5",
    date: "Jan 15, 2026",
    description: "Advanced React Patterns - Monthly",
    amount: 1999,
    status: "refunded",
    receiptUrl: "#",
  },
];

// ---------- Helpers ----------

const STATUS_BADGE_VARIANT: Record<
  string,
  "success" | "warning" | "destructive" | "secondary"
> = {
  active: "success",
  completed: "success",
  cancelled: "secondary",
  past_due: "warning",
  pending: "warning",
  failed: "destructive",
  refunded: "secondary",
};

// ---------- Page ----------

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">Billing</h1>
        <p className="mt-1 text-muted-foreground">
          Manage subscriptions and view payment history.
        </p>
      </div>

      {/* Active Subscriptions */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Active Subscriptions</CardTitle>
          </div>
          <CardDescription>
            Monthly course subscriptions currently active.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {MOCK_SUBSCRIPTIONS.length === 0 ? (
            <EmptyState
              icon={CreditCard}
              title="No active subscriptions"
              description="You don't have any active monthly subscriptions."
              className="py-8"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-3 pr-4 font-medium">Course</th>
                    <th className="pb-3 pr-4 font-medium">Price</th>
                    <th className="hidden pb-3 pr-4 font-medium sm:table-cell">
                      Next Billing
                    </th>
                    <th className="pb-3 pr-4 font-medium">Status</th>
                    <th className="pb-3 font-medium">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_SUBSCRIPTIONS.map((sub) => (
                    <tr key={sub.id} className="border-b last:border-0">
                      <td className="py-3 pr-4 font-medium">
                        {sub.courseName}
                      </td>
                      <td className="py-3 pr-4">
                        {formatPrice(sub.price)}/mo
                      </td>
                      <td className="hidden py-3 pr-4 sm:table-cell">
                        {sub.nextBillingDate}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant={STATUS_BADGE_VARIANT[sub.status]}>
                          {sub.status.replace("_", " ")}
                        </Badge>
                      </td>
                      <td className="py-3 text-right">
                        <Button size="sm" variant="outline">
                          Manage
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Payment History</CardTitle>
          </div>
          <CardDescription>
            All past transactions and receipts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {MOCK_PAYMENTS.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="No payment history"
              description="Your payment history will appear here after your first purchase."
              className="py-8"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-3 pr-4 font-medium">Date</th>
                    <th className="pb-3 pr-4 font-medium">Description</th>
                    <th className="pb-3 pr-4 font-medium">Amount</th>
                    <th className="hidden pb-3 pr-4 font-medium sm:table-cell">
                      Status
                    </th>
                    <th className="pb-3 font-medium">
                      <span className="sr-only">Receipt</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_PAYMENTS.map((payment) => (
                    <tr key={payment.id} className="border-b last:border-0">
                      <td className="py-3 pr-4 whitespace-nowrap">
                        {payment.date}
                      </td>
                      <td className="py-3 pr-4">{payment.description}</td>
                      <td className="py-3 pr-4">
                        {formatPrice(payment.amount)}
                      </td>
                      <td className="hidden py-3 pr-4 sm:table-cell">
                        <Badge
                          variant={STATUS_BADGE_VARIANT[payment.status]}
                        >
                          {payment.status}
                        </Badge>
                      </td>
                      <td className="py-3 text-right">
                        <Button size="sm" variant="ghost" asChild>
                          <a
                            href={payment.receiptUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4" />
                            <span className="sr-only">View receipt</span>
                          </a>
                        </Button>
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
