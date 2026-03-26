"use client";

import { useQuery } from "@tanstack/react-query";

interface CourseFilters {
  search?: string;
  category?: string;
  difficulty?: string;
  pricingModel?: string;
  minRating?: number;
  sort?: string;
  page?: number;
  limit?: number;
}

export function useCourses(filters: CourseFilters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  });

  return useQuery({
    queryKey: ["courses", filters],
    queryFn: async () => {
      const res = await fetch(`/api/courses?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch courses");
      return res.json();
    },
  });
}

export function useCourse(slug: string) {
  return useQuery({
    queryKey: ["course", slug],
    queryFn: async () => {
      const res = await fetch(`/api/courses/${slug}`);
      if (!res.ok) throw new Error("Failed to fetch course");
      return res.json();
    },
    enabled: !!slug,
  });
}

export function useEnrolledCourses() {
  return useQuery({
    queryKey: ["enrollments", "mine"],
    queryFn: async () => {
      const res = await fetch("/api/enrollments/mine");
      if (!res.ok) throw new Error("Failed to fetch enrollments");
      return res.json();
    },
  });
}
