"use client";

import { useState, useCallback } from "react";

export function useStripe() {
  const [loading, setLoading] = useState(false);

  const createCheckout = useCallback(
    async (courseId: string, pricingModel?: string, tierId?: string) => {
      setLoading(true);
      try {
        const res = await fetch("/api/stripe/create-checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ courseId, pricingModel, tierId }),
        });

        if (!res.ok) throw new Error("Failed to create checkout");

        const { url } = await res.json();
        if (url) {
          window.location.href = url;
        }
      } catch (err) {
        console.error("Checkout error:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const createTeacherSubscription = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error("Failed to create subscription");

      const { url } = await res.json();
      if (url) {
        window.location.href = url;
      }
    } catch (err) {
      console.error("Subscription error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getPriceBreakdown = useCallback(async (priceInCents: number) => {
    const res = await fetch(
      `/api/stripe/price-breakdown?price=${priceInCents}`
    );
    if (!res.ok) throw new Error("Failed to get price breakdown");
    return res.json();
  }, []);

  return {
    loading,
    createCheckout,
    createTeacherSubscription,
    getPriceBreakdown,
  };
}
