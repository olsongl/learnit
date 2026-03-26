"use client";

import { GraduationCap, Award } from "lucide-react";
import { cn } from "@/lib/utils";

interface RoleSelectorProps {
  value: "student" | "teacher";
  onChange: (role: "student" | "teacher") => void;
}

const roles = [
  {
    value: "student" as const,
    label: "Student",
    description: "Browse and enroll in courses",
    icon: GraduationCap,
  },
  {
    value: "teacher" as const,
    label: "Teacher",
    description: "Create and sell courses",
    icon: Award,
  },
];

export function RoleSelector({ value, onChange }: RoleSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {roles.map((role) => {
        const Icon = role.icon;
        const isSelected = value === role.value;

        return (
          <button
            key={role.value}
            type="button"
            onClick={() => onChange(role.value)}
            className={cn(
              "flex flex-col items-center gap-2 rounded-lg border-2 p-4 text-center transition-all",
              isSelected
                ? "border-primary bg-primary/5 text-primary"
                : "border-muted bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
            )}
          >
            <Icon className="h-6 w-6" />
            <span className="text-sm font-semibold">{role.label}</span>
            <span className="text-xs leading-tight opacity-80">
              {role.description}
            </span>
          </button>
        );
      })}
    </div>
  );
}
