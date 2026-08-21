"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  FileText,
  LayoutDashboard,
  LogOut,
  User,
  Menu,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Navbar() {
  const { user, isLoading, isGuest, signOut } = useAuth();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isLoggedIn = !!user;

  const getInitials = () => {
    if (isGuest) return "G";
    const email = user?.email ?? "";
    return email.charAt(0).toUpperCase() || "U";
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex items-center justify-center w-8 h-8 bg-indigo-600 rounded-lg group-hover:bg-indigo-500 transition-colors">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">
              ResumeForge
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {!isLoggedIn && !isLoading && (
              <>
                <Link
                  href="#features"
                  className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg"
                >
                  Features
                </Link>
                <Link
                  href="#templates"
                  className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg"
                >
                  Templates
                </Link>
              </>
            )}

            {isLoggedIn && (
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {isLoading ? (
              <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
            ) : isLoggedIn ? (
              /* Logged-in: avatar dropdown */
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                  <Avatar className="w-8 h-8 border border-border">
                    <AvatarImage
                      src={
                        user?.user_metadata?.avatar_url ||
                        user?.user_metadata?.picture ||
                        user?.user_metadata?.avatar ||
                        user?.user_metadata?.photoUrl
                      }
                      alt="Profile"
                      referrerPolicy="no-referrer"
                    />
                    <AvatarFallback className="bg-indigo-600 text-white text-xs font-medium">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium truncate">
                      {isGuest ? "Guest User" : user?.email ?? "User"}
                    </p>
                    {isGuest && (
                      <p className="text-xs text-muted-foreground">
                        Sign up to save progress
                      </p>
                    )}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => router.push("/dashboard")}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </DropdownMenuItem>
                  {!isGuest && (
                    <DropdownMenuItem
                      onClick={() => router.push("/profile")}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <User className="w-4 h-4" />
                      Profile & Settings
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={signOut}
                    variant="destructive"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              /* Logged-out: login + CTA */
              <div className="hidden md:flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors shadow-sm"
                >
                  Get Started Free
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border/40 py-4 space-y-2">
            {!isLoggedIn && !isLoading && (
              <>
                <Link
                  href="#features"
                  className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Features
                </Link>
                <Link
                  href="#templates"
                  className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Templates
                </Link>
                <div className="pt-2 space-y-2">
                  <Link
                    href="/login"
                    className="block w-full text-center px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Get Started Free
                  </Link>
                </div>
              </>
            )}
            {isLoggedIn && (
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
