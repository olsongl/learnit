"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Plus, Trash2, FolderTree, ChevronRight } from "lucide-react";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", icon: "", parentId: "" });
  const [saving, setSaving] = useState(false);

  function loadCategories() {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setCategories(d.data || []);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadCategories(); }, []);

  async function handleCreate() {
    setSaving(true);
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        parentId: form.parentId || null,
      }),
    });
    if ((await res.json()).success) {
      setForm({ name: "", description: "", icon: "", parentId: "" });
      setShowForm(false);
      loadCategories();
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      loadCategories();
    } else {
      alert(data.error || "Cannot delete category");
    }
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categories</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>New Category</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g., Technology"
                />
              </div>
              <div>
                <Label>Parent Category (optional)</Label>
                <select
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  value={form.parentId}
                  onChange={(e) => setForm({ ...form, parentId: e.target.value })}
                >
                  <option value="">None (top-level)</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Brief description"
              />
            </div>
            <div>
              <Label>Icon (emoji or icon name)</Label>
              <Input
                value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
                placeholder="e.g., laptop"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreate} disabled={saving || !form.name}>
                {saving ? "Creating..." : "Create Category"}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {categories.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-12">
              <FolderTree className="h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">No categories yet.</p>
            </CardContent>
          </Card>
        ) : (
          categories.map((cat) => (
            <Card key={cat._id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{cat.icon || "📁"}</span>
                    <div>
                      <p className="font-medium">{cat.name}</p>
                      {cat.description && (
                        <p className="text-sm text-muted-foreground">{cat.description}</p>
                      )}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {cat.children?.length || 0} subcategories
                    </Badge>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(cat._id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
                {cat.children?.length > 0 && (
                  <div className="mt-3 ml-8 space-y-2">
                    {cat.children.map((sub: any) => (
                      <div key={sub._id} className="flex items-center justify-between rounded-md border px-3 py-2">
                        <div className="flex items-center gap-2">
                          <ChevronRight className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{sub.name}</span>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(sub._id)}>
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
