"use client";

import { useState } from "react";
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
import { Package, Plus } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";

export default function TeacherBundlesPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Course Bundles</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Bundle
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>New Bundle</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Bundle Name</Label>
              <Input placeholder="e.g., Full Stack Mastery Pack" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea placeholder="Describe what's included..." rows={3} />
            </div>
            <div>
              <Label>Bundle Price (cents)</Label>
              <Input type="number" placeholder="9999" />
            </div>
            <p className="text-sm text-muted-foreground">
              Select courses to include after creating the bundle.
            </p>
            <div className="flex gap-2">
              <Button>Create Bundle</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <EmptyState
        icon={<Package className="h-12 w-12" />}
        title="No bundles yet"
        description="Create course bundles to offer discounted packages to students."
      />
    </div>
  );
}
