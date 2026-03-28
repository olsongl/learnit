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
import { Textarea } from "@/components/ui/textarea";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Save, User } from "lucide-react";

export default function TeacherProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    name: "",
    bio: "",
    headline: "",
    linkedIn: "",
    website: "",
  });

  useEffect(() => {
    fetch("/api/users/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setUser(d.data);
          setForm({
            name: d.data.name || "",
            bio: d.data.teacherProfile?.bio || "",
            headline: d.data.teacherProfile?.headline || "",
            linkedIn: d.data.teacherProfile?.linkedIn || "",
            website: d.data.teacherProfile?.website || "",
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    setMessage("");
    const res = await fetch("/api/users/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (data.success) {
      setMessage("Profile updated successfully!");
    } else {
      setMessage(data.error || "Failed to update");
    }
    setSaving(false);
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Public Profile</h1>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              {user?.avatar ? (
                <img src={user.avatar} alt="" className="h-full w-full rounded-full object-cover" />
              ) : (
                <User className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            <div>
              <p className="font-medium">{user?.name}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          <div>
            <Label>Display Name</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div>
            <Label>Headline</Label>
            <Input
              value={form.headline}
              onChange={(e) => setForm({ ...form, headline: e.target.value })}
              placeholder="e.g., Senior React Developer & Educator"
            />
          </div>

          <div>
            <Label>Bio</Label>
            <Textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="Tell students about yourself..."
              rows={5}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>LinkedIn URL</Label>
              <Input
                value={form.linkedIn}
                onChange={(e) => setForm({ ...form, linkedIn: e.target.value })}
                placeholder="https://linkedin.com/in/..."
              />
            </div>
            <div>
              <Label>Website</Label>
              <Input
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>

          {message && (
            <p className={`text-sm ${message.includes("success") ? "text-green-600" : "text-red-600"}`}>
              {message}
            </p>
          )}

          <Button onClick={handleSave} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : "Save Profile"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
