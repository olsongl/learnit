"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { Award, CheckCircle2, XCircle, AlertCircle, ExternalLink } from "lucide-react";

export default function AdminCredentialsPage() {
  const [credentials, setCredentials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams({ limit: "50" });
    if (statusFilter) params.set("status", statusFilter);
    fetch(`/api/admin/credentials/pending?${params}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setCredentials(d.data?.items || []);
      })
      .finally(() => setLoading(false));
  }, [statusFilter]);

  async function handleReview(id: string, status: string) {
    setProcessing(id);
    const res = await fetch(`/api/admin/credentials/${id}/review`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, adminNotes: notes[id] || "" }),
    });
    if ((await res.json()).success) {
      setCredentials(credentials.filter((c) => c._id !== id));
    }
    setProcessing(null);
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Credential Review</h1>
        <div className="flex gap-2">
          {["", "pending", "approved", "rejected"].map((s) => (
            <Button
              key={s || "all"}
              variant={statusFilter === s ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(s)}
            >
              {s || "Pending"}
            </Button>
          ))}
        </div>
      </div>

      {credentials.length === 0 ? (
        <EmptyState
          icon={<Award className="h-12 w-12" />}
          title="No credentials to review"
          description="All caught up! Check back later."
        />
      ) : (
        <div className="space-y-4">
          {credentials.map((cred) => (
            <Card key={cred._id}>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-medium">
                      {cred.teacherId?.name?.[0] || "?"}
                    </div>
                    <div>
                      <p className="font-medium">{cred.teacherId?.name}</p>
                      <p className="text-sm text-muted-foreground">{cred.teacherId?.email}</p>
                    </div>
                  </div>
                  <Badge variant="outline">{cred.type}</Badge>
                </div>

                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Title</span>
                    <span className="font-medium">{cred.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Issuing Organization</span>
                    <span>{cred.issuingOrganization}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Issue Date</span>
                    <span>{new Date(cred.issueDate).toLocaleDateString()}</span>
                  </div>
                  {cred.fileUrl && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Document</span>
                      <a href={cred.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                        View File <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                </div>

                <div>
                  <Textarea
                    placeholder="Admin notes (optional)..."
                    value={notes[cred._id] || ""}
                    onChange={(e) => setNotes({ ...notes, [cred._id]: e.target.value })}
                    rows={2}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleReview(cred._id, "approved")}
                    disabled={processing === cred._id}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle2 className="mr-1 h-4 w-4" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleReview(cred._id, "rejected")}
                    disabled={processing === cred._id}
                  >
                    <XCircle className="mr-1 h-4 w-4" />
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleReview(cred._id, "more_info_needed")}
                    disabled={processing === cred._id}
                  >
                    <AlertCircle className="mr-1 h-4 w-4" />
                    Request Info
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
