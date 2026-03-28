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
import { Award, Plus, Trash2, AlertCircle } from "lucide-react";

const CRED_TYPES = ["certificate", "diploma", "license", "resume", "other"];

export default function TeacherCredentialsPage() {
  const [credentials, setCredentials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    type: "certificate",
    title: "",
    issuingOrganization: "",
    issueDate: "",
    expiryDate: "",
    fileUrl: "",
  });

  useEffect(() => {
    fetch("/api/credentials/mine")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setCredentials(d.data || []);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit() {
    setSaving(true);
    try {
      const res = await fetch("/api/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setCredentials([data.data, ...credentials]);
        setShowForm(false);
        setForm({ type: "certificate", title: "", issuingOrganization: "", issueDate: "", expiryDate: "", fileUrl: "" });
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/credentials/${id}`, { method: "DELETE" });
    if ((await res.json()).success) {
      setCredentials(credentials.filter((c) => c._id !== id));
    }
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Credentials</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Credential
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Submit New Credential</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Type</Label>
                <select
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  {CRED_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Title</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g., AWS Solutions Architect"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Issuing Organization</Label>
                <Input
                  value={form.issuingOrganization}
                  onChange={(e) => setForm({ ...form, issuingOrganization: e.target.value })}
                  placeholder="e.g., Amazon Web Services"
                />
              </div>
              <div>
                <Label>Issue Date</Label>
                <Input
                  type="date"
                  value={form.issueDate}
                  onChange={(e) => setForm({ ...form, issueDate: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>File URL (upload your credential document)</Label>
              <Input
                value={form.fileUrl}
                onChange={(e) => setForm({ ...form, fileUrl: e.target.value })}
                placeholder="URL to uploaded document"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSubmit} disabled={saving || !form.title || !form.issuingOrganization}>
                {saving ? "Submitting..." : "Submit for Review"}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {credentials.length === 0 && !showForm ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <Award className="h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">No credentials submitted yet.</p>
            <Button onClick={() => setShowForm(true)}>Submit Your First Credential</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {credentials.map((cred) => (
            <Card key={cred._id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-primary/10 p-2.5">
                    <Award className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{cred.title}</p>
                      <Badge
                        variant={
                          cred.verifiedByAdmin
                            ? "default"
                            : cred.reviewedAt
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {cred.verifiedByAdmin
                          ? "Verified"
                          : cred.reviewedAt
                            ? "Rejected"
                            : "Pending Review"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {cred.issuingOrganization} — {cred.type}
                    </p>
                    {cred.adminNotes && !cred.verifiedByAdmin && (
                      <div className="mt-1 flex items-center gap-1 text-sm text-amber-600">
                        <AlertCircle className="h-3 w-3" />
                        <span>Admin notes: {cred.adminNotes}</span>
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(cred._id)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
