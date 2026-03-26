"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, formatPrice } from "@/lib/utils";
import type { PricingModel, CourseTier } from "@/types";
import { Check } from "lucide-react";

interface PricingDisplayProps {
  pricingModel: PricingModel;
  price: number;
  tiers?: CourseTier[];
  className?: string;
}

export function PricingDisplay({
  pricingModel,
  price,
  tiers = [],
  className,
}: PricingDisplayProps) {
  if (pricingModel === "free") {
    return <FreePricing className={className} />;
  }

  if (pricingModel === "one_time") {
    return <OneTimePricing price={price} className={className} />;
  }

  if (pricingModel === "monthly") {
    return <MonthlyPricing price={price} className={className} />;
  }

  if (pricingModel === "tiered") {
    return <TieredPricing tiers={tiers} className={className} />;
  }

  return null;
}

function FreePricing({ className }: { className?: string }) {
  return (
    <Card className={cn("border-emerald-200 dark:border-emerald-800", className)}>
      <CardContent className="p-6 text-center">
        <Badge variant="success" className="mb-4 text-base px-4 py-1">
          Free
        </Badge>
        <p className="text-sm text-muted-foreground mb-6">
          Access all course content at no cost.
        </p>
        <Button size="lg" className="w-full bg-emerald-600 hover:bg-emerald-700">
          Enroll Free
        </Button>
      </CardContent>
    </Card>
  );
}

function OneTimePricing({
  price,
  className,
}: {
  price: number;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardContent className="p-6 text-center">
        <div className="mb-4">
          <span className="text-4xl font-bold">{formatPrice(price)}</span>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          One-time payment. Lifetime access.
        </p>
        <Button size="lg" className="w-full">
          Buy Now
        </Button>
        <p className="text-xs text-muted-foreground mt-3">
          30-day money-back guarantee
        </p>
      </CardContent>
    </Card>
  );
}

function MonthlyPricing({
  price,
  className,
}: {
  price: number;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardContent className="p-6 text-center">
        <div className="mb-4">
          <span className="text-4xl font-bold">{formatPrice(price)}</span>
          <span className="text-muted-foreground">/mo</span>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Cancel anytime. Access while subscribed.
        </p>
        <Button size="lg" className="w-full">
          Subscribe
        </Button>
        <p className="text-xs text-muted-foreground mt-3">
          Billed monthly. Cancel anytime.
        </p>
      </CardContent>
    </Card>
  );
}

function TieredPricing({
  tiers,
  className,
}: {
  tiers: CourseTier[];
  className?: string;
}) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {tiers.map((tier, index) => {
        const isPopular = index === 1;
        return (
          <Card
            key={tier.name}
            className={cn(
              "relative",
              isPopular && "border-primary shadow-md"
            )}
          >
            {isPopular && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                Most Popular
              </Badge>
            )}
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-lg">{tier.name}</CardTitle>
              <div className="mt-2">
                <span className="text-3xl font-bold">
                  {formatPrice(tier.price)}
                </span>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="space-y-2 mb-6">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                size="lg"
                variant={isPopular ? "default" : "outline"}
                className="w-full"
              >
                Select Plan
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
