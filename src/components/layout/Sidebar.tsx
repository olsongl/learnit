"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BookOpen,
  Heart,
  Settings,
  CreditCard,
  GraduationCap,
  Award,
  DollarSign,
  Package,
  UserCircle,
  Users,
  BarChart3,
  FolderTree,
  Receipt,
  Sliders,
  BadgeCheck,
  FileText,
} from "lucide-react";

interface SidebarLink {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const studentLinks: SidebarLink[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "My Courses", href: "/dashboard/courses", icon: BookOpen },
  { label: "Wishlist", href: "/dashboard/wishlist", icon: Heart },
  { label: "Billing", href: "/dashboard/billing", icon: CreditCard },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

const teacherLinks: SidebarLink[] = [
  { label: "Overview", href: "/teacher", icon: LayoutDashboard },
  { label: "My Courses", href: "/teacher/courses", icon: GraduationCap },
  { label: "Credentials", href: "/teacher/credentials", icon: Award },
  { label: "Earnings", href: "/teacher/earnings", icon: DollarSign },
  { label: "Subscription", href: "/teacher/subscription", icon: CreditCard },
  { label: "Bundles", href: "/teacher/bundles", icon: Package },
  { label: "Profile", href: "/teacher/profile", icon: UserCircle },
];

const adminLinks: SidebarLink[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Credentials", href: "/admin/credentials", icon: BadgeCheck },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Courses", href: "/admin/courses", icon: FileText },
  { label: "Categories", href: "/admin/categories", icon: FolderTree },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "Transactions", href: "/admin/transactions", icon: Receipt },
  { label: "Settings", href: "/admin/settings", icon: Sliders },
];

interface SidebarProps {
  variant: "student" | "teacher" | "admin";
}

export function Sidebar({ variant }: SidebarProps) {
  const pathname = usePathname();

  const links =
    variant === "admin"
      ? adminLinks
      : variant === "teacher"
        ? teacherLinks
        : studentLinks;

  const title =
    variant === "admin"
      ? "Admin Panel"
      : variant === "teacher"
        ? "Teacher Dashboard"
        : "Student Dashboard";

  return (
    <aside className="hidden md:flex w-64 flex-col border-r bg-background min-h-[calc(100vh-4rem)]">
      <div className="p-6">
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      <nav className="flex-1 px-3 space-y-1">
        {links.map((link) => {
          const isActive =
            pathname === link.href ||
            (link.href !== `/${variant === "student" ? "dashboard" : variant}` &&
              pathname.startsWith(link.href));

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
