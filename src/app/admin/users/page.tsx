"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Pagination } from "@/components/shared/Pagination";
import { Search, Shield, Ban } from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (search) params.set("search", search);
    if (roleFilter) params.set("role", roleFilter);
    fetch(`/api/admin/users?${params}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setUsers(d.data?.items || []);
          setTotal(d.data?.total || 0);
        }
      })
      .finally(() => setLoading(false));
  }, [page, search, roleFilter]);

  async function toggleSuspend(userId: string, currentlySuspended: boolean) {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ suspended: !currentlySuspended }),
    });
    if ((await res.json()).success) {
      setUsers(
        users.map((u) =>
          u._id === userId ? { ...u, suspended: !currentlySuspended } : u
        )
      );
    }
  }

  async function changeRole(userId: string, newRole: string) {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    if ((await res.json()).success) {
      setUsers(users.map((u) => (u._id === userId ? { ...u, role: newRole } : u)));
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">User Management</h1>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {["", "student", "teacher", "admin"].map((r) => (
            <Button
              key={r || "all"}
              variant={roleFilter === r ? "default" : "outline"}
              size="sm"
              onClick={() => { setRoleFilter(r); setPage(1); }}
            >
              {r || "All"}
            </Button>
          ))}
        </div>
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
                    <th className="px-4 py-3 text-left font-medium">User</th>
                    <th className="px-4 py-3 text-left font-medium">Role</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-left font-medium">Joined</th>
                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id} className="border-b">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium">
                            {user.name?.[0] || "?"}
                          </div>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          className="rounded border px-2 py-1 text-xs"
                          value={user.role}
                          onChange={(e) => changeRole(user._id, e.target.value)}
                        >
                          <option value="student">Student</option>
                          <option value="teacher">Teacher</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        {user.suspended ? (
                          <Badge variant="destructive">Suspended</Badge>
                        ) : (
                          <Badge variant="default">Active</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant={user.suspended ? "outline" : "destructive"}
                          size="sm"
                          onClick={() => toggleSuspend(user._id, user.suspended)}
                        >
                          {user.suspended ? (
                            <>
                              <Shield className="mr-1 h-3 w-3" /> Unsuspend
                            </>
                          ) : (
                            <>
                              <Ban className="mr-1 h-3 w-3" /> Suspend
                            </>
                          )}
                        </Button>
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
        <Pagination
          currentPage={page}
          totalPages={Math.ceil(total / 20)}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
