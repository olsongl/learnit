"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  Home,
  Search,
  BookOpen,
  LayoutDashboard,
  User,
} from "lucide-react";

export function MobileNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const links = [
    { label: "Home", href: "/", icon: Home },
    { label: "Explore", href: "/courses", icon: Search },
    { label: "Categories", href: "/categories", icon: BookOpen },
    {
      label: "Dashboard",
      href: session ? "/dashboard" : "/signin",
      icon: LayoutDashboard,
    },
    {
      label: "Profile",
      href: session ? "/dashboard/settings" : "/signin",
      icon: User,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-around h-16">
        {links.map((link) => {
          const isActive =
            pathname === link.href ||
            (link.href !== "/" && pathname.startsWith(link.href));

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 text-xs transition-colors min-w-[44px] min-h-[44px] justify-center",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <link.icon className="h-5 w-5" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
