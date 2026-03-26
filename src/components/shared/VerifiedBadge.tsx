import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface VerifiedBadgeProps {
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { icon: "h-3.5 w-3.5", text: "text-xs" },
  md: { icon: "h-4 w-4", text: "text-sm" },
  lg: { icon: "h-5 w-5", text: "text-base" },
};

export function VerifiedBadge({
  size = "md",
  showLabel = true,
  className,
}: VerifiedBadgeProps) {
  const { icon, text } = sizeMap[size];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400",
        className
      )}
    >
      <BadgeCheck className={icon} />
      {showLabel && (
        <span className={cn("font-medium", text)}>Verified</span>
      )}
    </span>
  );
}
