"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import {
  Menu,
  X,
  Search,
  BookOpen,
  User,
  LogOut,
  LayoutDashboard,
  GraduationCap,
  Shield,
} from "lucide-react";

export function Navbar() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const role = (session?.user as any)?.role;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <BookOpen className="h-6 w-6 text-primary" />
          <span>Cmart</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            href="/courses"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Browse Courses
          </Link>
          <Link
            href="/categories"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Categories
          </Link>
          <Link
            href="/pricing"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Teach on Cmart
          </Link>
        </div>

        {/* Search Bar (Desktop) */}
        <div className="hidden md:flex items-center flex-1 max-w-sm mx-6">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search courses..."
              className="w-full rounded-md border border-input bg-background pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {/* Auth / User Menu */}
        <div className="flex items-center gap-3">
          {session ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 rounded-full border p-1 pr-3 hover:bg-accent transition-colors"
              >
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                  {session.user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <span className="hidden sm:block text-sm font-medium">
                  {session.user?.name?.split(" ")[0]}
                </span>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-md border bg-background shadow-lg">
                  <div className="p-2">
                    <div className="px-3 py-2 border-b mb-1">
                      <p className="text-sm font-medium">{session.user?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {session.user?.email}
                      </p>
                    </div>
                    <Link
                      href="/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-accent"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>
                    {(role === "teacher" || role === "admin") && (
                      <Link
                        href="/teacher"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-accent"
                      >
                        <GraduationCap className="h-4 w-4" />
                        Teacher Dashboard
                      </Link>
                    )}
                    {role === "admin" && (
                      <Link
                        href="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-accent"
                      >
                        <Shield className="h-4 w-4" />
                        Admin Panel
                      </Link>
                    )}
                    <Link
                      href="/dashboard/settings"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-accent"
                    >
                      <User className="h-4 w-4" />
                      Settings
                    </Link>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        signOut();
                      }}
                      className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-accent text-destructive"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/signin"
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <div className="container mx-auto px-4 py-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search courses..."
                className="w-full rounded-md border border-input bg-background pl-10 pr-4 py-2 text-sm"
              />
            </div>
            <Link
              href="/courses"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium"
            >
              Browse Courses
            </Link>
            <Link
              href="/categories"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium"
            >
              Categories
            </Link>
            <Link
              href="/pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium"
            >
              Teach on Cmart
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
