"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logOut } from "@/app/dashboard/actions/logout";
import {
  MenuIcon,
  XIcon,
  ArrowRightIcon,
  SparklesIcon,
  UserIcon,
  LogOutIcon,
  LayoutDashboardIcon,
  PlusIcon,
} from "lucide-react";

export function LandingNavbar() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const userInitial = session?.user?.name
    ? session.user.name.charAt(0).toUpperCase()
    : session?.user?.email
      ? session.user.email.charAt(0).toUpperCase()
      : null;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/85 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link
          href={session?.user ? "/dashboard" : "/"}
          className="flex items-center gap-2.5 transition-opacity hover:opacity-90"
        >
          <Image
            src="/kova-icon.png"
            alt="Kova Icon"
            width={32}
            height={32}
            className="size-8 rounded-lg object-contain shadow-2xs"
            priority
          />
          <div className="flex flex-col">
            <Image
              src="/kova-logo-black.png"
              alt="Kova - Personal AI Travel Agent"
              width={96}
              height={26}
              className="h-5 w-auto object-contain dark:hidden"
              priority
            />
            <Image
              src="/kova-logo.png"
              alt="Kova - Personal AI Travel Agent"
              width={96}
              height={26}
              className="hidden h-5 w-auto object-contain dark:block"
              priority
            />
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <a
            href="#features"
            className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            How it Works
          </a>
          <a
            href="#itineraries"
            className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Sample Itineraries
          </a>
          <a
            href="#faq"
            className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            FAQ
          </a>
        </nav>

        {/* Desktop Right Actions */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />

          {session?.user ? (
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                className="h-9 px-4 text-xs font-semibold cursor-pointer shadow-xs gap-1.5"
                nativeButton={false}
                render={<Link href="/dashboard" />}
              >
                <LayoutDashboardIcon className="size-3.5" />
                Dashboard
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger className="focus:outline-none">
                  <Avatar size="sm" className="cursor-pointer hover:ring-2 hover:ring-border transition-all">
                    <AvatarFallback className="bg-muted text-foreground font-semibold text-xs border border-border/60">
                      {userInitial ? userInitial : <UserIcon className="size-3.5" />}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-2">
                  <DropdownMenuLabel className="font-normal p-2">
                    <p className="text-sm font-semibold truncate text-foreground">
                      {session.user.name || "Logged In User"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{session.user.email}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem nativeButton={false} render={<Link href="/create-trip" />}>
                    <PlusIcon className="size-3.5 mr-2 text-muted-foreground" />
                    Create New Trip
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <form action={logOut} className="w-full">
                    <button type="submit" className="w-full text-left">
                      <DropdownMenuItem variant="destructive" className="cursor-pointer">
                        <LogOutIcon className="size-3.5 mr-2" />
                        Log out
                      </DropdownMenuItem>
                    </button>
                  </form>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="h-9 px-3.5 text-xs font-medium cursor-pointer"
                nativeButton={false}
                render={<Link href="/login" />}
              >
                Log in
              </Button>
              <Button
                size="sm"
                className="h-9 px-4 text-xs font-semibold cursor-pointer shadow-xs gap-1.5"
                nativeButton={false}
                render={<Link href="/signup" />}
              >
                Sign Up
                <ArrowRightIcon className="size-3.5" />
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Menu Actions */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon-xs"
            className="size-9 cursor-pointer text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <XIcon className="size-5" /> : <MenuIcon className="size-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-background px-4 pt-3 pb-6 space-y-4 shadow-lg animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-3 pt-2">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-foreground hover:text-primary transition-colors py-1"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-foreground hover:text-primary transition-colors py-1"
            >
              How it Works
            </a>
            <a
              href="#itineraries"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-foreground hover:text-primary transition-colors py-1"
            >
              Sample Itineraries
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-foreground hover:text-primary transition-colors py-1"
            >
              FAQ
            </a>
          </nav>

          <div className="pt-3 border-t border-border flex flex-col gap-2.5">
            {session?.user ? (
              <>
                <Button
                  size="lg"
                  className="w-full justify-center text-sm font-semibold cursor-pointer gap-2 shadow-xs"
                  nativeButton={false}
                  render={<Link href="/dashboard" />}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LayoutDashboardIcon className="size-4" />
                  Go to Dashboard
                </Button>
                <form action={logOut} className="w-full">
                  <Button
                    variant="outline"
                    size="lg"
                    type="submit"
                    className="w-full justify-center text-sm font-medium cursor-pointer text-destructive border-destructive/30"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LogOutIcon className="size-4 mr-2" />
                    Log out
                  </Button>
                </form>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full justify-center text-sm font-medium cursor-pointer"
                  nativeButton={false}
                  render={<Link href="/login" />}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Log in
                </Button>
                <Button
                  size="lg"
                  className="w-full justify-center text-sm font-semibold cursor-pointer gap-2 shadow-xs"
                  nativeButton={false}
                  render={<Link href="/signup" />}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <SparklesIcon className="size-4" />
                  Sign Up Free
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
