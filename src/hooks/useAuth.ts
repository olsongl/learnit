"use client";

import { useSession } from "next-auth/react";
import type { UserRole } from "@/types";

export function useAuth() {
  const { data: session, status, update } = useSession();

  const user = session?.user;
  const role = (user as any)?.role as UserRole | undefined;
  const isAuthenticated = status === "authenticated";
  const isLoading = status === "loading";

  return {
    user,
    role,
    isAuthenticated,
    isLoading,
    isStudent: role === "student",
    isTeacher: role === "teacher",
    isAdmin: role === "admin",
    session,
    update,
  };
}
