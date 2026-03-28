"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatPrice } from "@/lib/utils";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

const DIFFICULTIES = ["beginner", "intermediate", "advanced", "all_levels"];
const PRICING_MODELS = ["free", "one_time", "monthly", "tiered"];

export default function CreateCoursePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [breakdown, setBreakdown] = useState<any>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    shortDescription: "",
    category: "",
    subCategory: "",
    difficulty: "all_levels",
    language: "English",
    tags: "",
    pricingModel: "free",
    price: 0,
  });

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setCategories(d.data || []);
      });
  }, []);

  useEffect(() => {
    if (form.pricingModel !== "free" && form.price > 0) {
      fetch(`/api/stripe/price-breakdown?amount=${form.price}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.success) setBreakdown(d.data);
        });
    } else {
      setBreakdown(null);
    }
  }, [form.price, form.pricingModel]);

  const selectedParent = categories.find((c) => c._id === form.category);

  async function handleCreate() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          tags: form.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          price: form.pricingModel === "free" ? 0 : form.price,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Failed to create course");
        return;
      }
      router.push(`/teacher/courses/${data.data._id}/edit`);
    } catch {
      setError("Failed to create course");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">Create New Course</h1>

      {/* Step indicator */}
      <div className="flex gap-2">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`flex-1 h-2 rounded-full ${s <= step ? "bg-primary" : "bg-muted"}`}
          />
        ))}
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
          {error}
        </div>
      )}

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Course Title *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g., Advanced React Patterns"
              />
            </div>
            <div>
              <Label htmlFor="shortDesc">Short Description</Label>
              <Input
                id="shortDesc"
                value={form.shortDescription}
                onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                placeholder="Brief summary for course cards"
                maxLength={300}
              />
            </div>
            <div>
              <Label htmlFor="description">Full Description *</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Detailed course description..."
                rows={6}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Category *</Label>
                <select
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value, subCategory: "" })}
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Subcategory</Label>
                <select
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  value={form.subCategory}
                  onChange={(e) => setForm({ ...form, subCategory: e.target.value })}
                  disabled={!selectedParent?.children?.length}
                >
                  <option value="">Select subcategory</option>
                  {selectedParent?.children?.map((sub: any) => (
                    <option key={sub._id} value={sub._id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Difficulty</Label>
                <select
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  value={form.difficulty}
                  onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                >
                  {DIFFICULTIES.map((d) => (
                    <option key={d} value={d}>
                      {d.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Language</Label>
                <Input
                  value={form.language}
                  onChange={(e) => setForm({ ...form, language: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Tags (comma-separated)</Label>
              <Input
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="react, javascript, patterns"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Pricing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Pricing Model</Label>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {PRICING_MODELS.map((m) => (
                  <Button
                    key={m}
                    variant={form.pricingModel === m ? "default" : "outline"}
                    onClick={() => setForm({ ...form, pricingModel: m })}
                  >
                    {m.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  </Button>
                ))}
              </div>
            </div>
            {form.pricingModel !== "free" && (
              <div>
                <Label>
                  Price (in cents) — e.g. 4999 = $49.99
                </Label>
                <Input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: parseInt(e.target.value) || 0 })}
                  min={0}
                />
              </div>
            )}
            {breakdown && (
              <div className="rounded-md border p-4 space-y-2">
                <h4 className="font-semibold">Fee Breakdown</h4>
                <div className="flex justify-between text-sm">
                  <span>List Price</span>
                  <span>{formatPrice(breakdown.listPrice)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Stripe Fee (2.9% + $0.30)</span>
                  <span>-{formatPrice(breakdown.stripeFee)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Platform Fee (1.5%)</span>
                  <span>-{formatPrice(breakdown.platformFee)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>You Receive</span>
                  <span className="text-green-600">{formatPrice(breakdown.teacherPayout)}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Review & Create</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 text-sm">
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Title</span>
                <span className="font-medium">{form.title}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Difficulty</span>
                <span className="font-medium capitalize">{form.difficulty.replace("_", " ")}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Pricing</span>
                <span className="font-medium">
                  {form.pricingModel === "free" ? "Free" : formatPrice(form.price)}
                  {form.pricingModel === "monthly" && "/mo"}
                </span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Language</span>
                <span className="font-medium">{form.language}</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              After creating, you'll be able to add modules and lessons in the course editor.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setStep(step - 1)}
          disabled={step === 1}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        {step < 3 ? (
          <Button
            onClick={() => setStep(step + 1)}
            disabled={step === 1 && (!form.title || !form.description || !form.category)}
          >
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleCreate} disabled={saving}>
            {saving ? "Creating..." : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Create Course
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
